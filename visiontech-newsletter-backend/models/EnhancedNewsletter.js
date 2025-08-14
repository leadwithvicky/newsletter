const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  content: { type: String, default: '' },
  author: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'sent', 'failed'], 
    default: 'draft' 
  },
  scheduledDate: { type: Date },
  sentDate: { type: Date },
  recipients: [{ type: String }], // Array of subscriber emails
  deliveryStats: {
    total: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 }
  },
  trackingPixel: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate unique tracking pixel ID
NewsletterSchema.pre('save', function(next) {
  if (!this.trackingPixel) {
    this.trackingPixel = require('crypto').randomBytes(16).toString('hex');
  }
  next();
});

module.exports = mongoose.model('EnhancedNewsletter', NewsletterSchema);
