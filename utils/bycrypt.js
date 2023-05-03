const bcrypt = require('bcryptjs');
exports.hashPassword = async (password)=>{
    return await bcrypt.hash(password, 8);
}

exports.comparePassword = async (givenPassword = "", correctPassword = "")=>{
    return await bcrypt.compare(givenPassword, correctPassword);
}