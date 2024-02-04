const mongoose = require('mongoose');

const roleChangeRequestSchema = new mongoose.Schema({
  requestedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedRole: { type: String, enum: ['admin', 'author', 'retailUser'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 7 * 24 * 60 * 60 }, // Expires after 7 days
});



const RoleChangeRequestModel = mongoose.model('RoleChangeRequest', roleChangeRequestSchema);

module.exports = RoleChangeRequestModel;
