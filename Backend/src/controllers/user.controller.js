import { asyncHandler } from "../utils/asyncHandler.js"
import { apierror } from '../utils/ApiError.js'

import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { apiResponse } from "../utils/ApiResponse.js";
const userRegister = asyncHandler(

    async (req, res, next) => {
        //get user details from frontend
        //validate the data recieved - not empty
        //check if user already exists - emai, username
        //check for images - avatar , coverImage
        // upload the images to cloudinary - avatar
        //create user object - create enty in db
        //remove password and refreshToken feild from response
        //check for user creation
        //return response
        console.log("FILES RECEIVED:", req.files);
        console.log("Body:", req.body);
        console.log("Content-Type:", req.headers["content-type"]);

        const { username, email, fullname, password } = req.body || {}
        

        // if(username==='') throw new apierror(401,'username is required') 
        // if(email==='') throw new apierror(400,'email is required')
        if ([username, email, fullname, password].some((feild) => feild?.trim() === "")) {
            throw new apierror(400, 'all feilds are required!')
        }

        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        // console.log(existedUser)
        if (existedUser) throw new apierror(400, 'username or Email already Exists')
            
            if (!req.files || Object.keys(req.files).length === 0) {
  console.warn("No files were uploaded.");
}

        const localavatarPath = req.files?.avatar?.[0]?.path;
        const localCoverImage = req.files?.coverImage?.[0]?.path;

        if (!localavatarPath) throw new apierror(400, 'avatar is required!')

        const avatar = await uploadOnCloudinary(localavatarPath)
        const coverImage = await uploadOnCloudinary(localCoverImage)
        console.log(avatar)

        if (!avatar) throw new apierror('uploading the avatar to cloudinary failed!')

        const user = await User.create({
            fullname,
            email,
            avatar: avatar.url,
            password,
            username: username.toLowerCase(),
            coverImage: coverImage?.url
        })

        const createdUser =await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if (!createdUser) {
            throw new apierror(500, 'something went Wrong While Creating User')
        }

        return res.status(201).json(
            new apiResponse(200, createdUser, 'User registerd successfully')
        )


    }
)

export default userRegister