const { handler } = require('./update');
const { ROLE_ADMIN, ROLE_USER } = require('../constants/constants');

beforeEach(() => {
  jest.resetModules();
});

describe('Update handler', () => {
  it('should return 400 error if authToken has no login', () => {
    const event = {
      headers: {
        authToken: 'LHBhc3N3b3Jk'
      },
      pathParameters: {}
    };

    return handler(event)
      .then((data) => {
        expect(data.statusCode).toEqual(400);
      });
  });
  it('should return 400 error if authToken has no password', () => {
    const event = {
      headers: {
        authToken: 'bG9naW4='
      },
      pathParameters: {}
    };

    return handler(event)
      .then((data) => {
        expect(data.statusCode).toEqual(400);
      });
  });
  it('should return 400 error if header has no authToken', () => {
    const event = {
      headers: {},
      pathParameters: {}
    };

    return handler(event)
      .then((data) => {
        expect(data.statusCode).toEqual(400);
      });
  });
  it('should return 400 error if header has incorrect authToken', () => {
    const event = {
      headers: {
        authToken: 'q'
      },
      pathParameters: {}
    };

    return handler(event)
      .then((data) => {
        expect(data.statusCode).toEqual(400);
      });
  });
  it('should return 404 error if user was not found', () => {
    jest.doMock('../repositories/user.repository', () => {
      return jest.fn().mockImplementation(() => {
        return {
          getUser: () => Promise.resolve(null)
        };
      });
    });
    const { handler } = require('./update');
    const event = {
      headers: {
        authToken: 'Zm9vLCAxMjM='
      },
      pathParameters: {}
    };

    return handler(event)
      .then((data) => {
        expect(data.statusCode).toEqual(404);
      });
  });
  it('should return correct user and status if user was updated and current user is admin', () => {
    jest.doMock('../repositories/user.repository', () => {
      return jest.fn().mockImplementation(() => {
        return {
          getUser: () => Promise.resolve({ Login: 'admin' }),
          getIsCurrentUserAdmin: () => Promise.resolve(true),
          put: jest.fn()
        };
      });
    });
    const { handler } = require('./update');
    const event = {
      headers: {
        authToken: 'Zm9vLCAxMjM='
      },
      pathParameters: {},
      body: 'name=Developer&password=qwerty123&role=admin'
    };

    return handler(event)
      .then((data) => {
        expect(JSON.parse(data.body)).toEqual({
          Login: 'admin',
          Name: 'Developer',
          Password: '3fc0a7acf087f549ac2b266baf94b8b1',
          Role: ROLE_ADMIN
        });
        expect(data.statusCode).toEqual(200);
      });
  });
  it('should return correct user and status if user was updated and current user is not admin', () => {
    jest.doMock('../repositories/user.repository', () => {
      return jest.fn().mockImplementation(() => {
        return {
          getUser: () => Promise.resolve({ Login: 'admin', Role: ROLE_USER }),
          getIsCurrentUserAdmin: () => Promise.resolve(false),
          put: jest.fn()
        };
      });
    });
    const { handler } = require('./update');
    const event = {
      headers: {
        authToken: 'Zm9vLCAxMjM='
      },
      pathParameters: {},
      body: 'name=Developer&password=qwerty123&role=admin'
    };

    return handler(event)
      .then((data) => {
        expect(JSON.parse(data.body)).toEqual({
          Login: 'admin',
          Name: 'Developer',
          Password: '3fc0a7acf087f549ac2b266baf94b8b1',
          Role: ROLE_USER
        });
        expect(data.statusCode).toEqual(200);
      });
  });
});
