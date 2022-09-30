module.exports = (err, req, res, next) => {
  //error statusCode
  err.statusCode = err.statusCode || 500; //500--->internal error

  //error status
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
