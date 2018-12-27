require('dotenv/config');
const atob = require('atob');
const UserRepository = require('../repositories/user.repository');
const { handleError, withStatusCode } = require('../utils/response.util');
const withProcessEnv = require('../dynamodb.factory');
const querystring = require('querystring');
const md5 = require('md5');

const documentClient = withProcessEnv(process.env);
const repository = new UserRepository(documentClient());
const badRequest = withStatusCode(400);
const ok = withStatusCode(200, JSON.stringify);
const notFound = withStatusCode(404);

exports.handler = async ({ body, headers: { authToken }, pathParameters }) => {
  const { address, login, name, password, role } = querystring.parse(body);
  let authLogin;
  let authPassword;
  let isCurrentUserAdmin;
  let targetUser;
  let user;

  try {
    [authLogin, authPassword] = atob(authToken).split(',');

    if (!authLogin || !authPassword) {
      return badRequest();
    }
  } catch (error) {
    return badRequest();
  }

  try {
    targetUser = await repository.getUser(pathParameters.login);

    if (!targetUser) {
      return notFound();
    }

    isCurrentUserAdmin = await repository.getIsCurrentUserAdmin(authToken);
    user = {
      Address: address || targetUser.Address,
      Login: login || targetUser.Login,
      Name: name || targetUser.Name,
      Password: password ? md5(password) : targetUser.Password,
      Role: isCurrentUserAdmin
        ? role || targetUser.Role
        : targetUser.Role
    };

    await repository.put(user, authToken);

    return ok(user);
  } catch (error) {
    return handleError(error);
  }
};
