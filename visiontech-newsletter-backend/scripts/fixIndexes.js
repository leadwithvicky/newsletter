const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    const coll = db.collection('newsletters');

    const indexes = await coll.indexes();
    console.log('Current indexes on newsletters:', indexes.map(i => i.name));

    const targetIndex = indexes.find(i => i.name === 'email_1');
    if (targetIndex) {
      await coll.dropIndex('email_1');
      console.log('Dropped index email_1 on newsletters');
    } else {
      console.log('No email_1 index found on newsletters');
    }

    const after = await coll.indexes();
    console.log('Indexes after operation:', after.map(i => i.name));
  } catch (err) {
    console.error('fixIndexes error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

main();
