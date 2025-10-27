import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, userName } = req.body;

    if ([fullName, email, password, userName].some((field) => !field || field?.trim() === "")) {
        throw new ApiError({
            statusCode: 400,
            message: "All fields are required.",
        });
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { userName }],
    });

    if (existingUser) {
        throw new ApiError({
            statusCode: 400,
            message: "User already exists.",
        });
    }


    // return res
    //     .status(200)
    //     .json(
    //         new ApiResponse({
    //             statusCode: 200,
    //             data: null,
    //             message: "User validation successful (no user created yet).",
    //         })
    //     );
});

export { registerUser };
