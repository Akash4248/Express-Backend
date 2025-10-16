import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
const userShema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,
        required: true

    },
    coverimage: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],

    },
    refreshToken: {
        type: String,

    }
    , watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video'
        }
    ]


},
    {
        timestamps: true
    })

userShema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password =await bcrypt.hash(this.password, 8)
    next();
})

userShema.methods.ispasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password)
}

userShema.methods.generateAccessToken = function () {
   return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullname: this.fullname,
            username: this.username,

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIARY
        }
    )
}
userShema.methods.generateRefershToken = function () {
   return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIARY
        }
    )
}
export const User = mongoose.model('User', userShema)