
//Using Promises
const asyncHandler= (requestHandler)=>{
   return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err)) 
    }
}



export {asyncHandler}

//try catch approach
// const asyncHandler=(fn)=>async(req,res,next)=>{

//     try{
//         await fn(req,res,next)
//     }
//     catch(err){
//         console.error(err);
//         res.status(err.code||500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }


