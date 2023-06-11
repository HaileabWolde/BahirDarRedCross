const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name : {
        type: String ,
        require : true ,
        trim : true
    } ,
    email : {
        type: String ,
        require : true ,
        trim : true
    } ,
    password :{
        type: String ,
        require : true
    },
    userType : {
        type : String ,
        require : true ,
        default : "customer"
    },
    notification : {
        user :  {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        } ,
        drug :  {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Drug'
        } ,
        img : {
            type : String
        }
    }
    ,
    cart : {
        items : [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Drug'
                } ,
                quantity: {
                    type : Number ,
                    require : true}  ,
                state : {
                      type : String ,
                      default : 'stable',
                      required : true }
            } 
        ],
        totalPrice : Number
    }
} ,
{
    timestamps : true
})

module.exports = userSchema.methods.addToCart = function (drug){

    let cart = this.cart;

    const isExitsting = cart.items.findIndex(objInItem => { return objInItem.productId === drug._id})
   
    console.log('isExisting : ', isExitsting)
   if(isExitsting >= 0){
      existingProductInCart = cart.items[isExitsting]
      console.log("existiongProductInCart",existingProductInCart)
      existingProductInCart.quantity += 1
      cart.totalPrice = drug.price;
   } else{
       cart.items.push({ productId : drug._id , quantity : 1})
       cart.totalPrice = drug.price;
   }
     
}

module.exports = mongoose.model("User" , userSchema)