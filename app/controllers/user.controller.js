var mongoose = require("mongoose");
var User = mongoose.model("User");
var bcrypt = require('bcryptjs');
var path = require('path');

module.exports.renderCreatePortfolio = function (req, res) {
    if (req.session.username) {
        res.status(200).render("createPortfolio", {
            logged: "true"
        });
    } else {
        res.status(401).redirect("/app/login");
    }
};

module.exports.renderRegister = function (req, res) {
    if (req.session.username) {
        res.status(401).redirect('/app/myProfile/1');
    } else {
        var input = "";
        res.status(200).render("register", {
            input
        });
    }
};

module.exports.renderLogin = function (req, res) {
    if (req.session.username) {
        res.status(401).redirect('/app/myProfile/1');
    } else {
        res.status(200).render('login', {
            usererror: ""
        });
    }
};

module.exports.login = function (req, res) {
    var username = req.body.username;
    username = username.toLowerCase();
    var password = req.body.password;

    User.findOne({
        username: username
    }, (function (err, user) {
        if (err) {
            res.render('login', {
                error: "Unknown Error occured!",
                usererror: username
            });
        } else {
            if (user) {
                if (bcrypt.compareSync(password, user.password)) {
                    req.session.username = username;
                    res.status(200).redirect('/app/myProfile');
                } else {
                    res.status(401).render('login', {
                        error: "Incorrect Password.",
                        usererror: username
                    });
                }
            } else {
                res.status(400).render('login', {
                    error: "Username not found.",
                    usererror: ""
                });
            }
        }
    }));
};

module.exports.register = function (req, res) {
    if (req.session.username) {
        res.status(401).redirect("/app/login");
    } else {
        var username = req.body.username;
        username = username.toLowerCase();
        var password = req.body.password;
        var input = username;

        User.findOne({
            username: username
        }, function (err, user) {
            if (err) {
                res.status(400).render("register", {
                    error: "An error occured.",
                    input
                });
            } else if (user) {
                res.status(400).render("register", {
                    error: "Username exists.",
                    input
                });
            } else {
                bcrypt.genSalt(8, function (err, salt) {
                    bcrypt.hash(password, salt, function (err, hash) {
                        var newUser = {
                            username: username,
                            password: hash,
                            firstTime : true
                        };
                        User.create(newUser, function (err, createdUser) {
                            createdUser.save(function (err) {
                                res.status(400).render("register", {
                                    success: "Registration Successful.",
                                    input
                                });
                            });
                        });
                    });
                });
            }
        });
    }
};

module.exports.logOut = function (req, res) {
    if (req.session)
        req.session.destroy(function () {
            res.status(200).redirect('/');
        });
    else {
        res.status(401).redirect("/app/login");
    }
};

module.exports.getPortfolios = function (req, res) {
    User.find({
        firstTime: false
    }, function (err, Users) {
        if (err) {
            res.status(400).render('users', {
                error: "Could not get portfolios, please try again later!"
            });
        } else {
            var pageNumber = req.params.pageNumber;
            if (isNaN(pageNumber))
                pageNumber = 1;
            else
                pageNumber = parseInt(req.params.pageNumber);
            if (pageNumber < 1 || pageNumber >= (Users.length / 10 + 1))
                pageNumber = 1;
            if (req.session.username) {
                res.status(200).render('users', {
                    Users,
                    logged: "true",
                    max: pageNumber * 10
                });
            } else {
                res.status(200).render('users', {
                    Users,
                    max: pageNumber * 10
                });
            }
        }
    });
};