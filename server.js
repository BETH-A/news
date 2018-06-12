var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");

// Our scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

var PORT = 3000;


// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
    extended: false
}));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/news");

// Routes

// A GET route for scraping 
app.get("/scrape", function (req, res) {
    var count = 0;
    // First, we grab the body of the html with request
    axios.get("http://www.bbc.com/news").then(function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(response.data);
        var results = [];
        $("article span.gs-o-media").each(function (i, element) {
            var result = {};

            result.title = $(this)
                .children("span").children("div").children("a").children("href").children("span").children("span")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");
            resuts.link = "https://bbc.com/news" + $(this).children("a").attr("href");
            results.push(result);
        });



        // Add articles to DB
        db.Article.create(result)
            .then(function (dbArticle) {
                console.log("Articles");
                res.send(dbArticle);
            })
            .catch(function (err) {
                return res.json(err);
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
        res.render("index", {article:dbArticle});
    })
    .catch(function(err){
        res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});