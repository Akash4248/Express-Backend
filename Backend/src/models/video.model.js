import mongoose  from "mongoose";
import mongooseAggregatepaginate from 'mongoose-aggregate-paginate-v2'
const videoshema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        

    },
    description:{
        type:String,
        required:true,
        
    },
    videofile:{
        type:String,
        required:true,
    },
    thumbnail:{
         type:String,
        required:true,
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0,  
    },
    ispublished:{
        type:Boolean,
        required:true
    }
    ,
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
}
,
{timestamps:true})


videoshema.plugin(mongooseAggregatepaginate)

export const Video = mongoose.model('Video',videoshema)