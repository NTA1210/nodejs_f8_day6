const pool = require("../config/database");

const taskModel = {
  async findAll() {
    const [data] = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );

    return data;
  },
  async findOne(id) {
    const [data] = await pool.query(`SELECT * FROM tasks WHERE id = ${id}`);

    return data[0] || null;
  },
  async create({ title, user_id }) {
    const [data] = await pool.query(
      `INSERT INTO tasks (title,user_id) VALUES ('${title}', ${user_id})`
    );

    const result = await this.findOne(data.insertId);

    return result;
  },

  async update(id, { title, completed = false }, user_id) {
    const [data] = await pool.query(
      `UPDATE tasks SET title = '${title}', completed = ${
        completed ? 1 : 0
      } WHERE id = ${id} AND user_id = ${user_id}`
    );
    console.log(data);

    return {
      affectedRows: data.affectedRows,
    };
  },

  async destroy(id, user_id) {
    const [data] = await pool.query(
      `DELETE FROM tasks WHERE id = ${id} AND user_id = ${user_id}`
    );
    return {
      affectedRows: data.affectedRows,
    };
  },
};

module.exports = taskModel;
