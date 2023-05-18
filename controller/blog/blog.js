const express = require("express");
const blog = require("../../model/blogs");
const catchAsync = require("../../utils/catchAsync");
const { uploadFile } = require("../../utils/uploader");
const { SUCCESS_MSG, ERRORS, STATUS_CODE, ROLES } = require("../../constants/index")


// This is the Blog Post API
const addBlog = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body

    data.auther = currentUser?._id

    try {
        if (!data.title || data.title == "" || !data.detail || data.detail == "" || !req.file || req.file == "") {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELD })
        }
        data.image = await uploadFile(req.file, data?.image?.url || null);
        const newData = new blog(data)
        await newData.save()
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.CREATED, result: newData })
    } catch (err) {
        res.status(STATUS_CODE.SERVER_ERROR).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }

})

// This is the Blog Get API
const getAllBlog = catchAsync(async (req, res) => {
    try {
        let currentUser = req.user;
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role)) {
            result = await blog.find({});
        } else {
            result = await blog.find({ auther: currentUser._id });
        }
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result: result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the get All Public Blog Which is Approve Data API
const getPublicBlog = catchAsync(async (req, res) => {
    try {
        const result = await blog.find({ status: "approved" })
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Blog Get One Data API
const getBlogById = catchAsync(async (req, res) => {
    let BlogId = req.params.id
    try {
        const result = await blog.findById(BlogId);
        res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.SUCCESS, result })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is update Review Blog API
const reviewBlog = catchAsync(async (req, res) => {
    const { blogId, status } = req.body;
    try {
        if (!status || status == "") {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.REQUIRED.FIELD })
        }
        const FindOne = await blog.findOne({ _id: blogId, status: "pending" })
        console.log(FindOne)
        if (FindOne) {
            if (FindOne.status == "approved" || FindOne.status == "rejected") {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.ALREADY })
            } else {
                const result = await blog.findOneAndUpdate({ _id: blogId }, { $set: { status: status } }, { new: true })
                return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE, result })
            }
        } else {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.ALREADY })
        }
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Blog Patch API
const updateBlogById = catchAsync(async (req, res) => {
    const currentUser = req.user;
    const data = req.body;
    const BlogId = req.params.id;
    try {
        const FindOne = await blog.findById(BlogId)
        if (!FindOne) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        if (data.status) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.UNAUTHORIZED.UNAUTHORIZE })
        }
        if (data.isImgDel == "true") {
            data.image = {};
        } else {
            if (req.file) {
                data.image = await uploadFile(req.file, data?.image?.url || null);
            }
        }
        data.status = "pending";
        const result = await blog.findByIdAndUpdate(BlogId, data, { new: true });
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE, result: result })
        console.log(result)
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

// This is the Blog Delete API
const deleteBlogById = catchAsync(async (req, res) => {
    const BlogId = req.params.id
    const currentUser = req.user
    try {
        const FindOne = await blog.findById(BlogId)
        if (!FindOne) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.INVALID.NOT_FOUND })
        }
        let result;
        if ([ROLES.ADMIN, ROLES.SUPERADMIN].includes(currentUser.role)) {
            result = await blog.findByIdAndDelete(BlogId);
        } else {
            result = await blog.findOneAndDelete({ _id: BlogId, auther: currentUser._id });
        }
        return res.status(STATUS_CODE.OK).json({ message: SUCCESS_MSG.SUCCESS_MESSAGES.DELETE })
    } catch (err) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ message: ERRORS.PROGRAMMING.SOME_ERROR, err })
    }
})

module.exports = { addBlog, getAllBlog, getPublicBlog, getBlogById, reviewBlog, updateBlogById, deleteBlogById };