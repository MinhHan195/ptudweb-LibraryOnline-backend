const express = require("express");
const RegisterController = require("../controllers/register.controller")
const AuthController = require("../controllers/auth.controller");

const router = express.Router();


router.route("/")
    .post(RegisterController.create);

router.route("/verify")
    .get(RegisterController.verify);

router.route("/login")
    .post(AuthController.logIn);

module.exports = router;