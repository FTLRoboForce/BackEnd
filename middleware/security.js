const jwt = require('jsonwebtoken')
const {SECRET_KEY} = require('../config')
const {UnauthorizedError} = require('../utils/errors')


// Function to get JWT from header
const jwtFrom = ({headers}) => {
    if (headers?.authorization){
        const [scheme,token] = headers.authorization.split(" ")
        if(scheme.trim() === "Bearer"){
            return token
        }
    }
    return undefined
}
// function to add user to resource object


const extractUserFromJwt = (req,res,next) => {
    try {
        const token = jwtFrom(req)
        if(token){
            res.locals.user = jwt.verify(token,SECRET_KEY)
        }
        return next()
    }catch(err){
        return next()
    }
}

// function to verify user by jwt signature
const requrireAuthUser = (req,res,next) => {
    try{
        const {user} = res.locals
        if (!user?.email, user?.id,user?.username,user?.firstname,user?.lastname,user?.points,user?.totalquiz){
            throw new UnauthorizedError()
        }
        return next()

    }catch(err){
        return next(err)
    }
}

module.exports = {
    extractUserFromJwt,
    requrireAuthUser
}