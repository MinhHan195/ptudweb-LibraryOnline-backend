const express = require("express");
const RegisterController = require("../controllers/register.controller")
const AuthController = require("../controllers/auth.controller");
const AccountController = require("../controllers/account.controller");
const middleware = require("../middleware/authMiddleware");

const router = express.Router();


router.route("/")
    .post(RegisterController.create);

router.route("/verify")
    .get(RegisterController.verify);

router.route("/login")
    .post(AuthController.logIn)
    .get(middleware.verifyToken,AuthController.getUserData);

router.route("/reset/reset_request")
    .post(AccountController.sendRequest);

router.route("/reset/password")
    .post(AccountController.resetPassword);

module.exports = router;