const express = require("express");
const middleware = require("../middleware/authMiddleware");
const bookController = require("../controllers/book.controller");
const upload = require("../middleware/multerMiddleware");

const router = express.Router();

router.route("/")
    .post(middleware.verifyToken,upload.single("image"),bookController.create)
    .get(bookController.getAll);

router.route("/edit")
    .post(middleware.verifyToken, upload.single("image"),bookController.update);

router.route("/delete/:id")
    .delete(middleware.verifyToken, bookController.delete);
module.exports = router;