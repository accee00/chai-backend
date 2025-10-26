import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {

    let { email, name } = req.body;

    /// Validations are must.
    if (!email || !name)
        res.status(400).json({
            message: "Email and name are required. ",
            statusCode: 400,
        })

    /// Check if user already exists
})

export { registerUser }