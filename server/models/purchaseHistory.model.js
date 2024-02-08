const mongoose = require('mongoose');

const purchaseHistorySchema = new mongoose.Schema({
  purchaseId: {
    type: String,
    unique: true,
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
});

  

const PurchaseHistoryModel = mongoose.model('PurchaseHistory', purchaseHistorySchema);

module.exports = PurchaseHistoryModel;
