const jwt = require("jsonwebtoken");
const {ApiError} = require("../utils/ApiError");
const User = require("../models/user.model");

const verifyJWTToken = async (req, res, next) => {
    try {
        
        const token = req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];

        // console.log("token: ", token);

        if (!token){
            const err = new ApiError(401, "Unauthorized Access");
            next(err);
        }

        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if(!user){
            const err = new ApiError(401, "Inavalid Access Token");
            next(err);
        }

        req.user = user;

        next();

    } catch (error) {
        const err = new ApiError(401, error?.message || "Invalid Access Token");
        next(err);
    }
}

module.exports = {verifyJWTToken};