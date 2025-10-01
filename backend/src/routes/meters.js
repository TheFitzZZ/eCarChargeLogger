const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const MeterModel = require('../models/meter');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format error messages for better display
    const formattedErrors = errors.array().map(err => `${err.path || err.param}: ${err.msg}`);
    return res.status(400).json({ 
      error: formattedErrors.join('; '),
      errors: errors.array() 
    });
  }
  next();
};

// GET all meters
router.get('/', (req, res) => {
  try {
    const meters = MeterModel.getAll();
    res.json(meters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET meter by ID
router.get('/:id', 
  param('id').isInt().withMessage('Meter ID must be a valid integer'),
  validate,
  (req, res) => {
    try {
      const meter = MeterModel.getById(req.params.id);
      if (!meter) {
        return res.status(404).json({ error: 'Meter not found' });
      }
      res.json(meter);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// CREATE new meter
router.post('/',
  body('name').isString().withMessage('Meter name must be a string')
    .trim()
    .notEmpty().withMessage('Meter name cannot be empty')
    .isLength({ max: 100 }).withMessage('Meter name must be maximum 100 characters'),
  validate,
  (req, res) => {
    try {
      const meter = MeterModel.create(req.body.name);
      res.status(201).json(meter);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Meter name already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  }
);

// UPDATE meter
router.put('/:id',
  param('id').isInt().withMessage('Meter ID must be a valid integer'),
  body('name').isString().withMessage('Meter name must be a string')
    .trim()
    .notEmpty().withMessage('Meter name cannot be empty')
    .isLength({ max: 100 }).withMessage('Meter name must be maximum 100 characters'),
  validate,
  (req, res) => {
    try {
      const meter = MeterModel.update(req.params.id, req.body.name);
      if (!meter) {
        return res.status(404).json({ error: 'Meter not found' });
      }
      res.json(meter);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Meter name already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE meter
router.delete('/:id',
  param('id').isInt().withMessage('Meter ID must be a valid integer'),
  validate,
  (req, res) => {
    try {
      const result = MeterModel.delete(req.params.id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Meter not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
