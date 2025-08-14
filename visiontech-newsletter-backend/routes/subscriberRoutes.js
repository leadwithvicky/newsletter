const express = require('express');
const Subscriber = require('../models/Subscriber');
const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name = '' } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return res.status(400).json({ message: 'Already subscribed' });
      } else {
        // Reactivate subscription
        existingSubscriber.status = 'active';
        await existingSubscriber.save();
        return res.json({ message: 'Subscription reactivated' });
      }
    }

    const newSubscriber = new Subscriber({
      email,
      name,
      status: 'active'
    });

    await newSubscriber.save();
    res.status(201).json({ message: 'Successfully subscribed', subscriber: newSubscriber });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const subscriber = await Subscriber.findOne({ unsubscribeToken: token });
    if (!subscriber) {
      return res.status(404).json({ message: 'Invalid unsubscribe link' });
    }

    subscriber.status = 'unsubscribed';
    await subscriber.save();
    
    res.json({ message: 'Successfully unsubscribed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all subscribers (admin only)
router.get('/', async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ signupDate: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get subscriber stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Subscriber.countDocuments();
    const active = await Subscriber.countDocuments({ status: 'active' });
    const unsubscribed = await Subscriber.countDocuments({ status: 'unsubscribed' });
    const pending = await Subscriber.countDocuments({ status: 'pending' });
    
    res.json({
      total,
      active,
      unsubscribed,
      pending
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
