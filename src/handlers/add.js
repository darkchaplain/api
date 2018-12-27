require('dotenv/config');
const atob = require('atob');
const UserRepository = require('../repositories/user.repository');
const { handleError, withStatusCode } = require('../utils/response.util');
const withProcessEnv = require('../dynamodb.factory');
const querystring = require('querystring');
const md5 = require('md5');
const { ROLE_USER } = require('../constants/constants');

const documentClient = withProcessEnv(process.env)();
const repository = new UserRepository(documentClient);
const badRequest = withStatusCode(400);
const userCreated = withStatusCode(201);
const userExists = withStatusCode(409);

exports.handler = async ({ body, headers: { authToken } }) => {
  const { address, login, name, password, role } = querystring.parse(body);
  let authLogin;
  let authPassword;
  let isCurrentUserAdmin;
  let isUserExist;
  let user;

  if (!login || !password) {
    return badRequest();
  }

  try {
    [authLogin, authPassword] = atob(authToken).split(',');

    if (!authLogin || !authPassword) {
      return badRequest();
    }
  } catch (error) {
    return badRequest();
  }

  try {
    isCurrentUserAdmin = await repository.getIsCurrentUserAdmin(authToken);
    isUserExist = await repository.getUser(login);

    if (isUserExist) {
      return userExists();
    }

    user = {
      Address: address,
      Login: login,
      Name: name,
      Password: md5(password),
      Role: isCurrentUserAdmin ? role : ROLE_USER
    };

    await repository.post(user);

    return userCreated();
  } catch (error) {
    return handleError(error);
  }
};
