import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteLocalFiles } from "../utils/deleteLocalFiles.js";
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, userName } = req.body;

    if ([fullName, email, password, userName].some((field) => !field || field.trim() === "")) {
        throw new ApiError({
            statusCode: 400,
            message: "All fields are required.",
        });
    }
    /// Find existing user by email or userName.
    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if (existingUser) {
        /// delete file from local storage
        deleteLocalFiles([avatarLocalPath, coverImageLocalPath])
        throw new ApiError({
            statusCode: 400,
            message: "User already exists.",
        });
    }

    if (!avatarLocalPath) {
        throw new ApiError({
            statusCode: 400,
            message: "Avatar file is required.",
        });
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    if (!avatar) {
        throw new ApiError({
            statusCode: 400,
            message: "Avatar upload failed.",
        });
    }
    const user = await User.create({
        fullName,
        userName,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError({
            statusCode: 500,
            message: "Something went wrong while creating a user.",
        });
    }

    return res.status(201).json(
        new ApiResponse({
            statusCode: 201,
            data: createdUser,
            message: "User validation successful (no user created yet).",
        })
    );
});

export { registerUser };
