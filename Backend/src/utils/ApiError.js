class apierror extends Error{
    constructor(
        message='something went wrong',
        stack='',
        code=500,
        errors=[]){
            super(message)
            this.message=message
            this.code=code
            this.data=null
            this.errors=errors
            this.success=false
            
            if(stack){
                this.stack=stack
            }
            else{
                Error.CaptureStackTrace(this,this.constructor)
            }
    }   
}

export {apierror}