import express, { Request, Response } from 'express';
import Section from '../models/Section';
import Field from '../models/Field';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// GET /api/sections - Public (used to build form in frontend)
router.get('/', async (req: Request, res: Response) => {
  try {
    const sections = await Section.find().sort({ order: 1 });
    return res.json(sections);
  } catch (err) {
    console.error('Fetch sections error:', err);
    return res.status(500).json({ message: 'Failed to fetch sections' });
  }
});

// POST /api/sections - Admin
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, order } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Section name is required' });
    }

    const section = new Section({ name, order: order || 0 });
    await section.save();
    return res.status(201).json(section);
  } catch (err) {
    console.error('Create section error:', err);
    return res.status(500).json({ message: 'Failed to create section' });
  }
});

// PUT /api/sections/:id - Admin
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, order } = req.body;
    const section = await Section.findById(req.params.id);

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    if (name !== undefined) section.name = name;
    if (order !== undefined) section.order = order;

    await section.save();
    return res.json(section);
  } catch (err) {
    console.error('Update section error:', err);
    return res.status(500).json({ message: 'Failed to update section' });
  }
});

// DELETE /api/sections/:id - Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const sectionId = req.params.id;
    const section = await Section.findById(sectionId);

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Delete section
    await Section.findByIdAndDelete(sectionId);

    // Delete all fields belonging to this section
    await Field.deleteMany({ section: sectionId });

    return res.json({ message: 'Section and its fields deleted successfully' });
  } catch (err) {
    console.error('Delete section error:', err);
    return res.status(500).json({ message: 'Failed to delete section' });
  }
});

export default router;
