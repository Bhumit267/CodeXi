const Snippet = require('../models/snippet.model');
const {ApiError} = require("../utils/ApiError");

const createSnippet = async(req, res, next) => {
    try{
        const {title, language, code} = req.body;
        const snippet = await Snippet.create({
            user: req.user._id,
            title,
            language,
            code
        });
        res.status(201).json({snippet, message: "Snippet created successfully"});
    } catch (error) {
        console.log(error);
        next(new ApiError(500, error?.message || "Cannot create snippet"));
    }
}

const getUserSnippets = async(req, res, next) => {
    try {
        const snippets = await Snippet.find({user: req.user._id}).sort({updatedAt: -1});
        res.status(200).json({snippets, message: "Snippets fetched successfully"});
    } catch (error) {
        next(new ApiError(500, error?.message || "Cannot get snippets"));
    }
}

const getSnippetById = async(req, res, next) => {
    try {
        const snippet = await Snippet.findOne({_id: req.params.id, user: req.user._id});
        if(!snippet){
            next(new ApiError(404, "Snippet not found"));
        }
        res.status(200).json({snippet, message: "Snippet fetched successfully"});
    } catch (error) {
        next(new ApiError(500, error?.message || "Cannot get snippet"));
    }
}

const updateSnippet = async(req, res, next) => {
    try {
        const {title, language, code} = req.body;
        const snippet = await Snippet.findOneAndUpdate({_id: req.params.id, user: req.user._id}, {
            title,
            language,
            code,
            updatedAt: Date.now()
        }, {new: true});
        if(!snippet){
            next(new ApiError(404, "Snippet not found"));
        }
        res.status(200).json({snippet, message: "Snippet updated successfully"});
    } catch (error) {
        next(new ApiError(500, error?.message || "Cannot update snippet"));
    }
}

const deleteSnippet = async(req, res, next) => {
    try {
        const snippet = await Snippet.findOneAndDelete({_id: req.params.id, user: req.user._id});
        if(!snippet){
            next(new ApiError(404, "Snippet not found"));
        }
        res.status(200).json({snippet, message: "Snippet deleted successfully"});
    } catch (error) {
        next(new ApiError(500, error?.message || "Cannot delete snippet"));
    }
}

module.exports = {
    createSnippet,
    getUserSnippets,
    getSnippetById,
    updateSnippet,
    deleteSnippet
}