var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");

// Scraping tools
var cheerio = require("cheerio");

// Require models
var db = require("./models");

// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news";

var PORT = process.env.PORT || 3000;

var app = express();

// Configure middleware

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.Promise = Promise;
// mongoose.connect(MONGODB_URI);
mongoose.connect("mongodb://heroku_707rpb17:jqidj7k2b6nhjonu00jube4bu0@ds151840.mlab.com:51840/heroku_707rpb17",{useMongoClient: true});
// Routes

// A GET route for scraping 
app.get("/scrape", function (req, res) {
    var count = 0;
    // First, we grab the body of the html with request
    request.get("http://www.bbc.com/news").then(function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(response.data);
        var results = [];
        $("gs-c-promo-body gel-1/2@xs gel-1/1@m gs-u-mt@m").each(function (i, element) {
            var result = {};

            result.title = $(this).children("div").children("a").text();
            result.link = "https://bbc.com/news" + $(this).children("div").children("a").attr("href");
            result.push(result);
            result.body = $(this).children("div").children("a").children("h3").children("p");

            results.push(result);
            console.log(result);
        });



        // Add articles to DB
        db.Article.create(result)
            .then(function (dbArticle) {
                console.log("Articles");
                res.send(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            });
        res.send("Scrape Complete");
    }});
});

//Routes for pages
app.get("/", function(req,res){
    console.log("GET /");
    db.Article
    .find({})
    .then(function(dbArticle){
        res.render("index", {article: dbArticle});
    })
    .catch(function(err){
        res.json(err);
    });
});

//Route for Saved Articles
app.get("/saved", function(req,res){
    console.log("GET /");
    db.Article
    .find({saved:true})
    .then(function(dbArticle){
        res.render("saved", {article: dbArticle});
    })
    .catch(function(err){
        res.json(err);
    });
});

//Route of an Article by id w/ note
app.get("/article/:id", function(req,res){
    console.log("GET notes for " +req.params.id);
    db.Article
    .findOne({_id: req.params.id})
    .populate("note")
    .then(function(dbArticle){
        console.log("article found" + req.params.id)
        res.json(dbArticle)
    })
    .catch(function(err){
        res.json(err);
    });
});

//Route for updating status
app.put("/articles/:id/:bool", function(req,res){
    console.log("updated")

    db.Article.findOneAndUpdate({_id:params.id},{saved: req.params.bool}, {new: true}).then(function(dbArticle) {
        console.log("added");
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
})


app.post("/article/:id", function(req,res){
    db.Note.create(req.body).then(function(dbNote) {return db.Article.findOneAndUpdate({_id: req.params.id}, {$push: {note:dbNote_id}},{new: true});
})
.then(function(dbArticle){
    res.json(dbArticle);
})
.catch(function(err){
    res.json(err);
});
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});