const pool = require("../config/database");

class revokedToken {
  async findOne(token) {
    const [data] = await pool.query(
      `SELECT * FROM revoked_tokens WHERE access_token = '${token}'`,
    );

    return data[0] || null;
  }

  async create(token) {
    const data = await pool.query(
      `INSERT INTO revoked_tokens (access_token) VALUES ('${token}')`,
    );
    return data.affectedRows;
  }
}

module.exports = new revokedToken();
