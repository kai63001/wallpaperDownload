  
const express = require('express');
var request = require('request');
var cheerio = require('cheerio');
const app = express();
const path = require('path')
const port = 3000

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))



app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`)
})