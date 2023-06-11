const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    name : {
        type : String ,
        require : true
    },
    email : { 
        type : String ,
        require : true 
    },
    items : [
        {
            name : {
                type : String ,
                require : true 
            },
            price : {
                type : String ,
                require : true
            },
            quantity : {
                type : String ,
                require : true
            }
        }
    ],
    paymentMethod : {
        type : String,
        require : true
    },
    amount : { 
        type : Number ,
        require : true
    },
    status : {
        type : String ,
        enum : ['pending' , 'success','canceled'],
        default : 'pending'
    },
    createdAt : {
        type : Date ,
        default : Date.now
    }
})

module.exports = mongoose.model('Order',orderSchema)