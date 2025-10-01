const db = require('../database');

class SessionModel {
  static getAll(limit = 100, offset = 0) {
    const sessions = db.prepare(`
      SELECT 
        s.*,
        COUNT(r.id) as meter_count,
        SUM(r.delta) as total_delta,
        SUM(r.delta * s.price) as total_cost
      FROM reading_sessions s
      LEFT JOIN readings r ON s.id = r.session_id
      GROUP BY s.id
      ORDER BY s.timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    // Get readings for each session
    return sessions.map(session => ({
      ...session,
      readings: this.getReadingsForSession(session.id)
    }));
  }

  static getById(id) {
    const session = db.prepare(`
      SELECT 
        s.*,
        COUNT(r.id) as meter_count,
        SUM(r.delta) as total_delta,
        SUM(r.delta * s.price) as total_cost
      FROM reading_sessions s
      LEFT JOIN readings r ON s.id = r.session_id
      WHERE s.id = ?
      GROUP BY s.id
    `).get(id);

    if (!session) return null;

    return {
      ...session,
      readings: this.getReadingsForSession(id)
    };
  }

  static getReadingsForSession(sessionId) {
    return db.prepare(`
      SELECT 
        r.*,
        m.name as meter_name,
        m.unit as meter_unit
      FROM readings r
      JOIN meters m ON r.meter_id = m.id
      WHERE r.session_id = ?
      ORDER BY m.name ASC
    `).all(sessionId);
  }

  static create(price, meterReadings, notes = null, timestamp = null) {
    const transaction = db.transaction(() => {
      // Create session with optional timestamp
      let sessionResult;
      if (timestamp) {
        sessionResult = db.prepare(`
          INSERT INTO reading_sessions (price, notes, timestamp) 
          VALUES (?, ?, ?)
        `).run(price, notes, timestamp);
      } else {
        sessionResult = db.prepare(`
          INSERT INTO reading_sessions (price, notes) 
          VALUES (?, ?)
        `).run(price, notes);
      }
      
      const sessionId = sessionResult.lastInsertRowid;

      // Get the session timestamp for delta calculation
      const session = db.prepare('SELECT timestamp FROM reading_sessions WHERE id = ?').get(sessionId);

      // Add reading for each meter
      const insertReading = db.prepare(`
        INSERT INTO readings (session_id, meter_id, value, delta) 
        VALUES (?, ?, ?, ?)
      `);

      for (const meterReading of meterReadings) {
        // Get previous reading for this meter (before this session's timestamp)
        const prevReading = db.prepare(`
          SELECT r.value 
          FROM readings r
          JOIN reading_sessions s ON r.session_id = s.id
          WHERE r.meter_id = ?
            AND s.timestamp < ?
          ORDER BY s.timestamp DESC
          LIMIT 1
        `).get(meterReading.meter_id, session.timestamp);

        const delta = prevReading ? meterReading.value - prevReading.value : null;
        
        insertReading.run(sessionId, meterReading.meter_id, meterReading.value, delta);
      }

      // Recalculate next session's deltas (if any)
      const nextSession = db.prepare(`
        SELECT id 
        FROM reading_sessions 
        WHERE timestamp > ? 
        ORDER BY timestamp ASC 
        LIMIT 1
      `).get(session.timestamp);

      if (nextSession) {
        this.recalculateDeltas(nextSession.id);
      }

      return sessionId;
    });

    const sessionId = transaction();
    return this.getById(sessionId);
  }

  static update(id, price, meterReadings, notes, timestamp = null) {
    const transaction = db.transaction(() => {
      // Get old timestamp before update
      const oldSession = db.prepare('SELECT timestamp FROM reading_sessions WHERE id = ?').get(id);
      
      // Update session with optional timestamp
      if (timestamp) {
        db.prepare(`
          UPDATE reading_sessions 
          SET price = ?, notes = ?, timestamp = ? 
          WHERE id = ?
        `).run(price, notes, timestamp, id);
      } else {
        db.prepare(`
          UPDATE reading_sessions 
          SET price = ?, notes = ? 
          WHERE id = ?
        `).run(price, notes, id);
      }

      // Get current session timestamp for ordering
      const session = db.prepare('SELECT timestamp FROM reading_sessions WHERE id = ?').get(id);

      // Update readings
      const updateReading = db.prepare(`
        UPDATE readings 
        SET value = ?, delta = ? 
        WHERE session_id = ? AND meter_id = ?
      `);

      for (const meterReading of meterReadings) {
        // Get previous reading for this meter (before current session)
        const prevReading = db.prepare(`
          SELECT r.value 
          FROM readings r
          JOIN reading_sessions s ON r.session_id = s.id
          WHERE r.meter_id = ? 
            AND s.timestamp < ?
          ORDER BY s.timestamp DESC
          LIMIT 1
        `).get(meterReading.meter_id, session.timestamp);

        const delta = prevReading ? meterReading.value - prevReading.value : null;
        
        updateReading.run(meterReading.value, delta, id, meterReading.meter_id);
      }

      // If timestamp changed, we need to recalculate more sessions
      const timestampChanged = timestamp && oldSession.timestamp !== session.timestamp;
      
      if (timestampChanged) {
        // Recalculate all sessions after the old position
        const affectedSessions = db.prepare(`
          SELECT id 
          FROM reading_sessions 
          WHERE timestamp >= ?
            AND id != ?
          ORDER BY timestamp ASC
        `).all(Math.min(oldSession.timestamp, session.timestamp), id);

        for (const affectedSession of affectedSessions) {
          this.recalculateDeltas(affectedSession.id);
        }
      } else {
        // Just recalculate the next session as before
        const nextSession = db.prepare(`
          SELECT id 
          FROM reading_sessions 
          WHERE timestamp > ? 
          ORDER BY timestamp ASC 
          LIMIT 1
        `).get(session.timestamp);

        if (nextSession) {
          this.recalculateDeltas(nextSession.id);
        }
      }
    });

    transaction();
    return this.getById(id);
  }

  static delete(id) {
    const session = db.prepare('SELECT timestamp FROM reading_sessions WHERE id = ?').get(id);
    if (!session) return { changes: 0 };

    const transaction = db.transaction(() => {
      // Delete session (cascade deletes readings)
      const result = db.prepare('DELETE FROM reading_sessions WHERE id = ?').run(id);

      // Recalculate next session's deltas
      const nextSession = db.prepare(`
        SELECT id 
        FROM reading_sessions 
        WHERE timestamp > ? 
        ORDER BY timestamp ASC 
        LIMIT 1
      `).get(session.timestamp);

      if (nextSession) {
        const nextReadings = db.prepare(`
          SELECT meter_id, value 
          FROM readings 
          WHERE session_id = ?
        `).all(nextSession.id);

        for (const nextReading of nextReadings) {
          // Get previous reading before deleted session
          const prevReading = db.prepare(`
            SELECT r.value 
            FROM readings r
            JOIN reading_sessions s ON r.session_id = s.id
            WHERE r.meter_id = ? 
              AND s.timestamp < ?
            ORDER BY s.timestamp DESC
            LIMIT 1
          `).get(nextReading.meter_id, session.timestamp);

          const newDelta = prevReading ? nextReading.value - prevReading.value : null;
          
          db.prepare(`
            UPDATE readings 
            SET delta = ? 
            WHERE session_id = ? AND meter_id = ?
          `).run(newDelta, nextSession.id, nextReading.meter_id);
        }
      }

      return result;
    });

    return transaction();
  }

  static recalculateDeltas(sessionId) {
    // Get session details
    const session = db.prepare('SELECT timestamp FROM reading_sessions WHERE id = ?').get(sessionId);
    if (!session) return;

    const transaction = db.transaction(() => {
      // Get all readings for this session
      const readings = db.prepare(`
        SELECT meter_id, value 
        FROM readings 
        WHERE session_id = ?
      `).all(sessionId);

      // Recalculate delta for each reading
      for (const reading of readings) {
        // Get previous reading for this meter
        const prevReading = db.prepare(`
          SELECT r.value 
          FROM readings r
          JOIN reading_sessions s ON r.session_id = s.id
          WHERE r.meter_id = ? 
            AND s.timestamp < ?
          ORDER BY s.timestamp DESC
          LIMIT 1
        `).get(reading.meter_id, session.timestamp);

        const newDelta = prevReading ? reading.value - prevReading.value : null;
        
        db.prepare(`
          UPDATE readings 
          SET delta = ? 
          WHERE session_id = ? AND meter_id = ?
        `).run(newDelta, sessionId, reading.meter_id);
      }
    });

    transaction();
  }

  static getStatistics(startDate = null, endDate = null) {
    let query = `
      SELECT 
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(r.id) as total_readings,
        SUM(r.delta) as total_consumption,
        SUM(r.delta * s.price) as total_cost,
        AVG(r.delta) as avg_consumption_per_meter,
        AVG(s.price) as avg_price,
        MIN(s.price) as min_price,
        MAX(s.price) as max_price
      FROM reading_sessions s
      LEFT JOIN readings r ON s.id = r.session_id
      WHERE r.delta IS NOT NULL
    `;

    const params = [];

    if (startDate) {
      query += ' AND s.timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND s.timestamp <= ?';
      params.push(endDate);
    }

    return db.prepare(query).get(...params);
  }

  static getTrend(groupBy = 'day', limit = 30) {
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
        strftime(?, s.timestamp) as period,
        SUM(r.delta) as consumption,
        SUM(r.delta * s.price) as cost,
        AVG(s.price) as avg_price,
        COUNT(DISTINCT s.id) as session_count,
        COUNT(r.id) as reading_count
      FROM reading_sessions s
      LEFT JOIN readings r ON s.id = r.session_id
      WHERE r.delta IS NOT NULL
      GROUP BY period
      ORDER BY period DESC
      LIMIT ?
    `).all(dateFormat, limit);
  }

  static getMeterStatistics(meterId, startDate = null, endDate = null) {
    let query = `
      SELECT 
        COUNT(r.id) as total_readings,
        SUM(r.delta) as total_consumption,
        SUM(r.delta * s.price) as total_cost,
        AVG(r.delta) as avg_consumption,
        AVG(s.price) as avg_price,
        MIN(s.price) as min_price,
        MAX(s.price) as max_price
      FROM readings r
      JOIN reading_sessions s ON r.session_id = s.id
      WHERE r.meter_id = ? AND r.delta IS NOT NULL
    `;

    const params = [meterId];

    if (startDate) {
      query += ' AND s.timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND s.timestamp <= ?';
      params.push(endDate);
    }

    return db.prepare(query).get(...params);
  }
}

module.exports = SessionModel;
