import { Router } from "express";
import { registerUser, logInUser, logOutUser, refreshAccessTokens, changePassword, getCurrentUser, updateUserAvatar, updateAccountDetail, updateUserProfile, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
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

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

///Patch - Body (send only what you want to change)
router.route("/update-detail").patch(verifyJWT, updateAccountDetail)

router.route("/update-profile").patch(verifyJWT, upload.single("avatar"), updateUserProfile)

router.route("/get-channel-profile/:username").get(verifyJWT, getUserChannelProfile);

export default router