import express from 'express';
import Gallery from '../models/Gallery.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const gallery = await Gallery.find(filter).sort({ date: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add gallery item (admin)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, imageUrl, category } = req.body;

    const galleryItem = new Gallery({
      title,
      description,
      imageUrl,
      category
    });

    await galleryItem.save();
    res.status(201).json(galleryItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;