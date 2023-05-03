const jwt = require('jsonwebtoken');
require("dotenv").config();

exports.createJWT = (user)=>{
    const payload = {
		userdata: {
			id: user._id,
		},
	};
    const token = jwt.sign(
        payload, 
        process.env.JWTSECRET, 
        {
            expiresIn: process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000,
        }
        );
    return token;
}

exports.verify = (token)=>{
    try{
        return jwt.verify(token, process.env.JWTSECRET);
    } catch(err){
        return null;
    }
}