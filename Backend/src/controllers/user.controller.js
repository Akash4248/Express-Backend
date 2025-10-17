import { asyncHandler } from "../utils/asyncHandler.js"
import { apierror } from '../utils/ApiError.js';
import fs from 'fs'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { apiResponse } from "../utils/ApiResponse.js";
import { access, accessSync } from "fs";
import jwt from 'jsonwebtoken'

const deleteImageonCloudinary = asyncHandler(async (imagepath)=>{
        
})

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

const updateCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldpassword,newpassword} = req.body;
    const user=req.user;
    const ispasswordcorrect = await user.ispasswordCorrect(oldpassword);
    if(!ispasswordcorrect) 
        throw new apierror(400,'Invalid Old Password')
    user.password=newpassword;
    await user.save({validateBeforeSave:false})

   return res.status(200)
    .json(new apiResponse(200,
        {},
        "password Updated Successfully"
    ))

})

const getCurrentUser = asyncHandler(async (req,res)=>{
    // const user = await User.findById(req.user?._id).select("-password")
    // if(!user) {
    //     throw new apierror(400,"User Not Found! in db")
    // }
   return  res.status(200)
    .json(
        new apiResponse(200,req.user,"User Fetched Successfully")
    )

})

const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {email,fullname} = req.body
        if(!email || !fullname ) throw new apierror(400,"all the feilds are Required!")
    const updateduser = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            email,
            fullname
        }
    },{
        new: true
    }).select("-password")

    if(!updateduser) throw new apierror(400,"Failed TO update User")

    return res.
    status(200)
    .json(
        new apiResponse(200,updateduser,"user Updated Successfully")
    )

})

const updateAvatar = asyncHandler(async (req,res)=>{
    const loaclAvatarPath= req.file?.path
    if(!loaclAvatarPath) throw new apierror(400,'Avatar Image is Not Uploaded Correctly')
  const avatar = await uploadOnCloudinary(loaclAvatarPath)
    if(!avatar.url) throw new apierror(500,'Failed To upload the avatar on Cloudinary!')
    
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar:avatar.url
        }
    },{
        new:true
    }).select("-password")
    if(!user) throw new apierror(500,'Failed to Upadate the Avatar in DB')
    
    return res.
    status(200)
    .json(new apiResponse(200,user))
})

const updatecoverImage = asyncHandler(async (req,res)=>{
    const loaclcoverImage= req.file?.path
    if(!loaclcoverImage) throw new apierror(400,'Cover Image is Not Uploaded Correctly')
  const coverImage = await uploadOnCloudinary(loaclcoverImage)
    if(!coverImage.url) throw new apierror(500,'Failed To upload the coverImage  on Cloudinary!')
    
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage:coverImage.url
        }
    },{
        new:true
    }).select("-password")
    if(!user) throw new apierror(500,'Failed to Upadate the coverImage in DB')
    
    return res.
    status(200)
    .json(new apiResponse(200,user))
})

const getChannelDetails= asyncHandler(async (req,res)=>{

})


export { userRegister, userLogin, userLogout ,refreshAccessToken 
    ,updateCurrentPassword
    ,getCurrentUser
    ,updateAccountDetails,
    updateAvatar,
    updatecoverImage
}