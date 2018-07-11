/*
Date 7/10/2018
Author: Sharina V. Jones
Crawler Site: https://www.npmjs.com/package/crawler
Cherio: https://www.npmjs.com/package/cheerio
Fetch: https://www.npmjs.com/package/node-fetch
https://www.npmjs.com/package/request
*/



//import required files
const fs = require('fs');
const request = require('request');
const rp = require('request-promise');
const cheerio = require('cheerio');

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

                    shirtData.push({price, title, url, imgUrl});
                    i++;
                    return next();
                })
          } else {
              console.log(shirtData);
              console.log(shirtData.length);
          }
      }//end next();      
      return next();
  }

//start the data request
//read the data from the site
//listen for the end of the data
//parse the data
//write the data to a csv file