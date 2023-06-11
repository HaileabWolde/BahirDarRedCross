const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    drug: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drug',
        required: true
    },
    image : {
        type : String ,
        required : true
    },
    item : {
      type : String ,
      required : true
    },
    seen: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

module.exports = mongoose.model('Notification', notificationSchema);