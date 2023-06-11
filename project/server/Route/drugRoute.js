const express = require('express')
const router = express.Router()
const Drug = require('../collection/drug')
const User = require('../collection/user')
const auth = require('../middlewares/auth')
const cron = require('node-cron');
const axios = require('axios');
const nodemailer = require('nodemailer');

cron.schedule('0 0 * * *', async () => {
  const response = await axios.get('http://localhost:5000/api/v1/drug/checkExpiry');
  const expiredProducts = response.data;
  // TODO: send notifications to admin
  
  const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user: "mekonendawit5@gmail.com" ,
        pass : process.env.EMAIL_PASS
    }
})
  
  const mailOptions = {
    from : "Red Cross Pharmacy" ,
    to : email ,
    subject: 'Expired drug products',
    text: expiredProducts.map(p => p.name).join(', ')
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
});


router.get('/all' ,async (req ,res )=> {
    const drugs = await Drug.find({})
    res.json(drugs)
}) 
router.patch('/:id',async(req , res)=>{
    const { id } = req.params
    const { name ,category , subCategory , type , price ,description , image  } = req.body
    const drugs = await Drug.findOneAndUpdate({_id : id }, { name ,category , subCategory , type , price ,description , image } ,{
     new : true ,
     runValidators : true
    })
    res.status(200).json(drugs)
})
router.post('/add' ,async( req , res )=>{
    const { name , category ,subCategory , image , type , description , price} = req.body
    const drug = await Drug.findOne({ name })

    if(drug){
       return res.json({
            errors: [
                {   
                    msg : "drug is already exist",
                }
            ]
        })
    }
    else{
        const drugs = await Drug.create({ name , category ,subCategory , image , type , description , price}) 
        res.status(200).json(drugs)
    }
})
router.delete('/:id' , async( req , res )=>{
    const {id } = req.params
    const drugs =await Drug.findOneAndRemove({_id : id})
    res.status(200).json(drugs)
})

router.get('/checkExpiry', async (req, res) => {
    const expiredProducts = await Drug.find({ expiryDate: { $lte: new Date() } });
    res.json(expiredProducts);
  });

router.get('/quantity' , async( req ,res )=>{
    const drugs = await Drug.find({})

    const lessQuantityDrugs = drugs.filter(drug => {
        const { quantity } = drug
        return quantity <= 5
            
    })
    res.json(lessQuantityDrugs)
})

router.post('/cart', async(req , res)=>{
    const { userId , drugId } = req.body
    const drug = await Drug.findOne({_id : drugId })
    const user = await User.findOne({_id : userId })
    
    let isExitsting = user.cart.items.findIndex(objInItem => { 
        return new String(objInItem.productId).trim() === new String(drug?._id).trim() })    
    if(isExitsting >= 0 ){
        existingProductInCart = user.cart.items[isExitsting]
        if(existingProductInCart.quantity < 3){
         existingProductInCart.quantity += 1
         user.save()
        }
      
     } else{
         user.cart.items.push({ productId : drug?._id , quantity : 1})
         user.save()
     }
     if(!user.cart.totalPrice){
        user.cart.totalPrice = 0;
     }
     user.cart.totalPrice += drug?.price;
     const items = user.cart.items
     const totalPrice = user.cart?.totalPrice
     res.json({
             cart : {
                items : items ,
                totalPrice: totalPrice
             }
     }
 )
   
})
router.post('/cartMinus',auth, async(req ,res ) => {
    const { userId , drugId } = req.body
    const drug = await Drug.findOne({_id : drugId })
    const user = await User.findOne({_id : userId })
    
    let isExitsting = user.cart.items.findIndex(objInItem => { 
        return new String(objInItem.productId).trim() === new String(drug?._id).trim() })   

    if(isExitsting >= 0){
        existingProductInCart = user.cart.items[isExitsting]
        if(existingProductInCart.quantity <= 1){
            user.cart.items.splice(isExitsting , 1)
            user.cart.totalPrice -=  drug.price;
            user.save()
        } else{
            existingProductInCart = user.cart.items[isExitsting]
            existingProductInCart.quantity -= 1
            user.cart.totalPrice -= drug.price;
                        user.save()
        }
     } 
     const items = user.cart.items
     const totalPrice = user.cart.totalPrice
     res.json({
             cart : {
                items : items ,
                totalPrice: totalPrice
             }
     }
 )
})
router.post('/removeCart', auth,async(req , res)=>{
    const { userId , drugId ,qty } = req.body
    console.log(userId ,'userId remove')
    const drug = await Drug.findOne({_id : drugId })
    const user = await User.findOne({_id : userId })
    
    let isExitsting = user.cart.items.findIndex(objInItem => { 
        return new String(objInItem.productId).trim() === new String(drug?._id).trim() })

    if(isExitsting >= 0){
       user.cart.items.splice(isExitsting , 1)
       user.cart.totalPrice -= (qty * drug?.price);
               user.save()
     } 
     const items = user.cart.items
     const totalPrice = user.cart?.totalPrice
     res.json({
             cart : {
                items : items ,
                totalPrice: totalPrice
             }
     }
 )
})

router.post('/getCart',auth,async(req ,res)=>{
    const { userId} = req.body
    console.log(userId ,'userId')
    const user = await User.findById(userId).populate('cart.items.productId')
    const items = user.cart?.items
    const totalPrice = user.cart?.totalPrice
    const cartValue = items.length
    res.json({
           
            info : {
               items : items ,
               totalPrice: totalPrice,
               number : cartValue
            }
    }
)
})
module.exports = router

/*

router.post('/checkExpiry' , async( req ,res )=> {
    const drugs = await Drug.find({})
    let currentDate = [Number(new Date().getFullYear()) , Number(new Date().getMonth()) ,Number(new Date().getDate())]
    let updatedDrugs =[]

    const storedDrugs = drugs.filter(drug => {
        const { expiryDate } = drug
        const inputDate = expiryDate.split('-')
        const InputDate = [ Number(inputDate[0]) ,Number(inputDate[1]) ,Number(inputDate[2]) ]
        
        if(InputDate[0] >= currentDate[0]){
            if(InputDate[1] >= currentDate[1]){
               if(InputDate[2] <= currentDate[2]){
                return drug
               } 
            } else{
              return drug
            }
          } else{
            return drug
          }
    })
    storedDrugs.forEach(myFunction)
    async function myFunction(item){
        console.log(new String(item._id).trim())
        const updated = await Drug.updateOne({_id : new String(item._id).trim() }, {isExpired : true}) 
        console.log(updated)
           updatedDrugs.push(updated)
    }
   res.json(storedDrugs)
    
})

*/
