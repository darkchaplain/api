const { logError } = require('./log.util');

const isCodeInRange = errorCode => errorCode && (100 < errorCode && errorCode < 599);
const withStatusCode = (statusCode, formatter = null) => {
  let _statusCode = statusCode;
  let format;
  let response;

  if (!isCodeInRange(_statusCode)) {
    logError('Status code is out of range');
    _statusCode = 500;
  }

  format = typeof formatter === 'function'
    ? formatter
    : _ => _;

  return (data = null) => {
    response = {
      statusCode: _statusCode
    };

    if (data) {
      response.body = format(data);
    }

    return response;
  }
};
const parseErrorCode = (error) => {
  try {
    const errorCode = error.message.match(/\d{3}/);

    if (isCodeInRange(parseInt(errorCode[0]))) {
      return parseInt(errorCode[0]);
    }

    return null;
  } catch (error) {
    return null;
  }
};
const handleError = (error) => {
  const internalServerError = withStatusCode(500);
  const errorCode = parseErrorCode(error);

  logError(error);

  if (errorCode) {
    return withStatusCode(errorCode)();
  }

  return internalServerError();
};

exports.handleError = handleError;
exports.withStatusCode = withStatusCode;
