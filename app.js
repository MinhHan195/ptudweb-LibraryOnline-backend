const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ApiError = require("./app/api-error");
const accountRouter = require("./app/routers/account.route");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/accounts", accountRouter);

app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

app.use((error, req, res, next) => {
    return res.status(error.statusCode || 500).json({
        message: error.message || "Internal Server Error",
    });
});

module.exports = app;