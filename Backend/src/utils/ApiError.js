class apierror extends Error{
    constructor(
        code=500,
        message='something went wrong',
        stack='',
        errors=[]){
            super(message)
            this.message=message
            this.code=code
            this.data=null
            this.errors=errors
            this.success=false
            
            // if(stack){
            //     this.stack=stack
            // }
            // else{
            //     Error.CaptureStackTrace(this,this.constructor)
            // }
    }   
}

export {apierror}