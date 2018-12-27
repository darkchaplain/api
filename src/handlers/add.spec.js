const { handler } = require('./add');
const { ROLE_ADMIN, ROLE_USER } = require('../constants/constants');

beforeEach(() => {
  jest.resetModules();
});

describe('Add handler', () => {
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
  it('should return 400 error if body has no login', () => {
    const event = {
      body: 'password=qwerty123',
      headers: {
        authToken: 'Zm9vLCAxMjM='
      },
      pathParameters: {}
    };

    return handler(event)
      .then((data) => {
        expect(data.statusCode).toEqual(400);
      });
  });
  it('should return 400 error if body has no password', () => {
    const event = {
      body: 'login=admin',
      headers: {
        authToken: 'Zm9vLCAxMjM='
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
  it('should return 409 error if user already exists', () => {
    jest.doMock('../repositories/user.repository', () => {
      return jest.fn().mockImplementation(() => {
        return {
          getIsCurrentUserAdmin: () => Promise.resolve(true),
          getUser: () => Promise.resolve({ Login: 'foo', Password: 'bar'})
        };
      });
    });
    const { handler } = require('./add');
    const event = {
      body: 'login=admin&password=qwerty123',
      headers: {
        authToken: 'Zm9vLCAxMjM='
      },
      pathParameters: {}
    };

    return handler(event)
      .then((data) => {
        expect(data.statusCode).toEqual(409);
      });
  });
  it('should send correct user if contact added by admin', () => {
    const mockPost = jest.fn();

    jest.doMock('../repositories/user.repository', () => {
      return jest.fn().mockImplementation(() => {
        return {
          getUser: () => Promise.resolve(null),
          getIsCurrentUserAdmin: () => Promise.resolve(true),
          post: mockPost
        };
      });
    });
    const { handler } = require('./add');
    const event = {
      headers: {
        authToken: 'Zm9vLCAxMjM='
      },
      pathParameters: {},
      body: 'login=admin&name=Developer&password=qwerty123&role=admin'
    };

    return handler(event)
      .then((data) => {
        expect(mockPost).toHaveBeenCalledWith({
          Login: 'admin',
          Name: 'Developer',
          Password: '3fc0a7acf087f549ac2b266baf94b8b1',
          Role: ROLE_ADMIN
        });
        expect(data.statusCode).toEqual(201);
      });
  });
  it('should send correct user if contact added not by admin', () => {
    const mockPost = jest.fn();

    jest.doMock('../repositories/user.repository', () => {
      return jest.fn().mockImplementation(() => {
        return {
          getUser: () => Promise.resolve(null),
          getIsCurrentUserAdmin: () => Promise.resolve(false),
          post: mockPost
        };
      });
    });
    const { handler } = require('./add');
    const event = {
      headers: {
        authToken: 'Zm9vLCAxMjM='
      },
      pathParameters: {},
      body: 'login=admin&name=Developer&password=qwerty123&role=admin'
    };

    return handler(event)
      .then((data) => {
        expect(mockPost).toHaveBeenCalledWith({
          Login: 'admin',
          Name: 'Developer',
          Password: '3fc0a7acf087f549ac2b266baf94b8b1',
          Role: ROLE_USER
        });
        expect(data.statusCode).toEqual(201);
      });
  });
});
