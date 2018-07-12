/*
Date 7/10/2018
Author: Sharina V. Jones
Crawler Site: https://www.npmjs.com/package/request
Cheerio: https://www.npmjs.com/package/cheerio
JSON2csv: https://www.npmjs.com/package/json2csv
*/



//import required files
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const Json2csvParser = require('json2csv').Parser;
//Require http module for status codes
const http = require('http');

//check for the existance of a file
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

let body;
//stores shirt links
const links = [];

request('http://shirts4mike.com/shirts.php', function(error, response, body) {
    if (!error && response.statusCode === 200) {
        let $ = cheerio.load(body);
        const products = $('.products li');      

      $(products).each(function() {
          let url = $(this).children().first().attr('href');
          links.push(url);
      });      

      getShirtData(links);
    } else {
        const message = `The following error occurred ${http.STATUS_CODES[response.statusCode]}`;
        const statusCodeError = new Error(message);
        printError(statusCodeError);
    }
});

  function getShirtData(links) {
      let i = 0;  
      let shirtData = [];

      function next() {
          if (i < links.length) {
              request(`http://shirts4mike.com/${links[i]}`, function(error, response, body) {
                  if(!error && response.statusCode === 200) {
                    let $ = cheerio.load(body);

                    let price = $('.price').text();
                    price = parseInt(price.replace(/[^0-9\.]+/g, ""));
                    let title = $('.shirt-picture span img').attr("alt");
                    let url = `https://shirts4mike.com/${links[i]}`;
                    let imgUrl = $('.shirt-picture img').attr('src');
                    let time = new Date();
                    time = time.getTime();

                    shirtData.push({title, price, imgUrl, url, time});
                    i++;
                    return next();
                   } else {
                    const message = "The following error occurred " + http.STATUS_CODES[response.statusCode];
                    const statusCodeError = new Error(message);
                    printError(statusCodeError);
                  }
            }//end response function 
        } else {
            
            const fields = ['title', 'price', 'imageURL', 'url', 'time'];
            const json2csvParser = new Json2csvParser({ fields });
            const csv = json2csvParser.parse(shirtData);
            
            console.log(csv);
            const currentDate = new Date();
            const fileName = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDay()}`;
            const filePath = `./data/${fileName}`;

            fs.writeFileSync(filePath, csv);            
        }
      }//end next();      
      return next();
  }

//error handling
//Print Error Messages
function printError(error) {
    console.error(error.message);
  }