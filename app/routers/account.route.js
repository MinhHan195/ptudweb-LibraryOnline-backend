const express = require("express");
const RegisterController = require("../controllers/register.controller")

const router = express.Router();


router.route("/")
    .post(RegisterController.create);

router.route("/verify")
    .get(RegisterController.verify);



module.exports = router;