const express = require('express');
const Newsletter = require('../models/Newsletter');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/newsletters → Get all newsletters
router.get('/', async (req, res) => {
  try {
    const newsletters = await Newsletter.find().sort({ date: -1 });
    res.json(newsletters);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/newsletters/:id → Get single newsletter by ID
router.get('/:id', async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Not found' });
    res.json(newsletter);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/newsletters → Create new newsletter
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, content, author, imageUrl } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const created = await Newsletter.create({ title, description, content, author, imageUrl });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/newsletters/:id → Update newsletter
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, content, author, imageUrl, date } = req.body;
    const updated = await Newsletter.findByIdAndUpdate(
      req.params.id,
      { title, description, content, author, imageUrl, date },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/newsletters/:id → Delete newsletter
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Newsletter.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
