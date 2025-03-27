const Joi = require('joi');

exports.registerUserValidate = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^0[35789][0-9]{8}$/),
    role: Joi.string().valid("admin", "user").required(),
    password:Joi.string().min(6).max(30).required(),
    confirmPassword: Joi.string()
        .valid(Joi.ref("password")) // Kiểm tra confirmPassword phải giống password
        .required()
        .messages({ "ConfirmPassword": "Mật khẩu xác nhận không khớp!" }),
})

exports.logInValidate = Joi.object({
    email: Joi.string().email().required(),
    password:Joi.string().min(6).max(30).required(),
})

exports.forgotPasswordValidate = Joi.object({
    userId: Joi.string().required(),
    newPassword: Joi.string().min(6).max(30).required(),
    confirmNewPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({ 'any.only': 'Xác nhận mật khẩu không khớp' }),
})