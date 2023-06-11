const jwt = require('jsonwebtoken')

const auth = async( req , res, next ) => {
    let token = req.header("authorization")
    if(!token){
        return res.json({
            errors: [
                {   
                    msg : "not authorized",
                }
            ]
        })
    }
   token = token.split(" ")[1]
   let user
   try {
     user = await jwt.verify(token , process.env.SECRET_WORD)
   } catch (error) {
    return res.status(401).json({
        errors: [
            {   
                msg : "not authorized",
            }
        ]
    })
   }
  req.user = user.email 
  next()
}
module.exports = auth