const express = require('express');
const shirts = require('./data/shirts.json');

const app = express();

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use('/', (req, res, next) => {
  console.log(shirts);
  res.render('index', {shirts});
});
const port = 3000;

app.listen(port, () => {
  console.info(`Server started on port ${port}`);
})