const mongoose = require('mongoose');
const slugify = require('slugify');

const bookSchema = new mongoose.Schema({
  authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  sellCount: { type: Number, default: 0 },
  title: { type: String, unique: true, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 100, max: 1000 },
  slug: { type: String, unique: true }
});

// Middleware to automatically create and update the slug before saving
bookSchema.pre('save', function(next) {
  if (!this.isModified('title')) {
    return next();
  }
  this.slug = slugify(this.title, { lower: true });
  next();
});

const BookModel = mongoose.model('Book', bookSchema);

module.exports = BookModel;
