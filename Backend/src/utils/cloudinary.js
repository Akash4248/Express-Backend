import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async function (localFilePath) {
        try {
                if (!localFilePath) return null

                const file = await cloudinary.uploader.upload(localFilePath, {
                        resource_type: 'auto',

                })
                console.log('file is uploaded on cloudinary', file.url)
                fs.unlinkSync(localFilePath)
                return file
        } catch (error) {
                console.log('File upload Error on Cloudinary', error);
                fs.unlinkSync(localFilePath) // remove the locally saved file on server 

        }
}

export {uploadOnCloudinary}
