const userValidator = require("../validators/user.validator");
const User = require("../models/user.model");
const { ApiError } = require("../utils/ApiError");
const { generateAccessAndRefreshTokens } = require("../utils/TokenGenerator");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc register or signup user
// @route POST /auth/signup
// access Public
const signUpUser = async (req, res, next) => {
  try {
    // console.log(userValidator.validate(req.body));
    const { error } = userValidator.validate(req.body);
    if (error) {
      const err = new ApiError(409, error.details[0].message);
      return next(err);
    }

    const { username, email, password, role, fullname, profileImage } =
      req.body;

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      const err = new ApiError(409, "User with this email already exists");
      return next(err);
    }

    // Check if the username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      // return res.status(409).json({ error: "This username already exists" });
      const err = new ApiError(409, "This username already exists");
      return next(err);
    }

    const user = await User.create({
      username: username.toLowerCase(),
      email,
      password,
      role,
      fullname,
      profileImage,
    });

    const createdUser = await User.findById(user._id).select(
      "-password"
    );

    if (!createdUser) {
      return res.status(500).json({ error: "User could not be created" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(createdUser, next);

    const cookieOptions = {
      httpOnly: true,
      secure: true
    }
    // Send a JSON response with the message "User will Sign up here"
    return res
      .status(201)
      .cookie("access-token", accessToken, cookieOptions)
      .cookie("refresh-token", refreshToken, cookieOptions)
      .json({ createdUser, message: "signed up successfully", refreshToken, accessToken });
  } catch (error) {
    console.error("Signup Error:", error); // Log the real error to console
    const errorMessage = error.message || "An error occurred during signup";
    const err = new ApiError(500, errorMessage);
    return next(err);
  }
};

// @desc login user/ set token & cookie
// route POST /auth/login
// access Public
const logInUser = async (req, res, next) => {
  try {

    const { email, username, password } = req.body;

    // if both email and username are not provided, show error || preventive check.
    if (!email && !username) {
      const err = new ApiError(400, "Email or username is required");
      return next(err);
    }

    // check if user exists by either username and email
    const user = await User.findOne({
      $or: [{ username }, { email }]
    });

    // if user not found
    if (!user) {
      const err = new ApiError(404, "User does not exist!");
      return next(err);
    }

    // if user found, check password by the method defined in User model
    const passwordMatch = await user.matchPassword(password);      // its User and not user: user is an instance of User. matchPassword is a method of User and used to check password of our user.

    if (!passwordMatch) {
      const err = new ApiError(401, "Password is incorrect!");
      return next(err);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user, next);

    const loggedInUser = await User.findById(user._id).select("-password");

    const cookieOptions = {
      httpOnly: true,
      secure: true
    }

    return res.status(200)
      .cookie("access-token", accessToken, cookieOptions)
      .cookie("refresh-token", refreshToken, cookieOptions)
      .json({ loggedInUser, message: "logged in successfully", accessToken, refreshToken });

  } catch (error) {
    // Handle any errors that occur during the login process
    // process.env.NODE_ENV == 'production' ? null : console.error(error);
    if (error.statusCode == 429) {
      // This is a rate limit error
      return next(new ApiError(429, error.message || "Too many attempts. Please try again later."));
    }
    const errorMessage = "An error occurred during login";
    const err = new ApiError(500, errorMessage);
    return next(err);
  }
};

// @desc logout user
// route POST /auth/logout
// access Public
const logOutUser = async (req, res, next) => {
  try {

    await User.findByIdAndUpdate(req.user._id, {
      $unset: {
        refreshToken: 1 // removes the field from the document
      }
    }, { new: true });

    // Clear the cookies
    const cookieOptions = {
      httpOnly: true,
      secure: true
    }

    // Response
    return res.status(200)
      // .clearCookie("access-token", cookieOptions)  
      // .clearCookie("refresh-token", cookieOptions)
      .json({ message: "User logged out successfully" });

  } catch (error) {
    // Handle any errors that occur during the logout process
    const err = new ApiError(500, "An error occurred during logout");
    next(err);
  }
};


const newAccessToken = async (req, res, next) => {

  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;  // refresh token from cookie or body

    if (!incomingRefreshToken) {
      const err = new ApiError(401, "Unauthorized Access");
      next(err);
    }

    // verify the incoming refresh Token
    const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findUserbyId(decodedToken?._id)

    if (!user) {
      const err = new ApiError(401, "Invalid refresh token")
      next(err);
    }

    // Check if the refresh token in db is the same as the refresh token in incoming token
    if (user?.refreshToken !== incomingRefreshToken) {
      const err = new ApiError('401', "Refresh token is expired or used")
      next(err);
    }

    // Cookie Options
    const cookieOptions = {
      secure: true,
      httpOnly: true
    }

    // If refreshToken is same, generate a new accessToken and refreshToken
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user, next);

    //response
    return res.status(200)
      .cookie("access-token", accessToken, cookieOptions)
      .cookie("refresh-token", refreshToken, cookieOptions)
      .json({ message: "accessToken refreshed", accessToken, refreshToken });

  } catch (error) {
    const err = new ApiError(401, error?.message || "An error occurred during accessToken refresh");
    next(err);
  }

}


const googleSignIn = async (req, res, next) => {
  try {
    const { token, userInfo } = req.body;

    // Verify the access token
    const ticket = await client.getTokenInfo(token);

    if (ticket.email !== userInfo.email) {
      throw new Error('Email mismatch');
    }

    // Check if user exists in your database
    let user = await User.findOne({ email: userInfo.email });

    if (!user) {
      // If user doesn't exist, create a new user
      user = await User.create({
        email: userInfo.email,
        fullname: userInfo.name,
        username: userInfo.email.split('@')[0], // or generate a unique username
        profileImage: userInfo.picture,
        password: Math.random().toString(36).slice(-8), // generate a random password
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user, next);

    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
      },
      accessToken,
      refreshToken,
      message: "Google Sign-In successful",
    });
  } catch (error) {
    next(new ApiError(500, error?.message || "An error occurred during Google Sign-In"));
  }
};


module.exports = {
  signUpUser,
  logInUser,
  logOutUser,
  newAccessToken,
  googleSignIn
};
