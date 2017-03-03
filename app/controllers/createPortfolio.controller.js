var mongoose = require("mongoose");
var User = mongoose.model("User");
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var upload = multer({
    dest: path.join(__dirname, '../', '../public/uploads')
}).single('myfile');

module.exports.createPortfolio = function (req, res) {
    if (req.session.username) {
        var name = req.body.name;
        User.findOne({
            username: req.session.username
        }, function (err, user) {
            if (!err && user) {
                if (req.session.pp) {
                    var string = req.session.pp;
                } else
                    var string = path.join(__dirname, "../../public/images/user.png");
                var fileFormat = string.substring(string.length - 3, string.length);
                user.name = name;
                user.profilePicture.photo = (fs.readFileSync(string)).toString("base64");
                user.profilePicture.contentType = "image/" + fileFormat;
                user.firstTime = false;
                user.save(function (err) {
                    res.status(200).redirect('/app/myProfile');
                });
            } else {
                res.status(400).render('createPortfolio', {
                    error: "Could not create Portfolio, Please try again!",
                    logged: "true"
                });
            }
        });
    } else {
        res.status(401).redirect("/app/login");
    }
};

module.exports.showImage = function (req, res) {
    if (req.session.username && req.session.pp) {
        var string = req.session.pp;
        var length = "/uploads/tmpPP.jpg".length;
        if (string.substring(string.length - 3) === "peg")
            length += 1;
        string = string.substring(string.length - length);
        res.status(200).render("createPortfolio", {
            filePath: string,
            success: "Upload Successful!",
            logged: "true"
        });
    } else {
        res.status(401).redirect("/app/login");
    }
};

module.exports.upload = function (req, res) {
    if (req.session.username) {
        upload(req, res, function (err) {
            if (err) {
                return res.status(400).render('createPortfolio', {
                    error: "Upload Failed!",
                    logged: "true"
                });
            }
            if (req.file) {
                var string = req.file.originalname.substring(req.file.originalname.length - 3, req.file.originalname.length);
                if (string === "peg")
                    string = "j" + string;
                if (!(string === "png" || string === "jpg" || string === "jpeg")) {
                    fs.unlink(req.file.path);
                    return res.status(400).render('createPortfolio', {
                        error: "File format is not supported!",
                        logged: "true"
                    });
                }
                var newPath = path.join(__dirname, "../", "../public/uploads/tmpPP" + "." + string);
                fs.renameSync(req.file.path, newPath, function (err) {
                    if (err) throw err;
                    fs.unlink(req.file.path, function () {
                        if (err) {
                            throw err;
                        }
                    });
                });

                req.session.pp = newPath;
                res.status(200).redirect("/app/createPortfolio/upload");
            } else {
                if (req.session.pp) {
                    fs.unlink(req.session.pp);
                    delete req.session.pp;
                }
                res.status(400).render('createPortfolio', {
                    logged: "true",
                    error: "Please choose a valid file!"
                });
            }
        });
    } else {
        res.status(401).redirect("/app/login");
    }
};