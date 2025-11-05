import { Router } from "express";
import { registerUser, logInUser, logOutUser, refreshAccessTokens, changePassword, getCurrentUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        }, {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser
)

router.route("/login").post(logInUser)

router.route("/logout").post(verifyJWT, logOutUser)

router.route("/refresh-token").post(refreshAccessTokens)

router.route("/change-password").post(verifyJWT, changePassword)

router.route("/get-user").get(verifyJWT, getCurrentUser)


export default router