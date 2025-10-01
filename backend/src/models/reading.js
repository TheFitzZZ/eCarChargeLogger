const db = require('../database');

class ReadingModel {
  static getAll(meterId, limit = 100, offset = 0) {
    if (meterId) {
      return db.prepare(`
        SELECT * FROM readings 
        WHERE meter_id = ? 
        ORDER BY timestamp DESC 
        LIMIT ? OFFSET ?
      `).all(meterId, limit, offset);
    }
    return db.prepare(`
      SELECT r.*, m.name as meter_name 
      FROM readings r 
      JOIN meters m ON r.meter_id = m.id 
      ORDER BY r.timestamp DESC 
      LIMIT ? OFFSET ?
    `).all(limit, offset);
  }

  static getById(id) {
    return db.prepare('SELECT * FROM readings WHERE id = ?').get(id);
  }

  static create(meterId, value, price, notes = null) {
    // Get the previous reading for this meter
    const prevReading = db.prepare(`
      SELECT value, price FROM readings 
      WHERE meter_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `).get(meterId);

    let delta = null;
    let cost = null;

    if (prevReading) {
      delta = value - prevReading.value;
      cost = delta * price;
      
      // If price not provided, use previous price
      if (price === null || price === undefined) {
        price = prevReading.price;
        cost = delta * price;
      }
    }

    const result = db.prepare(`
      INSERT INTO readings (meter_id, value, price, delta, cost, notes) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(meterId, value, price, delta, cost, notes);

    return this.getById(result.lastInsertRowid);
  }

  static update(id, value, price, notes) {
    const reading = this.getById(id);
    if (!reading) return null;

    // Recalculate delta and cost
    const prevReading = db.prepare(`
      SELECT value FROM readings 
      WHERE meter_id = ? AND timestamp < (SELECT timestamp FROM readings WHERE id = ?) 
      ORDER BY timestamp DESC 
      LIMIT 1
    `).get(reading.meter_id, id);

    let delta = null;
    let cost = null;

    if (prevReading) {
      delta = value - prevReading.value;
      cost = delta * price;
    }

    db.prepare(`
      UPDATE readings 
      SET value = ?, price = ?, delta = ?, cost = ?, notes = ? 
      WHERE id = ?
    `).run(value, price, delta, cost, notes, id);

    // Update next reading's delta and cost
    const nextReading = db.prepare(`
      SELECT id, price FROM readings 
      WHERE meter_id = ? AND timestamp > (SELECT timestamp FROM readings WHERE id = ?) 
      ORDER BY timestamp ASC 
      LIMIT 1
    `).get(reading.meter_id, id);

    if (nextReading) {
      const nextValue = db.prepare('SELECT value FROM readings WHERE id = ?').get(nextReading.id).value;
      const nextDelta = nextValue - value;
      const nextCost = nextDelta * nextReading.price;
      
      db.prepare(`
        UPDATE readings 
        SET delta = ?, cost = ? 
        WHERE id = ?
      `).run(nextDelta, nextCost, nextReading.id);
    }

    return this.getById(id);
  }

  static delete(id) {
    const reading = this.getById(id);
    if (!reading) return { changes: 0 };

    const result = db.prepare('DELETE FROM readings WHERE id = ?').run(id);

    // Recalculate next reading's delta and cost
    const nextReading = db.prepare(`
      SELECT id, value, price FROM readings 
      WHERE meter_id = ? AND timestamp > ? 
      ORDER BY timestamp ASC 
      LIMIT 1
    `).get(reading.meter_id, reading.timestamp);

    if (nextReading) {
      const prevReading = db.prepare(`
        SELECT value FROM readings 
        WHERE meter_id = ? AND timestamp < ? 
        ORDER BY timestamp DESC 
        LIMIT 1
      `).get(reading.meter_id, reading.timestamp);

      if (prevReading) {
        const newDelta = nextReading.value - prevReading.value;
        const newCost = newDelta * nextReading.price;
        
        db.prepare(`
          UPDATE readings 
          SET delta = ?, cost = ? 
          WHERE id = ?
        `).run(newDelta, newCost, nextReading.id);
      } else {
        // If there's no previous reading, the next reading becomes the first
        db.prepare(`
          UPDATE readings 
          SET delta = NULL, cost = NULL 
          WHERE id = ?
        `).run(nextReading.id);
      }
    }

    return result;
  }

  static getStatistics(meterId, startDate = null, endDate = null) {
    let query = `
      SELECT 
        COUNT(*) as total_readings,
        SUM(delta) as total_consumption,
        SUM(cost) as total_cost,
        AVG(delta) as avg_consumption,
        AVG(cost) as avg_cost,
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(price) as avg_price
      FROM readings 
      WHERE meter_id = ? AND delta IS NOT NULL
    `;

    const params = [meterId];

    if (startDate) {
      query += ' AND timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND timestamp <= ?';
      params.push(endDate);
    }

    return db.prepare(query).get(...params);
  }

  static getConsumptionTrend(meterId, groupBy = 'day', limit = 30) {
    let dateFormat;
    switch (groupBy) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00:00';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-W%W';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    return db.prepare(`
      SELECT 
        strftime(?, timestamp) as period,
        SUM(delta) as consumption,
        SUM(cost) as cost,
        AVG(price) as avg_price,
        COUNT(*) as reading_count
      FROM readings 
      WHERE meter_id = ? AND delta IS NOT NULL
      GROUP BY period
      ORDER BY period DESC
      LIMIT ?
    `).all(dateFormat, meterId, limit);
  }
}

module.exports = ReadingModel;
