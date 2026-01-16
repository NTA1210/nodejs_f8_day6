const pool = require("../config/database");

class User {
  async findAll(limit, offset) {
    const [rows] = await pool.query(`select * from users limit ? offset ?;`, [
      limit,
      offset,
    ]);
    return rows;
  }

  async count() {
    const [rows] = await pool.query("select count(*) as count from users;");
    return rows[0].count;
  }

  async findOne(id) {
    const [rows] = await pool.query(
      `select id, email, first_name, last_name, verified_at, created_at from users where id = ?;`,
      [id]
    );
    return rows[0];
  }

  async findByEmail(email) {
    const query = `select id, email, first_name, last_name, password, verified_at from users where email = ?;`;
    const [rows] = await pool.query(query, [email]);
    console.log(rows[0]);

    return rows[0];
  }

  async create(email, password) {
    const [{ insertId }] = await pool.query(
      `insert into users (email, password) values (?, ?)`,
      [email, password]
    );
    return insertId;
  }

  async updateRefreshToken(id, token, ttl) {
    const query = `update users set refresh_token = ?, refresh_expires_at = ? where id = ?`;
    const [{ affectedRows }] = await pool.query(query, [token, ttl, id]);
    return affectedRows;
  }

  async verifyEmail(id) {
    const query = `update users set verified_at = now() where id = ?`;
    const [{ affectedRows }] = await pool.query(query, [id]);
    return affectedRows;
  }

  async findByRefreshToken(token) {
    const query =
      "select * from users where refresh_token = ? and refresh_expires_at >= now();";
    const [rows] = await pool.query(query, [token]);
    return rows[0];
  }

  async clearRefreshToken(id) {
    const query = `update users set refresh_token = null, refresh_expires_at = null where id = ?`;
    const [{ affectedRows }] = await pool.query(query, [id]);
    return affectedRows;
  }
}

module.exports = new User();
