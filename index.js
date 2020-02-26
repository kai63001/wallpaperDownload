const express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var mysql = require("mysql");
const app = express();
const path = require("path");
const port = 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

var con = mysql.createConnection({
  host: "192.168.64.2",
  user: "romeo",
  password: "qw123456",
  database: "wallpaper"
});

con.connect();

const title = "WallpapersMoon";
const image = [];
const name = [];
const id = [];

app.get(
  "/",
  async function(req, res, next) {
    if (image.length > 10) {
      next();
    } else {
      request("https://wall.alphacoders.com/", function(error, res, html) {
        if (!error & (res.statusCode == 200)) {
          const $ = cheerio.load(html);
          var j = 0;
          $("img.lazy-load").each(function(i, elem) {
            if (
              $(this).hasClass("user-avatar") == false &&
              $(this).hasClass("media-object") == false &&
              $(this).attr("data-src") !=
                "https://static.alphacoders.com/contest-50-71.png"
            ) {
              image[j] = $(this).attr("data-src");
              name[j] = $(this)
                .parent()
                .attr("title");
              id[j] = $(this)
                .parent()
                .attr("href")
                .replace("big.php?i=", "");
              j += 1;
            }
          });
          next();
          // console.log(name);
        }
      });
    }
  },
  async function(req, res, next) {
    console.log("STATUS PAGE: INDEX SUCCESS");
    res.render("index", { image: image, title: title, name: name, id, id });
  }
);

var image_image = "";
var image_name = "";
var image_auth = "";
var image_tag = [];
var image_atag = [];
var image_view = 0;
var image_categoly = [];
var image_acategoly = [];

app.use(
  "/image/:id",
  function(req, reser, next) {
    image_view = 0;
    var image_check404 = false;
    var image_checkInser = false;
    var image_haveit = false;
    con.query(
      "select * from wallpaper where w_wid=" + req.params.id,
      async function(err, res) {
        if (res.length > 0) {
          console.log("have it");
          image_haveit = true;
          var nowView = parseInt(res[0].w_view) + 1;
          con.query(
            "update wallpaper set w_view=" +
              nowView +
              " where w_wid=" +
              req.params.id,
            function(err, res) {
              if (err) {
                throw err;
              }
              console.log("update view success");
            }
          );
          image_view = res[0].w_view;
        } else {
          scaf();
        }
        if (image_haveit == true) {
          image_image = await res[0].w_image;
          image_name = await res[0].w_name;
          image_auth = await res[0].w_auth;
          image_view = await res[0].w_view;
          var s_image_wtag = await res[0].w_tags;
          image_tag = s_image_wtag.split(",");
          var s_image_watag = res[0].w_atags;
          image_atag = s_image_watag.split(",");
          var s_image_categoly = await res[0].w_categoly;
          console.log(s_image_categoly + "---");
          image_categoly = s_image_categoly.split(",");
          var s_image_wacategoly = res[0].w_acategoly;
          image_acategoly = s_image_wacategoly.split(",");
          next();
        }
      }
    );
    console.log(image_checkInser);
    async function scaf() {
      console.log("runing scaf");
      request(
        "https://wall.alphacoders.com/big.php?i=" + req.params.id,
        async function(error, res, html) {
          if (!error & (res.statusCode == 200)) {
            console.log("------");
            console.log(html.indexOf("With Our Monthly Raffle You Could Win:"));
            console.log("------");
            if (html.indexOf("With Our Monthly Raffle You Could Win:") > 0) {
              reser.send("404 ERROR");
              reser.end();
            } else {
              image_check404 = true;
            }
            if (image_check404 == true) {
              const $ = cheerio.load(html);
              image_image = await $("img.main-content").attr("src");
              image_name = await $("title")
                .text()
                .substring(
                  0,
                  $("title")
                    .text()
                    .indexOf("|")
                );
              image_auth = await $("span.author-container")
                .children("a")
                .text();
              $(".tag-element").each(function(i, elem) {
                image_tag[i] = $(this)
                  .children("a")
                  .text();
                image_atag[i] = $(this)
                  .children("a")
                  .attr("href")
                  .replace("tags.php?tid=", "");
              });
              var image_j = 0;
              $("strong").each(function(i, elem) {
                if (
                  $(this)
                    .parent()
                    .attr("href")
                    .indexOf("profile.php") < 0 &&
                  $(this)
                    .parent()
                    .attr("href")
                    .indexOf("by_creator.php") < 0 &&
                  $(this)
                    .parent()
                    .attr("href")
                    .indexOf("creator") < 0
                ) {
                  image_categoly[image_j] = $(this).text();
                  image_acategoly[image_j] = $(this)
                    .parent()
                    .attr("href");
                  //   .replace("by_category.php?id=", "")
                  //   .replace("by_sub_category.php?id=", "");
                  image_j += 1;
                }
              });
              console.log(image_tag);
              con.query(
                'insert into wallpaper (w_acategoly,w_categoly,w_atags,w_tags,w_auth,w_name,w_image,w_wid,w_view) VALUES ("' +
                  image_acategoly +
                  '","' +
                  image_categoly +
                  '","' +
                  image_atag +
                  '","' +
                  image_tag +
                  '","' +
                  image_auth +
                  '","' +
                  image_name +
                  '","' +
                  image_image +
                  '",' +
                  req.params.id +
                  "," +
                  1 +
                  ")",
                function(err, res) {
                  if (err) {
                    console.log("error primary key stuck");
                  }
                  next();
                  console.log("insert view database success!!!");
                }
              );
            }
          }
        }
      );
    }
  },
  async function(req, res, next) {
    await res.render("image", {
      image: image_image,
      title: title,
      name: image_name,
      auth: image_auth,
      tag: image_tag,
      atag: image_atag,
      view: image_view,
      categoly: image_categoly,
      acategoly: image_acategoly,
      id: req.params.id
    });
    image_categoly = [];
    image_acategoly = [];
    image_tag = [];
    image_atag = [];
  }
);

const more_image = [];
var more_tags = [];
var more_atags = [];
const more_id = [];
app.get(
  "/moreimage/:id",
  async function(req, res, next) {
    await request(
      "https://wall.alphacoders.com/big.php?i=" + req.params.id,
      function(error, res, html) {
        if (!error & (res.statusCode == 200)) {
          const $ = cheerio.load(html);
          $("img.img-responsive").each(function(i, elem) {
            more_image[i] = $(this)
              .attr("data-src")
              .replace("thumbbig", "thumb-350");
            more_id[i] = $(this)
              .parent()
              .parents()
              .attr("href")
              .replace("https://wall.alphacoders.com/big.php?i=", "");
            more_tags.push([]);
            more_atags.push([]);
            for (
              var s = 0;
              s <
              $(".tags-info")
                .eq(i)
                .children("a").length;
              s++
            ) {
              more_tags[i].push(
                $(".tags-info")
                  .eq(i)
                  .children("a")
                  .eq(s)
                  .text()
                  .trim()
                  .toString()
              );
              more_atags[i].push(
                $(".tags-info")
                  .eq(i)
                  .children("a")
                  .eq(s)
                  .attr("href")
                  .trim()
                  .toString()
                  .replace("/tags.php?tid=", "")
              );
            }
          });
          next();
          console.log(more_tags);
        }
      }
    );
  },
  function(req, res, next) {
    res.render("ajax/moreimage", {
      image: more_image,
      tags: more_tags,
      atags: more_atags,
      id: more_id
    });
    more_tags = [];
    more_atags = [];
  }
);

app.get("/tags/:name/:id", function(req, reser, next) {
  var page = 1;
  if (req.query.page) {
    page = req.query.page;
  }
  var lastPage = 0;
  console.log(page);
  request(
    "https://wall.alphacoders.com/tags.php?tid=" +
      req.params.id +
      "&page=" +
      page,
    function(error, res, html) {
      if (!error & (res.statusCode == 200)) {
        const $ = cheerio.load(html);
        var number_count = $("title")
          .text()
          .substr(
            0,
            $("title")
              .text()
              .indexOf(" ")
          );
        var j = 0;
        var tags_image = [];
        var tags_name = [];
        var tags_id = [];
        try {
          lastPage = $("ul.pagination")
            .eq(0)
            .children("li").length;
          lastPage = lastPage - 2;
          lastPage = $("ul.pagination")
            .eq(0)
            .children("li")
            .eq(lastPage)
            .text();
        } catch (error) {
          console.log(error);
        }
        console.log(lastPage);
        $("img.lazy-load").each(function(i, elem) {
          if (
            $(this).hasClass("user-avatar") == false &&
            $(this).hasClass("media-object") == false &&
            $(this).attr("data-src") !=
              "https://static.alphacoders.com/contest-50-71.png"
          ) {
            tags_image[j] = $(this).attr("data-src");
            tags_name[j] = $(this)
              .parent()
              .attr("title");
            tags_id[j] = $(this)
              .parent()
              .attr("href")
              .replace("big.php?i=", "");
            j += 1;
          }
        });

        reser.render("tags", {
          title: title,
          tags: req.params.name,
          count: number_count,
          image: tags_image,
          id: tags_id,
          name: tags_name,
          lastPage: lastPage
        });
        // console.log(name);
      }
    }
  );
});

app.get("/search", function(req, reser) {
  var page = 1;
  if (req.query.page) {
    page = req.query.page;
  }
  var lastPage = 0;
  console.log(req.query.name.length);
  if (req.query.name.length < 2) {
    reser.send("Your search came back as empty. Please enter a new search.");
  } else {
    request(
      "https://wall.alphacoders.com/search.php?search=" +
        req.query.name +
        "&page=" +
        page,
      function(erro, res, html) {
        if (!erro & (res.statusCode == 200)) {
          const $ = cheerio.load(html);
          var number_count = $("title")
            .text()
            .substr(
              0,
              $("title")
                .text()
                .indexOf(" ")
            );
          var j = 0;
          var tags_image = [];
          var tags_name = [];
          var tags_id = [];
          try {
            lastPage = $("ul.pagination")
              .eq(0)
              .children("li").length;
            lastPage = lastPage - 2;
            lastPage = $("ul.pagination")
              .eq(0)
              .children("li")
              .eq(lastPage)
              .text();
          } catch (error) {
            console.log(error);
          }
          console.log(lastPage);
          $("img.lazy-load").each(function(i, elem) {
            if (
              $(this).hasClass("user-avatar") == false &&
              $(this).hasClass("media-object") == false &&
              $(this).attr("data-src") !=
                "https://static.alphacoders.com/contest-50-71.png"
            ) {
              tags_image[j] = $(this).attr("data-src");
              tags_name[j] = $(this)
                .parent()
                .attr("title");
              tags_id[j] = $(this)
                .parent()
                .attr("href")
                .replace("big.php?i=", "");
              j += 1;
            }
          });

          reser.render("search", {
            title: title,
            name_search: req.query.name,
            count: number_count,
            image: tags_image,
            id: tags_id,
            name: tags_name,
            lastPage: lastPage
          });
        }
      }
    );
  }
});

app.listen(port, function() {
  console.log(`Example app listening on port ${port}!`);
});
