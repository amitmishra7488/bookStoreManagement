const mongoose = require('mongoose');

// Define the Mongoose schema for author revenue tracking
const authorRevenueSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalRevenue: { type: Number, default: 0 },
    currentMonthRevenue: { type: Number, default: 0 },
    currentYearRevenue: { type: Number, default: 0 }
}, { timestamps: true }); // Adding timestamps option

// Create a Mongoose model based on the schema
const AuthorRevenueModel = mongoose.model('AuthorRevenue', authorRevenueSchema);

module.exports = AuthorRevenueModel;
