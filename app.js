require('./app/data/dbconnection.js');
var express = require('express');
var app = express();
var routes = require("./app/routes");
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

app.set('view engine', 'ejs');

app.use(session({
    secret: "ana gamed awii",
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 3600000*6}
}));

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use("/app", routes);

app.get("/", function (req, res) {
    res.redirect("/app/profiles/1");
});

var server = app.listen(3000, function () {
    
});