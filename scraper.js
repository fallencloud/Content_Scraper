/*
Date 7/10/2018
Author: Sharina V. Jones
Crawler Site: https://www.npmjs.com/package/request
Cheerio: https://www.npmjs.com/package/cheerio
JSON2csv: https://www.npmjs.com/package/json2csv
*/

//import required files
const fs = require('fs');
//scraper
const request = require('request');
//allows for jquery syntax
const cheerio = require('cheerio');
//parses data to csv
const Json2csvParser = require('json2csv').Parser;
//Require http module for status codes
const http = require('http');

//declartions
let shirtData = [];


//check for the existance of a file
  //creates file if it doesn't exist
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

//declarations
const entrance = "http://shirts4mike.com/shirts.php";
const links = []; //stores individual shirt links

//initial scrape
  //retrieves all shirts from page
request(entrance, function(error, response, body) {
    //checks for valid response
    if (!error && response.statusCode === 200) {
        let $ = cheerio.load(body);
        //gets individual page links
        const products = $('.products li');
        $(products).each(function() {
            //stores links in array
            let url = $(this).children().first().attr('href');
            links.push(url);
        });      

        getShirtData(links);
    } else {
        //generates errors
        if (response) {
            const message = `Unable to connect to ${entrance}: ${response.statusCode} (${http.STATUS_CODES[response.statusCode]})`;
            const statusCodeError = new Error(message);
            printError(statusCodeError);
        } else {
            const message = `The following error occurred: ${error.code} (${error.message})`;
            const statusCodeError = new Error(message);
            printError(statusCodeError);
        }
    }
});

//second scrape
  //gets info from individual shirts
function getShirtData(links) {
    let i = 0; 
    

    //recursively calls itself until each shirt's info is obtained
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
                    process.stdout.write('.');
                    return next();
                } else {
                    if (response) {
                        const message = `Unable to connect to http://shirts4mike.com/${links[i]}: ${response.statusCode} (${http.STATUS_CODES[response.statusCode]})`;
                    } else {
                        const message = `The following error occurred: ${error.code} (${error.message})`;
                        const statusCodeError = new Error(message);
                        printError(statusCodeError);
                    }   
                }
            });

        } else {
            console.log(`✅\tProgram complete`);            
            //parses shirt info into csv
            const fields = ['title', 'price', 'imageURL', 'url', 'time'];
            const json2csvParser = new Json2csvParser({ fields });
            const csv = json2csvParser.parse(shirtData);
            
            //creates a filename using the current day
            //[year, month, day, hour, minute, second, millisecond]
            let currentDate = new Date(Date.now());
            currentDate = currentDate.toISOString().substr(0, 10);            
            const fileName = `${currentDate}.csv`;
            const filePath = `./data/${fileName}`;

            //writes to a file
              //creates file if it doesn't exist
            fs.writeFileSync(filePath, csv); 
        }
    }
    return next();
}
  
  //error handling
//Print Error Messages
function printError(error) {
    console.error(error.message);
  }

  module.exports.shirtData = shirtData;