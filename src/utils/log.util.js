const colors = require('colors');

const logError = (...errors) => console.log(colors.red(errors));

exports.logError = logError;
