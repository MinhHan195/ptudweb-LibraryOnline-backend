const express = require("express");
const middleware = require("../middleware/authMiddleware");
const orderController = require("../controllers/order.controller");
const router = express.Router();

router.route("/")
    .get(orderController.getAll);

router.route("/create/:bookId")
    .get(middleware.verifyToken,orderController.create);

router.route("/state/:state/:id")
    .get(orderController.switchState);

router.route("/:id")
    .get(orderController.getAllByUserId)
    .delete(orderController.deleteOrderById);

module.exports = router;