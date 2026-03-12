const errorMiddleware = (err, req, res, next) => {
  if (!err) {
    return next();
  }

  const status =
    err.status ||
    err.statusCode ||
    err.response?.status ||
    500;

  const message =
    err.message ||
    err.response?.data?.message ||
    "internal server error";

  return res.status(status).json({
    status: false,
    message,
  });
};

module.exports = errorMiddleware;
