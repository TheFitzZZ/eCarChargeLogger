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
    return db.prepare('DELETE FROM meters WHERE id = ?').run(id);
  }
}

module.exports = MeterModel;
