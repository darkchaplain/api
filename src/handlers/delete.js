require('dotenv/config');
const atob = require('atob');
const UserRepository = require('../repositories/user.repository');
const { handleError, withStatusCode } = require('../utils/response.util');
const withProcessEnv = require('../dynamodb.factory');

const documentClient = withProcessEnv(process.env)();
const repository = new UserRepository(documentClient);
const badRequest = withStatusCode(400);
const noContent = withStatusCode(204);

exports.handler = async ({ pathParameters, headers: { authToken } }) => {
  let login;
  let password;

  try {
    [login, password] = atob(authToken).split(',');

    if (!login || !password) {
      return badRequest();
    }
  } catch (error) {
    return badRequest();
  }

  try {
    await repository.delete(pathParameters.login, authToken);

    return noContent();
  } catch (error) {
    return handleError(error);
  }
};
