const { authSecret } = require("../config/jwt");
const { ERROR_MESSAGES, HTTP_STATUS } = require("../config/constants");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const revokedTokenModel = require("../models/revokedToken.model");

const authRequired = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.error(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  const accessToken = authHeader.replace("Bearer ", "").trim();
  if (!accessToken) {
    return res.error(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  const payload = jwt.verify(accessToken, authSecret);

  const revokedToken = await revokedTokenModel.findOne(accessToken);
  if (revokedToken) {
    return res.error(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  const currentUser = await userModel.findOne(payload.sub);

  if (!currentUser) {
    return res.error(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  req.user = currentUser;
  req.token = accessToken;

  next();
};

module.exports = authRequired;
