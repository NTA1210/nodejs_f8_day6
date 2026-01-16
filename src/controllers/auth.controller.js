const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { authSecret, verifyEmailSecret } = require("../config/jwt");
const {
  BCRYPT_SALT_ROUNDS,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_DAYS,
  ERROR_MESSAGES,
  HTTP_STATUS,
} = require("../config/constants");
const userModel = require("../models/user.model");
const jwtUtils = require("../utils/jwt");
const strings = require("../utils/strings");
const emailService = require("../services/email.service");
const queueService = require("../services/queue.service");
const revoke_tokenModel = require("../models/revoke_token.model");

const responseWithTokens = async (user) => {
  const accessTokenTtlMs = ACCESS_TOKEN_TTL_SECONDS;
  const refreshTokenTtlMs = REFRESH_TOKEN_TTL_DAYS;

  const payload = {
    sub: user.id,
    exp: Date.now() + accessTokenTtlMs,
  };
  const accessToken = jwtUtils.sign(payload, authSecret);
  const refreshToken = strings.createRandomString(32);
  const refreshTtl = new Date(Date.now() + refreshTokenTtlMs);

  await userModel.updateRefreshToken(user.id, refreshToken, refreshTtl);

  const response = {
    access_token: accessToken,
    access_token_ttl: ACCESS_TOKEN_TTL_SECONDS,
    refresh_token: refreshToken,
    refresh_token_ttl: REFRESH_TOKEN_TTL_DAYS,
  };

  return response;
};

const register = async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  try {
    const insertId = await userModel.create(email, hash);
    const newUser = {
      id: insertId,
      email,
    };

    queueService.push({
      type: "sendVerifyEmail",
      payload: newUser,
    });

    const tokens = await responseWithTokens(newUser);

    res.success(newUser, HTTP_STATUS.CREATED, tokens);
  } catch (error) {
    if (String(error).includes("Duplicate")) {
      res.error("Email da ton tai", HTTP_STATUS.CONFLICT);
    } else {
      throw error;
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findByEmail(email);

  if (!user) {
    return res.error(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.error(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  const tokens = await responseWithTokens(user);
  res.success(user, HTTP_STATUS.OK, tokens);
};

const getCurrentUser = async (req, res) => {
  res.success(req.user);
};

const refreshToken = async (req, res) => {
  const refreshToken = req.body.refresh_token;
  const user = await userModel.findByRefreshToken(refreshToken);

  if (!user) {
    return res.error(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  const tokens = await responseWithTokens(user);
  res.success(tokens);
};

const verifyEmail = async (req, res) => {
  const token = req.body.token;
  const payload = jwt.verify(token, verifyEmailSecret);

  if (payload.exp < Date.now()) {
    res.error("Token het han");
    return;
  }

  const userId = payload.sub;
  const user = await userModel.findOne(userId);

  if (user.verified_at) {
    res.error("Token da het han hoac khong hop le", 403);
    return;
  }

  await userModel.verifyEmail(userId);

  res.success("Verify email thanh cong");
};

const resendVerifyEmail = async (req, res) => {
  if (req.user.verified_at) {
    res.error("Tai khoan da duoc xac minh!", 400);
    return;
  }

  queueService.push({
    type: "sendVerifyEmail",
    payload: {
      id: req.user.id,
      email: req.user.email,
    },
  });

  res.success("Resend verify email thanh cong");
};

const logout = async (req, res) => {
  const user_id = req.user.id;
  const token = req.token;

  await userModel.clearRefreshToken(user_id);
  await revoke_tokenModel.create(token);
  res.success("Logout thanh cong");
};

module.exports = {
  register,
  login,
  getCurrentUser,
  refreshToken,
  verifyEmail,
  resendVerifyEmail,
  logout,
};
