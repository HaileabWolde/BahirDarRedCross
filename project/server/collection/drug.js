const mongoose = require('mongoose')

const drugSchema = new mongoose.Schema({
  name : {
    type : String ,
    required : true, 
  },
  price : {
    type : Number ,
    required : true
  },
  category : {
    type : String ,
    required : true
  },
  subCategory : {
    type : String ,
    required : true
  },
  quantity : {
    type : Number , 
    default : 1
  },
  expiryDate: { 
      type: Date,
      required: true 
    },
  isExpired : {
    type : Boolean ,
    default : false
  },
  description : {
    type : String ,
    required : true
  }, 
  prescriptionRequired : {
    type : Boolean ,
    default : false ,
    required : true
  },
  approved : {
    type : Boolean ,
    default : false
  },
  type : {
    type : String,
  },
  url : {
    type : String
  },
  image : {
    type : String ,
    trim : true
  }
},{
  timestamps : true
})

module.exports = mongoose.model('Drug' , drugSchema)

/*

 expiryDate : {
    type : String ,
    required : true , 
    default : new Date().getFullYear() + '-' + new Date().getMonth() + '-' + new Date().getDate()
  } ,
*/