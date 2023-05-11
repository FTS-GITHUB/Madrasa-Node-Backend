const express = require("express");
const STATUS_CODE = require("../../constants/statusCode");
const blog = require("../../model/blogs");
const catchAsync = require("../../utils/catchAsync");
const { uploadFile } = require("../../utils/uploader");


// This is the Blog Post API
const addBlog = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body

    data.auther = currentUser?._id

    try {
    if (!req.file) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Please Upload Image" })
    }
    data.image = await uploadFile(req.file, data?.image?.url || null);
        const newData = new blog(data)
        await newData.save()
        res.status(STATUS_CODE.OK).json({ message: `Blog Detail Inserted SuccessFully`, result: newData })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ statusCode: STATUS_CODE.SERVER_ERROR,message:"Some Thing Wrong", err })
    }

})

// This is the Blog Get API
const getAllBlog = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        const result = await blog.find({ auther: currentUser._id });
        res.status(STATUS_CODE.OK).json({ result: result, message: "Data Fatched SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Blog Get One Data API
const getBlogById = catchAsync(async (req, res) => {
    let BlogId = req.params.id
    try {
        const result = await blog.findById(BlogId).populate("auther");
        res.status(STATUS_CODE.OK).json({ result: result, message: "Data Fatched SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Blog Patch API
const updateBlogById = catchAsync(async (req, res) => {
    const data = req.body
    const BlogId = req.params.id;
    try {
        if (req.file) {
                data.image = await uploadFile(req.file, data?.image?.url || null);
            }
            console.log("This is data",req.body)
            const result = await blog.findByIdAndUpdate(BlogId, { $set: data });
        res.status(STATUS_CODE.OK).json({message: "Data Updated SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

// This is the Blog Delete API
const deleteBlogById = catchAsync(async (req, res) => {
    const BlogId = req.params.id
    try {
        const result = await blog.findByIdAndDelete(BlogId);
        res.status(STATUS_CODE.OK).json({ result: result, message: "Data Delete SuccessFully" })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ statusCode: STATUS_CODE.SERVER_ERROR, err })
    }
})

module.exports = { addBlog, getAllBlog, getBlogById, updateBlogById, deleteBlogById };