const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  content: { type: String, default: '' },
  author: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  imageUrl: { type: String, default: '' }
});

module.exports = mongoose.model('Newsletter', NewsletterSchema);
