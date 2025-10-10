import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB=async ()=>{

    try {
    const connectionInstance=await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)
    console.log(`\n MongoDB Connected!! DB Host: ${connectionInstance}`)
        
    } catch (error) {
        console.error('mongoDB connection ERROR',error);
        process.exit(1)
    }
}

export default connectDB;