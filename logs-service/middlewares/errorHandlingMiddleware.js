const errorMiddleware = (err, req, res, next) => {
  console.log("a45");
  if (err) {
    return res.status(500).json({
      status: false,
      message: "internal server error",
    });
  }
  next();
};

module.exports = errorMiddleware;
