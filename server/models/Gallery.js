import express from 'express';
import Gallery from '../models/Gallery.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const gallery = await Gallery.find(filter).sort({ date: -1 });
    res.json({
      success: true,
      gallery
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Add gallery item (admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, description, imageUrl, category } = req.body;

    const galleryItem = new Gallery({
      title,
      description,
      imageUrl,
      category
    });

    await galleryItem.save();
    res.status(201).json({
      success: true,
      galleryItem
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

export default router;