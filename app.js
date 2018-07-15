const shirtData = require('./scraper');
const express = require('express');

const app = express();

app.use('/', (req, res, next) => {
  res.send('App running');
});
const port = 3000;

app.listen(port, () => {
  console.info(`Server started on port ${port}`);
})