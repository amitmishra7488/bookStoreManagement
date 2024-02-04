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

purchaseHistorySchema.pre('validate', async function(next) {
  try {

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');

    // Get the number of existing purchase history documents
    const count = await this.constructor.countDocuments();

    // Increment the numeric ID based on the count
    const numericId = count + 1;

    // Set the purchaseId for the current document
    this.purchaseId = `${year}-${month}-${numericId}`;
    
    next();
  } catch (error) {
    next(error);
  }
});


  

const PurchaseHistoryModel = mongoose.model('PurchaseHistory', purchaseHistorySchema);

module.exports = PurchaseHistoryModel;
