const STATUS_CODE = require("../../constants/statusCode");
const userModel = require("../../model/user");
const bycrypt = require("../../utils/bycrypt");
const SendEmail = require("../../utils/emails/sendEmail");
const jwt = require("../../utils/jwt");
const crypto = require("crypto");
const catchAsync = require("../../utils/catchAsync");

exports.login = catchAsync(async (req, res)=>{
    try{
        console.log("hit")
        let email = req.body.email, 
        password = req.body.password;
        if(!email || !password){
            res.status(STATUS_CODE.BAD_REQUEST).json({message: `${!email ? "Email" : "Password"} is required.`, statusCode: STATUS_CODE.BAD_REQUEST});
            return;
        }

        const doc = await userModel.findOne({email, archived: false}).select("+password");
        if(doc){
            const isCorrect = await bycrypt.comparePassword(password, doc.password);
            if(isCorrect){
                // to hide password
                doc.password = null;

                const token = jwt.createJWT(doc);
                if(token){
                    doc.token = token;
                }
                res.status(STATUS_CODE.OK).json({data: doc, statusCode: STATUS_CODE.OK});
                return
            }
            res.status(STATUS_CODE.BAD_REQUEST).json({message: "Invalid email and password", statusCode: STATUS_CODE.BAD_REQUEST});
            return;
        }
        res.status(STATUS_CODE.NOT_FOUND).json({message: "User not found", statusCode: STATUS_CODE.NOT_FOUND});
        
    } catch(err){
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({statusCode: STATUS_CODE.SERVER_ERROR, err});
    }
})

exports.signup = catchAsync(async (req, res)=>{
    try{

        let email = req.body.email;
        let password = req.body.password;
        if(!email){
            res.status(STATUS_CODE.BAD_REQUEST).json({message: "Email is required", statusCode: STATUS_CODE.BAD_REQUEST});
            return;
        }
        if(!password){
            res.status(STATUS_CODE.BAD_REQUEST).json({message: "Password is required", statusCode: STATUS_CODE.BAD_REQUEST});
            return;
        }
        const isExist = await userModel.findOne({email});
        if(isExist){
            res.status(STATUS_CODE.BAD_REQUEST).json({message: "User already exist with same email", statusCode: STATUS_CODE.BAD_REQUEST});
            return;
        }

        const hashPassword = await bycrypt.hashPassword(password);
        if(hashPassword){
            req.body.password = hashPassword;            
            const data = new userModel(req.body);
            await data.save()
            res.status(STATUS_CODE.OK).json({message: `${req.body.role} created successfully`, statusCode: STATUS_CODE.CREATED});
            return;
        }

        res.status(STATUS_CODE.SERVER_ERROR).json({message: `Unable to hash password`, statusCode: STATUS_CODE.SERVER_ERROR});
        return;

    } catch (err){
        res.status(STATUS_CODE.SERVER_ERROR).json({statusCode: STATUS_CODE.SERVER_ERROR, err});
    }


})

exports.verify = catchAsync(async (req, res)=>{

    try{
        let token = req.body.token;
        if(token){
            const payload = jwt.verify(token);
            if(payload && payload.userdata){
                let user = await userModel.findOne({_id: payload.userdata.id});
                if(user){
                    const token = jwt.createJWT(user);
                    if(token){
                        user.token = token;
                    }
                    res.status(STATUS_CODE.OK).json({message: "User verified successfully", data: user, statusCode: STATUS_CODE.OK});
                    return;
                }
            }
        }
        
        res.status(STATUS_CODE.UNAUTHORIZED).json({message: "Unauthorized access", statusCode: STATUS_CODE.UNAUTHORIZED});
        return;
    } catch(err){
        res.status(STATUS_CODE.SERVER_ERROR).json({message: "Authorization Error", statusCode: STATUS_CODE.SERVER_ERROR});
        return;
    }

})

exports.sendEmailVerificationCode = catchAsync(async (req, res)=>{

    try{
        let email = req.body.email;
        if(!email){
            res.status(STATUS_CODE.BAD_REQUEST).json({message: "Email is required", statusCode: STATUS_CODE.BAD_REQUEST});
            return;
        }
        let user = await userModel.findOne({email});
        if(!user){
            res.status(STATUS_CODE.NOT_FOUND).json({message: "User not found", statusCode: STATUS_CODE.NOT_FOUND});
            return;
        }
        const verificationToken = await user.createEmailVerifyToken();
        console.log("Verification Token", verificationToken);
        await user.save({ validateBeforeSave: false });
        SendEmail(email, verificationToken)
        .catch(err=>{
            console.log(err);
            throw Error("Email send error");
        });
        res.status(STATUS_CODE.OK).json({statusCode: STATUS_CODE.OK, message: "Email verification code sent to your email"});
    } catch(err){
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: "Verification code send error", statusCode: STATUS_CODE.SERVER_ERROR});
        return;
    }

})

exports.verifyEmailVerificationCode = catchAsync(async (req, res)=>{

    try{
        let email = req.body.email;
        let code = req.body.code;
        if(!email){
            res.status(STATUS_CODE.BAD_REQUEST).json({message: "Email is required", statusCode: STATUS_CODE.BAD_REQUEST});
            return;
        }
        if(!code){
            res.status(STATUS_CODE.BAD_REQUEST).json({message: "Verification code is required", statusCode: STATUS_CODE.BAD_REQUEST});
            return;
        }

        code = crypto
        .createHash("sha256")
        .update(code)
        .digest("hex");

        let user = await userModel.findOneAndUpdate({email, emailVerificationCode: code, emailVerificationTokenExpires: {$gte: Date.now()}},{
            $set: {
                isEmailVerified: true,
            }
        });
        
        if(!user){
            res.status(STATUS_CODE.NOT_FOUND).json({message: "Invalid Token or Token Expired", statusCode: STATUS_CODE.NOT_FOUND});
            return;
        }

        res.status(STATUS_CODE.OK).json({statusCode: STATUS_CODE.OK, data: user, message: "User email verified successfully"});

    } catch(err){
        console.log(err);
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: "Verification code verify error", statusCode: STATUS_CODE.SERVER_ERROR});
        return;
    }

})
