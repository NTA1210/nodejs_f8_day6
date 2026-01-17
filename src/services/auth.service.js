const {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_DAYS,
} = require("../config/constants");
const revokedTokenModel = require("../models/revokedToken.model");
const userModel = require("../models/user.model");
const { authSecret, BCRYPT_SALT_ROUNDS } = require("../config/jwt");
const jwtUtils = require("../utils/jwt");
const strings = require("../utils/strings");

const bcrypt = require("bcrypt");

class AuthService {
  responseWithTokens = async (user) => {
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

  async register({ email, password }) {
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

      return { user: newUser, tokens };
    } catch (error) {
      if (String(error).includes("Duplicate")) {
        res.error("Email da ton tai", HTTP_STATUS.CONFLICT);
      } else {
        throw error;
      }
    }
  }

  async logout(userId, refreshToken) {
    await userModel.clearRefreshToken(userId);
    await revokedTokenModel.create(refreshToken);
  }
}

module.exports = new AuthService();
