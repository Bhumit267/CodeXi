const User = require("../models/user.model")
const { ApiError } = require("../utils/ApiError");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const userValidator = require("../validators/user.validator");
const { v2: cloudinary } = require('cloudinary');

// @desc toggle solved problem
// @route POST /user/solve-problem
// @access Private
const toggleSolvedProblem = async (req, res, next) => {
    try {
        const { slug } = req.body;
        if (!slug) {
            return next(new ApiError(400, "Problem slug is required"));
        }

        const user = await User.findById(req.user._id);

        // check if problem is already solved
        if (user.solvedProblems.includes(slug)) {
            // Optional: Toggle off? Or just return success?
            // For now, let's keep it idempotent (if solved, remains solved)
            // Or typically users want to see it marked. 
            // If we want to toggle (unsolve), we can do that. 
            // But usually "Submission" means solved.
            // Let's make it add only.

            if (!user.solvedProblems.includes(slug)) {
                user.solvedProblems.push(slug);
                await user.save({ validateBeforeSave: false });
            }
        } else {
            user.solvedProblems.push(slug);
            await user.save({ validateBeforeSave: false });
        }

        return res.status(200).json({
            message: "Problem marked as solved",
            solvedProblems: user.solvedProblems
        });

    } catch (error) {
        next(new ApiError(500, error?.message || "Error updating solved problems"));
    }
}

// @desc get user profile
// @route GET /user/profile
// @access Private
const getUserProfile = async (req, res, next) => {
    try {
        return res.status(200).json({ user: req.user, message: "User fetched Successfully" });
    } catch (error) {
        const err = new ApiError(500, error?.message || "Cannot get user profile");
        next(err);
    }
}

// @desc update user profile
// @route PATCH /user/profile
// @access Private
const updateUserProfile = async (req, res, next) => {

    try {
        const { error } = userValidator.validate(req.body);
        if (error) {
            const err = new ApiError(409, error.details[0].message);
            return next(err);
        }

        const { username, email, fullname } = req.body;

        const userExists = await User.findOne({ email, username, _id: { $ne: req.user._id } });
        if (userExists) {
            const err = new ApiError(409, "User with this email or username already exists");
            return next(err);
        }

        const user = await User.findByIdAndUpdate(req.user._id, {
            $set: {
                username,
                email,
                fullname
            }
        }, { new: true }).select("-password -refreshToken");

        return res.status(200).json({ user, message: "User updated successfully" });
    } catch (error) {
        const err = new ApiError(500, error?.message || "Cannot get user profile");
        next(err);
    }
}

// @desc update user password
// @route PATCH /user/password
// @access Private
const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        const passwordMatch = await user.matchPassword(currentPassword);

        if (!passwordMatch) {
            const err = new ApiError(401, "Current password is incorrect");
            return next(err);
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        const err = new ApiError(500, error?.message || "Cannot update password");
        next(err);
    }
}

const updateProfileImage = async (req, res, next) => {
    try {
        const imageLocalPath = req.file?.path;

        if (!imageLocalPath) {
            const err = new ApiError(400, "Profile image is required");
            return next(err);
        }

        const image = await uploadOnCloudinary(imageLocalPath);

        if (!image || !image.url) {
            const err = new ApiError(500, "Cannot upload profile image");
            return next(err);
        }

        const user = await User.findByIdAndUpdate(req.user._id, {
            $set: {
                profileImage: image.url
            }
        }, { new: true }
        ).select("-password -refreshToken");

        // Delete the old image from Cloudinary
        if (user.profileImage && user.profileImage.includes('res.cloudinary.com')) {
            const oldImagePublicId = user.profileImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(oldImagePublicId);
        }

        return res.status(200).json({ user, message: "Profile image updated successfully" })

    } catch (error) {
        const err = new ApiError(500, error?.message || "Cannot update profile image");
        next(err);
    }
}

const deleteProfile = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.status(200).json({ message: "Profile deleted successfully" });
    } catch (error) {
        const err = new ApiError(500, error?.message || "Cannot delete Your Profile");
        next(err);
    }
}

module.exports = {
    getUserProfile,
    updateUserProfile,
    updatePassword,
    updateProfileImage,
    deleteProfile,
    toggleSolvedProblem
}