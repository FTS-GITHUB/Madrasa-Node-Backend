const express = require("express")

// Models
// const book = require("../../model/book")
// const blog = require("../../model/blogs")
// const user = require("../../model/user")
// const transaction = require("../../model/transaction")

// Helper
const catchAsync = require("../../utils/catchAsync")
const {ERRORS, SUCCESS_MSG, STATUS_CODE} = require("../../constants/index")
const bookModel = require("../../model/book")
const blogModel = require("../../model/blogs")
const userModel = require("../../model/user")
const transactionModel = require("../../model/transaction")

// Get All of Things 
const getSearchResult = catchAsync(async(req,res)=>{
    const user = req.user
    const {search} = req.body

    try {
        result = []
        let book = await bookModel.find({title : {$regex:search, $options:'i'}})
        let blog = await blogModel.find({title:{$regex:search, $options:'i'}})
        let user = await userModel.find({firstName :{$regex:search, $options:'i'}})
        let transaction = await transactionModel.find({title : {$regex:search, $options:'i'}})
        result.push({book:book},{blog:blog}, {user:user},{transaction:transaction})
        console.log(result.length)
        return res.status(STATUS_CODE.OK).json({message:SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result})
    } catch (err) {
        res.status(STATUS_CODE.NOT_FOUND).json({message : SUCCESS_MSG.SUCCESS_MESSAGES.NOT_FOUND , err})
    }
})


module.exports = {getSearchResult}