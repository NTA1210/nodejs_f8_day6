const taskCreateValidator = (req, res, next) => {
  let { title } = req.body;

  title = title.trim();

  if (!title || title.length < 2 || title.length > 50) {
    return res.error(
      {
        title: "Title must be between 2 and 50 characters",
      },
      422
    );
  }
  next();
};

module.exports = taskCreateValidator;
