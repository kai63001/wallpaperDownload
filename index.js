
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

const title = "WallpapersMoon";
const image = [];
const name = [];
const id = [];

app.get('/', async function (req, res, next) {
    if (image.length > 10) {
        next();
    } else {
        request('https://wall.alphacoders.com/', function (error, res, html) {
            if (!error & res.statusCode == 200) {

                const $ = cheerio.load(html);
                var j = 0;
                $('img.lazy-load').each(function (i, elem) {
                    if ($(this).hasClass('user-avatar') == false && $(this).hasClass('media-object') == false && $(this).attr("data-src") != "https://static.alphacoders.com/contest-50-71.png") {
                        image[j] = $(this).attr("data-src");
                        name[j] = $(this).parent().attr("title");
                        id[j] = $(this).parent().attr("href").replace('big.php?i=', '');
                        j += 1;
                    }
                });
                next();
                // console.log(name);
            }
        });
    }
}, async function (req, res, next) {
    console.log("STATUS PAGE: INDEX SUCCESS");
    res.render('index', { image: image, title: title, name: name, id, id });
});

var image_image = '';
var image_name = '';
var image_auth = '';
var image_tag = [];
var image_atag = [];
app.use('/image/:id', async function (req, res, next) {

    await request('https://wall.alphacoders.com/big.php?i=' + req.params.id, async function (error, res, html) {
        if (!error & res.statusCode == 200) {
            const $ = cheerio.load(html);
            image_image = await $('img.main-content').attr("src");
            image_name = await $('title').text().substring(0, $('title').text().indexOf('|'));
            image_auth = await $('span.author-container').children('a').text();
            $('.tag-element').each(function (i, elem) {
                image_tag[i] = $(this).children("a").text();
                image_atag[i] = $(this).children("a").attr("href").replace('tags.php?tid=', '');
            });
            console.log(image_tag);
            next();
        }
    });



}, async function (req, res, next) {
    await res.render('image', { image: image_image, title: title, name: image_name, auth: image_auth, tag: image_tag });
});



app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`)
})