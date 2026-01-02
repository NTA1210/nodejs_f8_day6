const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const register = async (req, res) => {
    const { email, password } = req.body;
    const insertId = await userModel.create(email, password);
    const newUser = {
        id: insertId,
        email,
    };

    res.success(newUser, 201);
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findByEmailAndPassword(email, password);

    if (!user) {
        return res.error("Unauthorized", 401);
    }

    const payload = {
        sub: user.id,
        exp: Date.now() + 60 * 60 * 1000,
    };
    const { secret } = require("../config/jwt");
    const token = jwt.sign(payload, secret);

    res.success(user, 200, {
        access_token: token,
        access_token_ttl: 3600,
    });
};

const getCurrentUser = async (req, res) => {
    res.success(req.user);
};

module.exports = { register, login, getCurrentUser };
