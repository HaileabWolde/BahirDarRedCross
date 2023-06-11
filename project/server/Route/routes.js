const express = require('express')
const User = require('../collection/user')
const Drug = require('../collection/drug')
const Notification = require('../collection/notification')
//const Chat = require('../db/chat')
//const Message = require('../db/message')
const auth = require('../middlewares/auth')
//const { check , validationResult } = require('express-validator')
const bycrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer') 
require('dotenv').config()

const router = express.Router()

router.post('/signup', async(req , res)=>{

    const { name , email , password } = req.body

    const user = await User.findOne({email})

    if(user){
       return res.json({
            errors: [
                {   
                    msg : "email is already exist",
                }
            ]
        })
    }
      else{
        const hashedPassword = await bycrypt.hash(password ,10)
        const newUser = await User.create({name , email , password : hashedPassword})
 
    const token = await jwt.sign({email : newUser.email},process.env.SECRET_WORD,{expiresIn : 36000})
    
    res.json({
        errors : [] ,
        data : {
            token ,
            user : {
               id : newUser._id ,
               email: newUser.email 

            }
        }
    })
    }}
)
router.post('/login' , async( req ,res )=>{
    
    const { email , password } = req.body
    const user = await User.findOne({email})

    if(!user){
        return res.json({
            errors: [
                {   
                    msg : "invalid credential",
                }
            ], 
            data : null
        })
    }
    const checkpassword = await bycrypt.compare(password , user.password)

    if(!checkpassword){
        return res.json({
            errors: [
                {   
                    msg : "invalid credential",
                }
            ]
        })
    }
    const token = await jwt.sign({email : user.email} , process.env.SECRET_WORD , {expiresIn: 36000})
   return res.json({
        errors : [] ,
        data : {
            token,
            user: {
                id : user.id ,
                email : user.email ,
                userType : user.userType
            }
        }
    })
})

router.get('/customer' ,auth, async(req , res)=>{
    
    const user = await User.find({userType : "customer"})
    return res.json(user)
})
router.get('/account' ,auth, async(req , res)=>{
    
    const user = await User.findOne({email : req.user})
    return res.json(user)
})
router.get('/totalCustomer' , auth , async(req , res) => {
    const user = await User.find({userType : "customer"})
    return res.json(user.length)
})
router.get('/employee' ,auth, async(req , res)=>{
    
    const user = await User.find({userType : "admin"})
    return res.json(user)
})

router.post('/add' ,async( req , res )=>{
    const {name ,email , password} = req.body
    const user = await User.findOne({email})

    if(user){
       return res.json({
            errors: [
                {   
                    msg : "email is already exist",
                }
            ]
        })
    }
    else{
        const users = await User.create({name , email , userType : "customer"}) 
        res.status(200).json(users)
    }
})
router.post('/forgot' ,async(req , res)=>{
    const { OTP , email } = req.body
   console.log(OTP ,email)

   const user = await User.findOne({email})
   if(!user){
    return res.json({
        errors: [
            {   
                msg : "email doesn't exist please signup first",
            }
        ]
    })
   }
    const transporter = nodemailer.createTransport({
        service : "gmail",
        auth : {
            user: "mekonendawit5@gmail.com" ,
            pass : process.env.EMAIL_PASS
        }
    })



    const mailOption = { 
        from : "Red Cross Pharmacy" ,
        to : email ,
        subject : "Password Reset",
        text : `The code to reset your password is ${OTP}`
    }
    transporter.sendMail(mailOption , (error ,info) => {
        if(error){
            res.json(error)
        }
        else{
            res.json('pass')
        }
    })
})

router.patch('/reset',async( req ,res )=>{
     const {password , email} = req.body
     const hashedPassword = await bycrypt.hash(password ,10)
     const user = await User.findOneAndUpdate({email : email }, {password : hashedPassword} ,{
        new : true ,
        runValidators : true
       })
     res.send(user)
})

router.patch('/:id',async(req , res)=>{
    const { id } = req.params
    const { name ,email  } = req.body
    const users = await User.findOneAndUpdate({_id : id }, {name ,email} ,{
     new : true ,
     runValidators : true
    })
  
    res.status(200).json(users)
})

router.delete('/:id' , async( req , res )=>{
    const {id } = req.params
    const users =await User.findOneAndRemove({_id : id})
    res.status(200).json(users)
})

router.get('/me', auth , async(req ,res)=>{
    const user = await User.findOne({email : req.user})
 res.json({
    errors: [],
    data : {
        user : {
            id : user.id,
            username : user.name,
            email : req.user ,
        }
    }
 })
})
router.post('/waiting' ,  async( req ,res )=>{
    const {  userId  , itemId} = req.body   
    const newState = 'waiting'
    console.log(itemId ,'userId')
    const user = await User.findById(userId).populate('cart.items.productId')
    const items = user.cart?.items.id(itemId)
    console.log(items)
    items.state = newState
    await user.save()
    
    res.json({
           
            info : {
               items : user.cart?.items ,
            }
    }
)
})

router.post('/approve' ,  async( req ,res )=>{
    const {  userId  , itemId} = req.body   
    const newState = 'approved'
    console.log(itemId ,'userId')
    const user = await User.findById(userId).populate('cart.items.productId')
    const items = user.cart?.items.id(itemId)
    console.log(items)
    items.state = newState
    await user.save()
    
    res.json({
           
            info : {
               items : user.cart?.items ,
            }
    }
)
})

router.post('/disprove' ,  async( req ,res )=>{
    const {  userId  , itemId} = req.body   
    const newState = 'stable'
    console.log(itemId ,'userId')
    const user = await User.findById(userId).populate('cart.items.productId')
    const items = user.cart?.items.id(itemId)
    console.log(items)
    items.state = newState
    await user.save()
    
    res.json({
           
            info : {
               items : user.cart?.items ,
            }
    }
)
})

router.post('/addNotification', async(req ,res )=>{
    const { user , drug , image ,item } = req.body
    const notification = await (await Notification.create({user : user , drug : drug , image : image ,item : item})).populate('user drug')
    res.json(notification)
})

router.get('/getNotification', async( req , res )=>{
    const notification = await Notification.find({seen : false}).populate('user drug')
    res.json(notification)
})

router.patch('/handleNotification/:id', async(req ,res)=>{
    const { id } = req.params    
    const notification = await Notification.findOneAndUpdate({_id : id},{seen : true},{
        new : true ,
        runValidators : true
       })
       const unseenNotification = await Notification.find({ seen : false})
    res.json(unseenNotification)
})

router.post('/approve' ,  async( req ,res )=>{
    const {  userId  , itemId} = req.body   
    const newState = 'approved'
    console.log(itemId ,'userId')
    const user = await User.findById(userId).populate('cart.items.productId')
    const items = user.cart?.items.id(itemId)
    console.log(items)
    items.state = newState
    await user.save()
    
    res.json({
           
            info : {
               items : user.cart?.items ,
            }
    }
)
})






module.exports = router

/* 
router.post('/approve' , auth , async( req ,res )=>{
    const { drugId } = req.body
    const drug =await Drug.findOneAndUpdate({_id : drugId },{'approved':true})
    res.json(drug)
})



645bf105ee3ba0d7785b1ff0
645a7e90d1ba5fba5c8c2dd5

[check("email","Please enter a valid email").isEmail(),
                      check("password","password must be graterthan 5 characters").isLength({min:6})] 
const validationErrors = validationResult(req)

    if(!validationErrors.isEmpty()){
      const errors = validationErrors.array().map(error =>{
        return { msg : error.msg}
      })
       return res.json({errors})
    }


    router.post('/chat',auth , async(req ,res )=>{
    const { users , message } = req.body
   const text = await (await Message.create(message))
    const chat = await (await (await (await Chat.create({users ,message :text})).populate('users')).populate('message'))
    res.json(chat)
})
router.get('/allchats',auth,async(req, res )=>{
    const chats = await Chat.find({_id : req.query})
    res.send(chats)
})


router.get('/all' ,auth, async(req , res)=>{
    const { name } = req.query
    const queryObject = {}
    if(name){
      queryObject.name = {$regex : name , $options : 'i'}
    }
    const user = await User.find(queryObject).find({email : {$ne : req.user}})
    return res.json(user)
})

router.get('/getNotification',auth ,async( req ,res )=>{
    const pharmacist = await User.findOne({userType : 'pharmacist'})
    const notification = await pharmacist.notification.populate('user drug')
    res.json(notification)
})
*/