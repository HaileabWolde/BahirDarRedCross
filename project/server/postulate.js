const Drug = require('./collection/drug')
const drugs = require('./drugs.json')
const mongoose = require('mongoose')
const connectDB = require('./connection/connect.js')

require('dotenv').config()
mongoose.set('strictQuery', false);

const start = async() =>{
   try {
    await connectDB(process.env.MONGO_URI_L)
    await Drug.deleteMany()
    await Drug.create(drugs)
    console.log('Success')
    process.exit(0)
   } catch (error) {
    console.log(error)
    process.exit(1)
   }
}
start()