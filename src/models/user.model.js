import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { use } from "react";


const userSchema = new mongoose.Schema(
    {
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        password: {
            type: String,
            required: [true, "Password is required."],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true

    }
)

/// read more about hooks in mongoose.
/// Mongoose hooks, also known as middleware, are functions that are executed 
// automatically before or after specific asynchronous operations within Mongoose. 
// These operations can include saving, validating, removing, or querying documents.
// Hooks provide a way to add custom logic and enforce data integrity at various stages
// of a document's lifecycle.
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

    this.password = bcrypt.hash(this.password, 10)
    next()
})
userSchema.methods.isPasswordCorrect = async function (password) {
    await bcrypt.compare(password,this.password)
}

userSchema.method.generateAccessToken = function() {
    return jwt.sign(
       { 
        _id:this._id,
        email:this.email,
        userName:this.userName,
        fullName:this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY 
    }
    )
}
userSchema.method.generateRefreshToken = function() {
    return jwt.sign(
       { 
        _id:this._id,
        email:this.email,
        fullName:this.fullName,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY 
    }
    )
}
export const User = mongoose.model("User", userSchema)
