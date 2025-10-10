import dotenv from 'dotenv';
import { app } from './app.js'
dotenv.config({
  path: './.env'
})
import connectDB from './db/index.js'
connectDB().then(
  () => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is Running on port ${process.env.PORT || 8000}`)
    })
    app.on("error", (error) => {
      console.error("Error occuered~!!!!!!!!!!!!!!!!",error)
      throw error
    })
  }
).catch((error) => {
  console.log('MongoDB Connection Error:', error)
})



// import mongoose from 'mongoose'
// // require('dotenv').config({path:'./env'})
// import { DB_NAME } from './constants.js'
// import express from 'express'
// const app=express()
// first method
// ;(async ()=>{
//     try{
//        const db= await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)
// app.on("error",(error)=>{
//     console.error("Error")
//     throw error
// })
//         app.listen(`${process.env.PORT}`,()=>{

//             console.log(`Server is listening to port ${process.env.PORT}`)
//         })


//     }
//     catch(error){
//         console.error(error)
//         throw error
//     }
// })()