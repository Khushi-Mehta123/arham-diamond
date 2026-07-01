import express, { Request, Response } from 'express';
import Field from '../models/Field';
import Section from '../models/Section';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Helper to convert label to camelCase/slug name
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '');
};

// GET /api/fields - Public (used to build form in frontend)
router.get('/', async (req: Request, res: Response) => {
  try {
    const fields = await Field.find().sort({ order: 1 });
    return res.json(fields);
  } catch (err) {
    console.error('Fetch fields error:', err);
    return res.status(500).json({ message: 'Failed to fetch fields' });
  }
});

// POST /api/fields - Admin
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { label, name, type, required, options, section, order } = req.body;

    if (!label || !type || !section) {
      return res.status(400).json({ message: 'Label, type, and section are required' });
    }

    // Check if section exists
    const sectionExists = await Section.findById(section);
    if (!sectionExists) {
      return res.status(400).json({ message: 'Target section does not exist' });
    }

    // Determine field key
    const fieldKey = name ? slugify(name) : slugify(label);

    // Check uniqueness of field key
    const existingField = await Field.findOne({ name: fieldKey });
    if (existingField) {
      return res.status(400).json({ message: `Field with name key "${fieldKey}" already exists` });
    }

    const field = new Field({
      name: fieldKey,
      label,
      type,
      required: required || false,
      options: options || [],
      section,
      order: order || 0
    });

    await field.save();
    return res.status(201).json(field);
  } catch (err) {
    console.error('Create field error:', err);
    return res.status(500).json({ message: 'Failed to create field' });
  }
});

// PUT /api/fields/:id - Admin
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { label, name, type, required, options, section, order } = req.body;
    const field = await Field.findById(req.params.id);

    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    if (section) {
      const sectionExists = await Section.findById(section);
      if (!sectionExists) {
        return res.status(400).json({ message: 'Target section does not exist' });
      }
      field.section = section;
    }

    if (label !== undefined) field.label = label;
    if (type !== undefined) field.type = type;
    if (required !== undefined) field.required = required;
    if (options !== undefined) field.options = options;
    if (order !== undefined) field.order = order;

    if (name !== undefined && name !== field.name) {
      const fieldKey = slugify(name);
      const existingField = await Field.findOne({ name: fieldKey });
      if (existingField && String(existingField._id) !== String(field._id)) {
        return res.status(400).json({ message: `Field with name key "${fieldKey}" already exists` });
      }
      field.name = fieldKey;
    }

    await field.save();
    return res.json(field);
  } catch (err) {
    console.error('Update field error:', err);
    return res.status(500).json({ message: 'Failed to update field' });
  }
});

// DELETE /api/fields/:id - Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const field = await Field.findByIdAndDelete(req.params.id);
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }
    return res.json({ message: 'Field deleted successfully' });
  } catch (err) {
    console.error('Delete field error:', err);
    return res.status(500).json({ message: 'Failed to delete field' });
  }
});

export default router;
