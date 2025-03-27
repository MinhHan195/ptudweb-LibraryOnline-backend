const ApiError = require("../api-error");
const AccountService = require("../services/account.service");
const MongoDB = require("../utils/mongodb.util");
const sendMail = require("../helpers/send.mail");
const Joi = require("../vaildation/account.validate");
exports.sendRequest = async (req,res,next) => {
    try {
        // B1: Lấy id của tài khoảng bằng email
        const email = req.body.email;
        const accountService = new AccountService(MongoDB.client);
        const account = await accountService.findByEmail(email);
        if(!account){
            return next(new ApiError(404,"Không tìm thấy tài khoản"));
        }
        const id = account._id;
        // B2: Gửi mail kèm theo id để xác nhận
        await sendMail({
            email: email,
            subject: "THAY ĐỔI MẬT KHẨU TÀI KHOẢN",
            html: `
                <p> Bạn đã sử dụng lệnh "Thiết lập lại mật khẩu" cho tài khoản của bạn trên WorkFind. 
                Để hoàn thành yêu cầu này, vui lòng nhấn đường link bên dưới. </p>
                <a href="${process.env.FONTEND_URL}/resetpassword?email=${email}&id=${id}">
                Vui lòng click vào đây để thay đổi mật khẩu
                </a>
            `
        });

        return res.send({success: "Send mail successfuly"});
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "Có lỗi trong quá trình gửi mail xác nhận"))
    }
    
}

exports.resetPassword = async (req,res,next) => {
    try {
        // B1: validate data
        const {value, error} = Joi.forgotPasswordValidate.validate(req.body);
        if(error){
            return next(new ApiError(400, error.details[0].message));
        }
        // B2: Doi password
        const accountService = new AccountService(MongoDB.client);
        const result = await accountService.changePassword(req.body.userId, req.body.newPassword);
        if(!result) {
            return next(new ApiError(404,"Account not found"));
        }
        // B3: Thong bao
        return res.send({
            message: "Đổi mật khẩu thành công"
        });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500,"Something wrong when changing password"));
    }
}

exports.getAll = async (req, res, next) => {
    try {
        const accountService = new AccountService(MongoDB.client);
        const result = await accountService.find({});
        return res.send(result);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500,"Có lỗi trong khi lấy danh sách tài khoản người dùng"));
    }
}

exports.delete = async (req, res, next) => {
    try {
        const accountService = new AccountService(MongoDB.client);
        const result = await accountService.delete(req.params.id);
        console.log(result);
        return res.send({
            message: "Xóa người dùng thành công",
        })
    } catch (error) {
        console.log(error);
        return next(new ApiError(500,"Có lỗi trong khi xóa tài khoản người dùng"));
    }
}