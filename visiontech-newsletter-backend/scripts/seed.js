const mongoose = require('mongoose');
require('dotenv').config();
const Newsletter = require('../models/Newsletter');

async function main() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const count = await Newsletter.countDocuments();
    if (count > 0) {
      console.log(`Found ${count} existing newsletters. Skipping seed.`);
      return;
    }

    const docs = await Newsletter.insertMany([
      {
        title: 'Welcome to VisionTech Newsletter',
        description: 'Your weekly dose of tech insights and updates.',
        content: '<p>Thanks for subscribing! This is our first issue packed with curated news and product updates.</p>',
        author: 'VisionTech Team',
        imageUrl: ''
      },
      {
        title: 'Tech Update: AI Trends',
        description: 'Latest developments in AI and ML.',
        content: '<p>We explore the newest trends in AI, from LLM ops to efficient fine-tuning techniques.</p>',
        author: 'VisionTech Research',
        imageUrl: ''
      }
    ]);

    console.log(`Seeded ${docs.length} newsletters.`);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

main();
