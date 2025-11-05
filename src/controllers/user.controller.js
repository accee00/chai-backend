import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteLocalFiles } from "../utils/deleteLocalFiles.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { refreshToken, accessToken }

    } catch (error) {
        throw new ApiError({
            statusCode: 500,
            message: "Something went wrong while genetating referesh and access tokens."
        })
    }
}
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
            message: "User created successfully.",
        })
    );
});

const logInUser = asyncHandler(async (req, res) => {
    const { email, password, userName } = req.body

    if (!email && !userName) {
        throw new ApiError({
            statusCode: 400,
            message: "User name or email is required."
        })
    }

    /// find user
    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (!user) {
        throw new ApiError({
            statusCode: 404,
            message: "User does not exist."
        })
    }
    /// to access custom method we can use user that we fetch from db. User does not contain these method.
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError({
            statusCode: 401,
            message: "Invalid user credentials."
        })
    }

    /// correct password generate access and referesh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    /// get updated user after settung refresh token. sending refresh token for mobile.
    const loggedInUser = await User.findById(user._id).select("-password")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .cookie(
            "accessToken", accessToken, options,)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse({
            statusCode: 200,
            data: {
                user: loggedInUser,
                acessToken: accessToken,
            },
            message: "User logged in successfully."
        }))

})

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined,
        }
    },
        {
            /// returns updated value.
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }
    res.status(200).clearCookie("accessToken", options)
        .clearCookie("refreshToken")
        .json(new ApiResponse({
            statusCode: 200,
            message: "User logged out."
        }))
})

const refreshAccessTokens = asyncHandler(async (req, res) => {

    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingToken) {
        throw new ApiError({
            statusCode: 401,
            message: "Unauthorized request"
        })
    }
    try {

        const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (decodedToken !== user?.refreshToken) {
            throw new ApiError({
                message: "Invalid refresh token",
                status: 401,
            })
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
        const options = {
            httpOnly: true,
            secure: true,
        }
        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options).json(new ApiResponse({
                message: "Refresh and Access token generated successfully.",
                statusCode: 200,
                data: {
                    refreshToken,
                    accessToken,
                }
            }))
    } catch (error) {
        throw new ApiError({
            status: 401,
            message: error?.message || "Invalid token."
        })
    }
})
export { registerUser, logInUser, logOutUser, refreshAccessTokens };
