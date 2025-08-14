const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  name: { type: String, default: '' },
  preferences: {
    categories: [{ type: String }],
    frequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly'], 
      default: 'weekly' 
    }
  },
  status: { 
    type: String, 
    enum: ['active', 'unsubscribed', 'pending'], 
    default: 'pending' 
  },
  unsubscribeToken: { type: String, unique: true },
  signupDate: { type: Date, default: Date.now },
  lastEngagement: { type: Date },
  engagementScore: { type: Number, default: 0 },
  ipAddress: { type: String },
  userAgent: { type: String }
});

// Generate unsubscribe token before saving
SubscriberSchema.pre('save', function(next) {
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = require('crypto').randomBytes(32).toString('hex');
  }
  next();
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);
