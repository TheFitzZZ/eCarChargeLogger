const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const ReadingModel = require('../models/reading');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET all readings with pagination
router.get('/',
  query('meter_id').optional().isInt(),
  query('limit').optional().isInt({ min: 1, max: 500 }),
  query('offset').optional().isInt({ min: 0 }),
  validate,
  (req, res) => {
    try {
      const meterId = req.query.meter_id ? parseInt(req.query.meter_id) : null;
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      
      const readings = ReadingModel.getAll(meterId, limit, offset);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET reading by ID
router.get('/:id',
  param('id').isInt(),
  validate,
  (req, res) => {
    try {
      const reading = ReadingModel.getById(req.params.id);
      if (!reading) {
        return res.status(404).json({ error: 'Reading not found' });
      }
      res.json(reading);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// CREATE new reading
router.post('/',
  body('meter_id').isInt({ min: 1 }),
  body('value').isFloat({ min: 0 }),
  body('price').isFloat({ min: 0 }),
  body('notes').optional().isString().trim().isLength({ max: 500 }),
  validate,
  (req, res) => {
    try {
      const { meter_id, value, price, notes } = req.body;
      const reading = ReadingModel.create(meter_id, value, price, notes || null);
      res.status(201).json(reading);
    } catch (error) {
      if (error.message.includes('FOREIGN KEY constraint failed')) {
        return res.status(404).json({ error: 'Meter not found' });
      }
      res.status(500).json({ error: error.message });
    }
  }
);

// UPDATE reading
router.put('/:id',
  param('id').isInt(),
  body('value').isFloat({ min: 0 }),
  body('price').isFloat({ min: 0 }),
  body('notes').optional().isString().trim().isLength({ max: 500 }),
  validate,
  (req, res) => {
    try {
      const { value, price, notes } = req.body;
      const reading = ReadingModel.update(req.params.id, value, price, notes || null);
      if (!reading) {
        return res.status(404).json({ error: 'Reading not found' });
      }
      res.json(reading);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE reading
router.delete('/:id',
  param('id').isInt(),
  validate,
  (req, res) => {
    try {
      const result = ReadingModel.delete(req.params.id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Reading not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET statistics
router.get('/stats/:meter_id',
  param('meter_id').isInt(),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  validate,
  (req, res) => {
    try {
      const stats = ReadingModel.getStatistics(
        req.params.meter_id,
        req.query.start_date || null,
        req.query.end_date || null
      );
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET consumption trend
router.get('/trend/:meter_id',
  param('meter_id').isInt(),
  query('group_by').optional().isIn(['hour', 'day', 'week', 'month']),
  query('limit').optional().isInt({ min: 1, max: 365 }),
  validate,
  (req, res) => {
    try {
      const trend = ReadingModel.getConsumptionTrend(
        req.params.meter_id,
        req.query.group_by || 'day',
        req.query.limit ? parseInt(req.query.limit) : 30
      );
      res.json(trend);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
