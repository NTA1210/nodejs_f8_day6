const pool = require("../config/database");

class Post {
    async findAll(limit, offset, filters = {}) {
        const queryStr = Object.entries(filters)
            .filter(([_, value]) => value !== void 0)
            .map(([key, value]) => {
                value = typeof value === "number" ? value : `"${value}"`;
                return `${key}=${value}`;
            })
            .join(" and ");
        const [rows] = await pool.query(
            `select * from posts${
                queryStr ? ` where ${queryStr}` : ""
            } limit ${limit} offset ${offset};`
        );
        return rows;
    }

    async findUserPosts(userId) {
        const query = `select * from posts where id in (select post_id from user_post where user_id = ${userId});`;
        const [rows] = await pool.query(query);
        return rows;
    }

    async count() {
        const [rows] = await pool.query("select count(*) as count from posts;");
        return rows[0].count;
    }

    async findOne(id) {
        const [rows] = await pool.query(
            `select * from posts where id = ${id};`
        );
        return rows[0];
    }
}

module.exports = new Post();
