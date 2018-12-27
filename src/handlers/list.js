require('dotenv/config');
const atob = require('atob');
const UserRepository = require('../repositories/user.repository');
const { handleError, withStatusCode } = require('../utils/response.util');
const withProcessEnv = require('../dynamodb.factory');

const documentClient = withProcessEnv(process.env)();
const repository = new UserRepository(documentClient);
const badRequest = withStatusCode(400);
const ok = withStatusCode(200, JSON.stringify);

exports.handler = async ({ headers: { authToken } }) => {
  let login;
  let password;
  let users;

  try {
    [login, password] = atob(authToken).split(',');

    if (!login || !password) {
      return badRequest();
    }
  } catch (error) {
    return badRequest();
  }

  try {
    users = await repository.list(authToken);

    return ok(users);
  } catch (error) {
    return handleError(error);
  }
};
