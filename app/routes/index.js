var express = require("express");
var router = express.Router();
var userCtrl = require("../controllers/user.controller");
var myProfileCtrl = require("../controllers/myProfile.controller");
var createPortfolioCtrl = require("../controllers/createPortfolio.controller");

router.route("/login").get(userCtrl.renderLogin).post(userCtrl.login);
router.route("/register").get(userCtrl.renderRegister).post(userCtrl.register);
router.route("/profiles/:pageNumber").get(userCtrl.getPortfolios);
router.route("/logout").get(userCtrl.logOut);
router.route("/myProfile").get(myProfileCtrl.getAllProjects).post(myProfileCtrl.upload);
router.route("/myProfile/upload").get(myProfileCtrl.showImage).post(myProfileCtrl.createProject);
router.route("/createPortfolio").get(userCtrl.renderCreatePortfolio).post(createPortfolioCtrl.upload);
router.route("/createPortfolio/upload").get(createPortfolioCtrl.showImage).post(createPortfolioCtrl.createPortfolio);

module.exports = router;
