const express = require('express')
const Order = require('../collection/order')
const axios = require('axios');


const router = express.Router()
const PDFDocument = require('pdfkit');

router.get('/:id', async (req, res) => {
  const payment = await Order.findById(req.params.id);

  const doc = new PDFDocument();
  doc.pipe(res);

  doc.font('Helvetica-Bold').fontSize(20).text('Payment Receipt');
  doc.moveDown();

  doc.font('Helvetica').fontSize(14).text(`Amount: ${payment.amount}`);
  doc.font('Helvetica').fontSize(14).text(`Date: ${payment.date}`);
  doc.font('Helvetica').fontSize(14).text(`Transaction ID: ${payment.transactionId}`);
  doc.font('Helvetica').fontSize(14).text(`Customer Name: ${payment.customerName}`);
  doc.font('Helvetica').fontSize(14).text(`Customer Email: ${payment.customerEmail}`);

  doc.end();
});

router.post('/',async(req ,res )=>{
    const { name ,email , items ,paymentMethod , amount  } = req.body
    const order = await Order.create({ name ,email , items ,paymentMethod , amount  })
    console.log(order)
    res.json(order)

})

router.get('/all', async( req ,res)=>{
  const orders = await Order.find({})
  res.json(orders)
})

router.post('/verify',async( req ,res )=>{
    const { id , items } = req.body
    const url = `https://api.chapa.co/v1/transaction/verify/${id}`;
    const token = 'CHASECK_TEST-up4NrRcIXe7dyF5GiZ36UiGdBAySefqx'
 //dave-tx-93213168
const config = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};

const data = await axios.get(url, config)
 console.log(data.data.data)
 const order = await Order.create({ name : data.data.data.name ,email : data.data.data.name  , items : items ,paymentMethod : 'credit card' , amount : data.data.data.amount  })
 console.log(order)
 res.json(order)
})
module.exports = router