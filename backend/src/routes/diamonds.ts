import express, { Request, Response } from 'express';
import Diamond from '../models/Diamond';
import Field from '../models/Field';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// GET /api/diamonds/search - Public
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      return res.json([]);
    }

    const regex = new RegExp(q, 'i');
    const fields = await Field.find();

    // Search in name or any of the dynamic fields
    const searchConditions: any[] = [
      { name: { $regex: regex } }
    ];

    fields.forEach(field => {
      searchConditions.push({ [`dynamicData.${field.name}`]: { $regex: regex } });
    });

    const diamonds = await Diamond.find({ $or: searchConditions }).sort({ createdAt: -1 });
    return res.json(diamonds);
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ message: 'Search failed' });
  }
});

// GET /api/diamonds/filter - Public
router.get('/filter', async (req: Request, res: Response) => {
  try {
    const filterQuery: any = {};

    Object.keys(req.query).forEach(key => {
      if (key !== 'page' && key !== 'limit') {
        const val = req.query[key];
        if (val !== undefined && val !== '') {
          filterQuery[`dynamicData.${key}`] = val;
        }
      }
    });
    console.log("filterQuery", filterQuery)
    const diamonds = await Diamond.find(filterQuery).sort({ createdAt: -1 });
    return res.json(diamonds);
  } catch (err) {
    console.error('Filter error:', err);
    return res.status(500).json({ message: 'Filtering failed' });
  }
});

// GET /api/diamonds?page=1&limit=10 - Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await Diamond.countDocuments();
    const diamonds = await Diamond.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      diamonds
    });
  } catch (err) {
    console.error('Fetch diamonds error:', err);
    return res.status(500).json({ message: 'Failed to fetch diamonds' });
  }
});

// GET /api/diamonds/:id - Public
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const diamond = await Diamond.findById(req.params.id);
    if (!diamond) {
      return res.status(404).json({ message: 'Diamond not found' });
    }
    return res.json(diamond);
  } catch (err) {
    console.error('Fetch single diamond error:', err);
    return res.status(500).json({ message: 'Failed to fetch diamond details' });
  }
});

// POST /api/diamonds - Admin
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, images, dynamicData } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Diamond name is required' });
    }

    // Validate required dynamic fields
    const fields = await Field.find();
    for (const field of fields) {
      if (field.required) {
        const val = dynamicData ? dynamicData[field.name] : undefined;
        if (val === undefined || val === null || val === '') {
          return res.status(400).json({ message: `Field "${field.label}" is required` });
        }
      }
    }

    const diamond = new Diamond({
      name,
      images: images || [],
      dynamicData: dynamicData || {}
    });

    await diamond.save();
    return res.status(201).json(diamond);
  } catch (err) {
    console.error('Create diamond error:', err);
    return res.status(500).json({ message: 'Failed to create diamond record' });
  }
});

// PUT /api/diamonds/:id - Admin
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, images, dynamicData } = req.body;
    const diamond = await Diamond.findById(req.params.id);

    if (!diamond) {
      return res.status(404).json({ message: 'Diamond record not found' });
    }

    if (name !== undefined) diamond.name = name;
    if (images !== undefined) diamond.images = images;

    if (dynamicData !== undefined) {
      // Validate required dynamic fields
      const fields = await Field.find();
      for (const field of fields) {
        if (field.required) {
          const val = dynamicData[field.name];
          if (val === undefined || val === null || val === '') {
            return res.status(400).json({ message: `Field "${field.label}" is required` });
          }
        }
      }
      diamond.dynamicData = dynamicData;
    }

    await diamond.save();
    return res.json(diamond);
  } catch (err) {
    console.error('Update diamond error:', err);
    return res.status(500).json({ message: 'Failed to update diamond record' });
  }
});

// DELETE /api/diamonds/:id - Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const diamond = await Diamond.findByIdAndDelete(req.params.id);
    if (!diamond) {
      return res.status(404).json({ message: 'Diamond record not found' });
    }
    return res.json({ message: 'Diamond record deleted successfully' });
  } catch (err) {
    console.error('Delete diamond error:', err);
    return res.status(500).json({ message: 'Failed to delete diamond record' });
  }
});

export default router;
