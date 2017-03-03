var mongoose = require("mongoose");
var User = mongoose.model("User");
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var upload = multer({
    dest: path.join(__dirname, '../', '../public/uploads')
}).single('myfile');

var addProject = function (req, res, user, callback) {
    var title = req.body.title;
    var URL = req.body.URL;
    var photo = req.session.sc;
    var contentType = null;
    if (!URL && !photo) {
        return callback(false);
    } else {
        if (photo) {
            var string = photo;
            var fileFormat = string.substring(string.length - 3, string.length);
            if (fileFormat === "peg")
                fileFormat = "j" + fileFormat;
            photo = (fs.readFileSync(photo)).toString('base64');
            contentType = "image/" + fileFormat;
        }
    }
    user.projects.push({
        title: title,
        URL: URL,
        screenshot: {
            photo: photo,
            contentType: contentType
        }
    });
    user.save(function (err) {
        if (req.session.sc) {
            fs.unlink(req.session.sc, function (err) {
                delete req.session.sc;
            });
        }
        if (!err) {
            callback(true);
        } else {
            callback(false);
        }
    });
};

module.exports.getAllProjects = function (req, res) {
    if (req.session.username) {
        var username = req.session.username;
        User.findOne({
            username: username
        }, function (err, user) {
            if (err) {
                res.status(400).render('myProfile', {
                    error: err.message
                });
            } else {
                if (user.firstTime === false) {
                    var projects = user.projects;
                    if (req.session.firstTime) {
                        req.session.firstTime = null;
                        res.status(200).render('myProfile', {
                            success: "Login Successful",
                            projects,
                            logged: "true"
                        });
                    } else {
                        res.status(200).render('myProfile', {
                            projects,
                            logged: "true"
                        });
                    }
                } else {
                    res.status(401).redirect("/app/createPortfolio");
                }
            }
        });
    } else {
        res.status(401).redirect("/app/login");
    }
};

module.exports.createProject = function (req, res) {
    if (req.session.username) {
        var username = req.session.username;
        User.findOne({
            username: username
        }, function (err, user) {
            var projects = user.projects;
            if (err) {
                res.status(400).render('myProfile', {
                    error: err.message,
                    logged: "true",
                    projects
                });
            } else {
                addProject(req, res, user, function (exit) {
                    if (exit === false) {
                        res.status(400).render("myProfile", {
                            logged: "true",
                            error: "Please upload a screenshot or provide a link for your project or both!",
                            projects,
                        });
                    } else {
                        res.status(200).redirect('/app/myProfile');
                    }
                });
            }
        });
    } else {
        res.status(401).redirect("/app/login");
    }
}

module.exports.upload = function (req, res) {
    if (req.session.username) {
        var username = req.session.username;
        User.findOne({
            username: username
        }, function (err, user) {
            var projects = user.projects;
            upload(req, res, function (err) {
                if (err) {
                    return res.status(400).render('myProfile', {
                        error: "Upload Failed!",
                        logged: "true",
                        projects
                    });
                }
                if (req.file) {
                    var string = req.file.originalname.substring(req.file.originalname.length - 3, req.file.originalname.length);
                    if (string === "peg")
                        string = "j" + string;
                    if (!(string === "png" || string === "jpg" || string === "jpeg")) {
                        delete req.session.sc;
                        fs.unlink(req.file.path);
                        return res.status(400).render('myProfile', {
                            error: "File format is not supported!",
                            projects,
                            logged: "true"
                        });
                    }
                    var newPath = path.join(__dirname, "../", "../public/uploads/tmp" + "." + string);
                    fs.renameSync(req.file.path, newPath, function (err) {
                        if (err) throw err;
                        fs.unlink(req.file.path, function () {
                            if (err) {
                                throw err;
                            }
                        });
                    });

                    req.session.sc = newPath;
                    res.status(200).redirect('/app/myProfile/upload');
                } else {
                    if (req.session.sc) {
                        fs.unlink(req.session.sc);
                        delete req.session.sc;
                    }
                    res.status(400).render('myProfile', {
                        logged: "true",
                        error: "Please choose a valid file!",
                        projects
                    });
                }
            });
        });
    } else {
        res.status(401).redirect("/app/login");
    }
};

module.exports.showImage = function (req, res) {
    if (req.session.username) {
        var username = req.session.username;
        User.findOne({
            username: username
        }, function (err, user) {
            var projects = user.projects;
            var string = req.session.sc;
            var length = "/uploads/tmp.jpg".length;
            if (string.substring(string.length - 3) === "peg")
                length += 1;
            string = string.substring(string.length - length);
            res.status(200).render("myProfile", {
                filePath: string,
                success: "Upload Successful!",
                logged: "true",
                projects
            });
        });
    } else {
        res.status(401).redirect("/app/login");
    }
};