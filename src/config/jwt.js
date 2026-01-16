const jwt = {
  authSecret: process.env.JWT_SECRET,
  verifyEmailSecret: process.env.VERIFY_EMAIL_JWT_SECRET,
};

module.exports = jwt;
