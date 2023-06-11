const express = require('express')
const app = express()
const { Server } = require('socket.io')
const cors = require('cors')
require('dotenv').config()
const connectDB = require('./connection/connect')
const route = require('./Route/routes')
const drugRoute = require('./Route/drugRoute')
const orderRoute = require('./Route/orderRoute')
const User = require('./collection/user')

const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer ,{
  cors: {
      origin: "http://127.0.0.1:5173",
      methods: ["GET","POST"],
      credentials: true,
      allowEIO3: true
              },
      transport: ['websocket']   
} )

io.on("connection",(socket)=>{
 
    socket.on("client-notification", (data)=>{

        socket.broadcast.emit('pharmacist-notification',data,(ack)=>{
          console.log('Notification send to pharmacicst')  
        })
    })

    socket.on("approval-notification", (data)=>{
      socket.broadcast.emit('informed-notification',data,(ack)=>{
        console.log('Notification send to customer')  
      })
    })
   
   

    socket.on("disconnect",()=> console.log("User disconnected" , socket.id))
})

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
app.use(express.static('../redcross-pharmacy'))
app.use(async(req ,res ,next)=>{
  try {
    const user =await User.findById("646547b1dd50e2985e266fa5")
    req.user = user
    next()
  } catch (error) {
    console.log(error)
  }
 
})
app.use('/api/v1/user',route)
app.use('/api/v1/drug',drugRoute)
app.use('/api/v1/order',orderRoute)


const start = async() =>{
  return await connectDB(process.env.MONGO_URI_L)
}
start()

app.listen(5000 , ()=>{
    console.log("App is running at port 5000")
})
httpServer.listen(3001 , ()=>{
  console.log("server is ready")
})
