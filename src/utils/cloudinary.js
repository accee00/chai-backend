import { v2 as cloudinary } from "cloudinary"
import fs from 'fs'
import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
})


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null

        /// upload file
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        })

        console.log(`File uploaded on cloudinary: ${response.url}`)
        return response
    } catch (e) {
        console.log(`Cloudinary Error ${e}`)
        fs.unlinkSync(filePath) /// remove temp file from server.
        return null
    }
}

export { uploadOnCloudinary }