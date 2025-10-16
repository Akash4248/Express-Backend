import { asyncHandler } from "../utils/asyncHandler.js"
import { apierror } from '../utils/ApiError.js'

import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { apiResponse } from "../utils/ApiResponse.js";
import { access } from "fs";
import jwt from 'jsonwebtoken'

const generateAccesstokenAndRefreshToken=asyncHandler(
   async  (userId)=>{
        try {
            const user=await User.findById(userId)
            const accessToken=User.generateAccessToken();
            const refreshToken =User.generateRefershToken();
            user.refreshToken=refreshToken;

            await user.save({validateBeforeSave:false})
            return {accessToken,refreshToken}
        } catch (error) {
            throw new apierror(500,'Generating Access Token or refreshToken failed!')
        }
    }
)
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

        const createdUser = await User.findById(user._id).select(
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


const userLogin = asyncHandler(
    async (req, res, next) => {
        //get the login details from front end - req.body
        //check user exist? User.findOne()
        //check the password is correct? 
        // generate the accessToken and RefreshToken - update RefreshToken
        // store the tokens in cookie
        console.log(req.body)
        const { username, email, password } = req.body || {};

        const userExists = await User.findOne({
            $or: [
                { username: username?.toLowerCase().trim() },
                { email: email?.toLowerCase().trim() }
            ]
        })
        console.log(userExists)
        if (!userExists) throw new apierror(400, 'User Not found!');

        const passwordCorrect = await userExists.ispasswordCorrect(password)
        if (!passwordCorrect) throw new apierror(400, 'password is Incorrect!')

        const {accessToken,refreshToken}= generateAccesstokenAndRefreshToken(userExists._id)


        const options = {
            httpOnly: true,
            secure: true
        }
        res.status(200).cookie('AccessToken', accessToken, options).cookie('RefreshToken', refreshToken, options).json({
            success: true,
            message: "User logged in successfully",
            accessToken,
            refreshToken,
            user: {
                id: userExists._id,
                username: userExists.username,
                email: userExists.email,
            },
        })

    }
)

const userLogout = asyncHandler(
    async (req, res, next) => {
        User.findByIdAndUpdate(req.user._id, {
            $set: {
                refreshToken: undefined
            }
        },
            {
                new: true
            }
        )
         const options = {
            httpOnly: true,
            secure: true
        }
        return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
            new apiResponse(200,'User logged Out')
        )
    }
)

const refreshAccessToken = asyncHandler(
    async  (req,res)=> {
        try {
            const incomingRefreshToken = req.cookie?.AccessToken || req.body.AccessToken;
            if(!incomingRefreshToken) throw new apierror;
    
            const decodedToken = jwt.verify(
                incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
            )
            const user = await User.findById(decodedToken._id)
            if(!user) 
                throw new apierror(401,'Unauthorized Access')
    
            if(incomingRefreshToken!==user.refreshToken)
                throw new apierror(401,'Refresh Token is Expired! or Used!')
            const options = {
                httpOnly: true,
                secure: true
            }
            const {accessToken,newrefreshToken} = await  generateAccesstokenAndRefreshToken(user._id)
    
            res.status(200)
            .cookie('AccessToken',accessToken)
            .cookie('RefreshToken',newrefreshToken)
            .json(
                new apiResponse(200,
                    {
                        accessToken,
                        newrefreshToken
                    },"accessToken Refreshed Successfully"
                )
            )
        } catch (error) {
            throw new apierror(401,error?.message || 'invalid AccessToken')
        }


    }
)
export { userRegister, userLogin, userLogout ,refreshAccessToken }