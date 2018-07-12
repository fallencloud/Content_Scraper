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
const Json2csvTransform = require('json2csv').Transform;
const Json2csvParser = require('json2csv').Parser;

//check for the existance of a file
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

let body;
//stores shirt links
const links = [];

request
  .get('http://shirts4mike.com/shirts.php')
  .on('data', function(data) {
    body += data;
  })
  .on('end', function() {
      let resp = JSON.parse(JSON.stringify(body));
      let $ = cheerio.load(resp);

      const products = $('.products li');
      

      $(products).each(function() {
          let url = $(this).children().first().attr('href');
          links.push(url);
      });      

      getShirtData(links);
  });

  function getShirtData(links) {
      let i = 0;  
      let shirtData = [];

      function next() {
          if (i < links.length) {
            let shirtBody;
              request
                .get(`http://shirts4mike.com/${links[i]}`)
                .on('data', function(data) {
                     shirtBody += data;
                })
                .on('end', function() {
                    let resp = JSON.parse(JSON.stringify(shirtBody));
                    let $ = cheerio.load(resp);

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
                })
          } else {
            
            const fields = ['title', 'price', 'imageURL', 'url', 'time'];
            const json2csvParser = new Json2csvParser({ fields });
            const csv = json2csvParser.parse(shirtData);
            
            console.log(csv);
            const currentDate = new Date();
            const fileName = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDay()}`;

            fs.writeFileSync(`./data/${fileName}`, csv);

            
          }
      }//end next();      
      return next();
  }



//start the data request
//read the data from the site
//listen for the end of the data
//parse the data
//write the data to a csv file
