const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const SessionModel = require('../models/session');

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

// GET all sessions with pagination
router.get('/',
  query('limit').optional().isInt({ min: 1, max: 500 }),
  query('offset').optional().isInt({ min: 0 }),
  validate,
  (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      
      const sessions = SessionModel.getAll(limit, offset);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET session by ID
router.get('/:id',
  param('id').isInt(),
  validate,
  (req, res) => {
    try {
      const session = SessionModel.getById(req.params.id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// CREATE new session with readings for all meters
router.post('/',
  body('price').isFloat({ min: 0 }).withMessage('Price must be a number greater than or equal to 0'),
  body('readings').isArray({ min: 1 }).withMessage('Readings must be an array with at least one meter reading'),
  body('readings.*.meter_id').isInt({ min: 1 }).withMessage('Each reading must have a valid meter_id (positive integer)'),
  body('readings.*.value').isFloat({ min: 0 }).withMessage('Each reading value must be a number greater than or equal to 0'),
  body('notes').optional({ values: 'falsy' }).isString().trim().isLength({ max: 500 }).withMessage('Notes must be a string with maximum 500 characters'),
  body('timestamp').optional({ values: 'falsy' }).isISO8601().withMessage('Timestamp must be a valid ISO8601 date/time (YYYY-MM-DDTHH:mm:ss)'),
  validate,
  (req, res) => {
    try {
      const { price, readings, notes, timestamp } = req.body;
      const session = SessionModel.create(price, readings, notes || null, timestamp || null);
      res.status(201).json(session);
    } catch (error) {
      if (error.message.includes('FOREIGN KEY constraint failed')) {
        return res.status(404).json({ error: 'One or more meters not found' });
      }
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Duplicate meter in readings' });
      }
      res.status(500).json({ error: error.message });
    }
  }
);

// UPDATE session
router.put('/:id',
  param('id').isInt().withMessage('Session ID must be a valid integer'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a number greater than or equal to 0'),
  body('readings').isArray({ min: 1 }).withMessage('Readings must be an array with at least one meter reading'),
  body('readings.*.meter_id').isInt({ min: 1 }).withMessage('Each reading must have a valid meter_id (positive integer)'),
  body('readings.*.value').isFloat({ min: 0 }).withMessage('Each reading value must be a number greater than or equal to 0'),
  body('notes').optional({ values: 'falsy' }).isString().trim().isLength({ max: 500 }).withMessage('Notes must be a string with maximum 500 characters'),
  body('timestamp').optional({ values: 'falsy' }).isISO8601().withMessage('Timestamp must be a valid ISO8601 date/time (YYYY-MM-DDTHH:mm:ss)'),
  validate,
  (req, res) => {
    try {
      const { price, readings, notes, timestamp } = req.body;
      const session = SessionModel.update(req.params.id, price, readings, notes || null, timestamp || null);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE session
router.delete('/:id',
  param('id').isInt(),
  validate,
  (req, res) => {
    try {
      const result = SessionModel.delete(req.params.id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET overall statistics
router.get('/stats/all',
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  validate,
  (req, res) => {
    try {
      const stats = SessionModel.getStatistics(
        req.query.start_date || null,
        req.query.end_date || null
      );
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET statistics for specific meter
router.get('/stats/meter/:meter_id',
  param('meter_id').isInt(),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  validate,
  (req, res) => {
    try {
      const stats = SessionModel.getMeterStatistics(
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
router.get('/trend/all',
  query('group_by').optional().isIn(['hour', 'day', 'week', 'month']),
  query('limit').optional().isInt({ min: 1, max: 365 }),
  validate,
  (req, res) => {
    try {
      const trend = SessionModel.getTrend(
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
