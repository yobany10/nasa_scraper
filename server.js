// Dependencies -------
var express = require("express");
var expressHB = require("express-handlebars");
var mongoose = require("mongoose");
var logger = require("morgan");
var cheerio = require("cheerio");
var axios = require("axios");

var db = require("./models");

var PORT = 3000;

// Initialize express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/techCrunchDB", {useNewUrlParser: true});

// Routes -------

// A GET route that redirects you to the articles route
app.get('/', function(req, res) {
    res.redirect('/articles');
});

// A GET route for scraping the Techcrunch website
app.get("/scrape", function(req, res) {
    // First we grab the body of the html page with axios
    axios.get("https://techcrunch.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab the needed elements from the DOM
    $("h2.post-block__title").each(function(i, element) {
    // Save an empty result object
    var result = {};

    // Add the text and href of every link
    // & Save them as properties of the result object
    result.title = $(this)
    .children("a")
    .text();
    result.link = $(this)
    .children("a")
    .attr("href");

    // Create a new Article using the 'result' object built for scraping
    db.Article.create(result)
        .then(function(dbArticle) {
        // View the added result in the console
        console.log(dbArticle);
        })
        .catch(function(err) {
        // If an error occurred, log it
        console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
    .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
    })
    .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note


// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});