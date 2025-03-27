const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const AccountService = require("../services/account.service");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();
const Joi = require("../vaildation/account.validate");

exports.logIn = async (req, res, next) => {
    try {
        // B1: Validate phía server
        const { value, error } = Joi.logInValidate.validate(req.body);
        if (error) {
            return next(new ApiError(400, error.details[0].message));
        }
        // B2: Kiểm tra email tồn tại hay chưa
        const accountService = new AccountService(MongoDB.client);
        const account = await accountService.findByEmail(req.body.email);
        if (!account) {
            return res.send({ message: "Khong tim thay account" });
        }
        else if (!account.activeStatus) {
            return res.send({ message: "Tai khoan chua duoc kich hoat" });
        }

        // B3: Kiểm tra password
        const isMatch = await bcrypt.compare(req.body.password, account.password);
        console.log(isMatch);
        if (!isMatch) {
            return res.send({ message: "Mật khẩu không chính xác" });
        }

        // B4: Tạo JWT
        const JWTtoken = jwt.sign({ _id: account._id }, process.env.SECRET_CODE);
        console.log(JWTtoken);
        // B5: Lưu JWT vào cookie
        res.cookie("JWT", JWTtoken, {
            httpOnly: true,  // Ngăn JavaScript truy cập cookie (bảo vệ XSS)
            secure: false,   // Đặt `true` nếu chạy HTTPS
            sameSite: "Strict", // Chống CSRF
            maxAge: 3600000, // 1 giờ
        });
        // B5: Trả ra thông báo cho người dùng
        account.password = undefined;
        return res.send({
            message: "Đăng nhập thành công",
            role: account.role
        });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "Có lỗi trong quá trình đăng nhập"))
    }
}

exports.getUserData = async (req, res, next) => {
    try {
        // Lấy account từ id đc kiểm từ middleware
        const accountService = new AccountService(MongoDB.client);
        const account = await accountService.findById(req.user._id);
        if (!account) {
            return next(new ApiError(404, "User not found"));
        }
        delete account.password;
        delete account.dateTimeCreate;
        delete account.dateTimeUpdate;
        return res.send(account);

    } catch (error) {
        console.log("Loi: ", error);
        return next(new ApiError(500, "Có lỗi xảy ra trong khi lấy dữ liệu người dùng"));
    }

}
