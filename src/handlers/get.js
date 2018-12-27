require('dotenv/config');
const atob = require('atob');
const UserRepository = require('../repositories/user.repository');
const { handleError, withStatusCode } = require('../utils/response.util');
const withProcessEnv = require('../dynamodb.factory');

const docClient = withProcessEnv(process.env)();
const repository = new UserRepository(docClient);
const badRequest = withStatusCode(400);
const ok = withStatusCode(200, JSON.stringify);
const notFound = withStatusCode(404);

exports.handler = async ({ headers: { authToken }, pathParameters }) => {
  let login;
  let password;
  let user;

  try {
    [login, password] = atob(authToken).split(',');

    if (!login || !password) {
      return badRequest();
    }
  } catch (error) {
    return badRequest();
  }

  try {
    user = await repository.get(pathParameters.login, authToken);

    if (!user) {
      return notFound();
    }

    return ok(user);
  } catch (error) {
    return handleError(error);
  }
};
