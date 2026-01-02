const jwt = require("jsonwebtoken");
const { secret } = require("../config/jwt");
const userModel = require("../models/user.model");

const authRequired = async (req, res, next) => {
    const accessToken = req.headers.authorization
        ?.replace("Bearer", "")
        ?.trim();
    const payload = jwt.verify(accessToken, secret);

    if (payload.exp < Date.now()) {
        return res.error("Unauthorized", 401);
    }

    const currentUser = await userModel.findOne(payload.sub);

    if (!currentUser) {
        return res.error("Unauthorized", 401);
    }

    req.user = currentUser;

    next();
};

module.exports = authRequired;
