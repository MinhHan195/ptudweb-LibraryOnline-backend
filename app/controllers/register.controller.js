require('dotenv').config();
const sendMail = require("../helpers/send.mail");
const bcrypt = require("bcrypt");
const {addMinutes, isAfter} = require("date-fns");

const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const AccountService = require("../services/account.service");
const Joi = require("../vaildation/account.validate");

exports.create = async (req, res, next) => {
    try {
        // B1: Validate phia sever
        const {value, error} = Joi.registerUserValidate.validate(req.body);
        if(error){
            return next(new ApiError("400", error.details[0].message));
        }
        // B2: Kiem tra tai khoan co ton tai khong
        const accountService = new AccountService(MongoDB.client);
        const result = await accountService.findByEmail(req.body.email);
        if(result){
            return res.send({message: "Email đã tồn tại tài khoản"});
        }
        // B3: Tạo mã kích hoạt tài khoản
        const token = await bcrypt.hash(req.body.email, 5);
        // B4: Tạo tài khoản với mã kích hoạt
        const document = await accountService.create(req.body, token);
        // B5: Gửi mail kích hoạt tài khoảng
        await sendMail({
            email: req.body.email,
            subject: "KÍCH HOẠT TÀI KHOẢN",
            html: `
                <h1> Cảm ơn bạn đã đăng ký tài khoản</h1>
                <p> Hãy kích hoạt tài khoản trong vòng 10 phút</p>
                <a href="${process.env.FONTEND_URL}/login?token=${token}&id=${document.insertedId}">
                Vui lòng click vào đây để kích hoạt tài khoản
                </a>
            `
        })
        // B6: Thông báo cho người dùng tại tài khoảng thành công
        return res.send({
            message: "Tạo tài khoản thành công"
        });
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, "Co loi trong khi tao tai khoan")
        );
    }
}

exports.verify = async (req, res, next) => {
    // B1: Lấy id và token từ URL
    const token = req.query.token;
    const id = req.query.id;
    try {
        // B2: Lấy tài khoản bằng id
        const accountService = new AccountService(MongoDB.client);
        const account = await accountService.findById(id);
        if(!account) {
            return next(new ApiError(404, `Account not found`));
        }
        // B3: Kiểm tra xem tài khoản đã được kích hoạt hay chưa để tránh spam
        if(account.activeStatus) {
            return res.send({message: "Tài khoản đã được kích hoạt trước đó"});
        }
        // B4: Kiểm tra tài khoản có quá hạn kích hoạt hay chưa
        const timeCreated = addMinutes(account.dateTimeCreate, 10);
        if(isAfter(new Date().toLocaleString(), timeCreated)){
            await accountService.deleteAccount(id);
            return res.send({message: "Tài khoản đã hết thời hạn kích hoạt, vui lòng tạo tài khoản khác!"});
        // B5: Kiểm tra token và kích hoạt tài khoản
        }else if(token === account.token){
            await accountService.activateAccount(id);
            return res.send({message: "successful"});
        }
        return res.send(new ApiError(422, "Mã xác nhận không hợp lệ"));
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, `Có lỗi khi kích hoạt tài khoản có id=${req.params.id}`)
        );
    }
}