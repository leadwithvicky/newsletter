const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  newsletterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EnhancedNewsletter',
    required: true 
  },
  subscriberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subscriber' 
  },
  eventType: { 
    type: String, 
    enum: ['open', 'click', 'bounce', 'unsubscribe', 'delivered'],
    required: true 
  },
  eventData: {
    url: String,
    userAgent: String,
    ipAddress: String,
    timestamp: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
