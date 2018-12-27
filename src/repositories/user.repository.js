require('dotenv/config');
const atob = require('atob');
const md5 = require('md5');
const { ROLE_ADMIN } = require('../constants/constants');

class UserRepository {
  get baseParams() {
    return {
      TableName: process.env.TABLE_NAME
    };
  }

  constructor(documentClient) {
    this.documentClient = documentClient;
  }

  async delete(login, authToken) {
    const canUserPerformAction = await this.getCanUserPerformAction(login, authToken);
    let params;

    if (canUserPerformAction) {
      params = this.createParams({ Key: { Login: login } });

      await this.documentClient
        .delete(params)
        .promise();

      return login;
    } else {
      throw new Error('Error 403: No permissions');
    }
  }

  async get(login, authToken) {
    const canUserPerformAction = await this.getCanUserPerformAction(login, authToken);

    if (canUserPerformAction) {
      return await this.getUser(login);
    } else {
      throw new Error('Error 403: No permissions');
    }
  }

  async getUser(login) {
    const params = this.createParams({ Key: { Login: login } });
    const response = await this.documentClient
      .get(params)
      .promise();

    return response.Item;
  }

  async getCanUserPerformAction(targetLogin, authToken, isAdminPrivilegesRequired) {
    const [login, password] = atob(authToken).split(',');
    const currentUser = await this.getUser(login);
    const passwordHash = md5(password);

    if (!currentUser) {
      return false;
    }
    if (currentUser.Role === ROLE_ADMIN) {
      return currentUser.Password === passwordHash;
    } else if (isAdminPrivilegesRequired) {
      return false;
    } else {
      return currentUser.Password === passwordHash && currentUser.Login === targetLogin
    }
  }

  async getIsCurrentUserAdmin(authToken) {
    const [login, password] = atob(authToken).split(',');
    let currentUser;
    let passwordHash;

    if (!login || !password) {
      return false;
    }

    currentUser = await this.getUser(login);

    if (!currentUser) {
      return false;
    }

    passwordHash = md5(password);

    if (currentUser.Password === passwordHash && currentUser.Role === ROLE_ADMIN) {
      return true;
    }
  }

  async list(authToken) {
    const canUserPerformAction = await this.getCanUserPerformAction(null, authToken, true);
    let params;
    let response;

    if (canUserPerformAction) {
      params = this.createParams({ Limit: 9999 });
      response = await this.documentClient
        .scan(params)
        .promise();

      return response.Items || [];
    } else {
      throw new Error('Error 403: No permissions');
    }
  }

  async post(user) {
    const params = this.createParams({ Item: user });

    await this.documentClient
      .put(params)
      .promise();

    return user;
  }

  async put(user, authToken) {
    const canUserPerformAction = await this.getCanUserPerformAction(user.Login, authToken);
    let params;

    if (canUserPerformAction) {
      params = this.createParams({ Item: user });

      await this.documentClient
        .put(params)
        .promise();

      return user;
    } else {
      throw new Error('Error 403: No permissions');
    }
  }

  createParams(additionalArgs = {}) {
    return Object.assign({}, this.baseParams, additionalArgs);
  }
}

module.exports = UserRepository;
