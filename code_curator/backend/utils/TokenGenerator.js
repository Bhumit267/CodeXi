// const User = require("../models/user.model");
const {ApiError} = require("../utils/ApiError");
const jwt = require("jsonwebtoken");

// a method that generates a JWT Accesstoken for the user
const generateAccessToken = function(user) {
    return jwt.sign(
      {
        _id: user._id,
        email: user.email,
        username: user.username,
        fullname: user.fullname
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_VALIDITY
      }
    )
}


const generateRefreshToken = function(user){
    return jwt.sign(
      {
        _id: user._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_VALIDITY
      }
    )
}

const generateAccessAndRefreshTokens = async (user, next) => {
    try{
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        const apiError = new ApiError(500, 'Internal Server Error');
        return next(apiError);
    }
}

module.exports = {generateAccessAndRefreshTokens}