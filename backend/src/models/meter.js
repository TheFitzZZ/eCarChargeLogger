const db = require('../database');

class MeterModel {
  static getAll() {
    return db.prepare('SELECT * FROM meters ORDER BY created_at ASC').all();
  }

  static getById(id) {
    return db.prepare('SELECT * FROM meters WHERE id = ?').get(id);
  }

  static create(name) {
    const result = db.prepare('INSERT INTO meters (name) VALUES (?)').run(name);
    return this.getById(result.lastInsertRowid);
  }

  static update(id, name) {
    db.prepare('UPDATE meters SET name = ? WHERE id = ?').run(name, id);
    return this.getById(id);
  }

  static delete(id) {
    // Get all sessions that have readings for this meter
    const affectedSessions = db.prepare(`
      SELECT DISTINCT session_id 
      FROM readings 
      WHERE meter_id = ?
      ORDER BY session_id
    `).all(id);

    // Delete the meter (CASCADE will delete associated readings)
    const result = db.prepare('DELETE FROM meters WHERE id = ?').run(id);

    // Recalculate deltas for all sessions that might be affected
    if (affectedSessions.length > 0) {
      // Get all sessions after the first affected one
      const firstSessionId = affectedSessions[0].session_id;
      const sessionsToUpdate = db.prepare(`
        SELECT id FROM reading_sessions 
        WHERE id >= ?
        ORDER BY timestamp ASC
      `).all(firstSessionId);

      // Recalculate each session
      const SessionModel = require('./session');
      for (const session of sessionsToUpdate) {
        SessionModel.recalculateDeltas(session.id);
      }
    }

    return result;
  }
}

module.exports = MeterModel;
