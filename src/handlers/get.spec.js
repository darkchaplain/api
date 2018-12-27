const { handler } = require('./get');
const { ROLE_USER } = require('../constants/constants');

beforeEach(() => {
  jest.resetModules();
});

describe('Get handler', () => {
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
          get: () => Promise.resolve(null)
        };
      });
    });
    const { handler } = require('./get');
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
  it('should return user', () => {
    jest.doMock('../repositories/user.repository', () => {
      return jest.fn().mockImplementation(() => {
        return {
          get: () => Promise.resolve({
            Address: 'City, street',
            Login: 'admin',
            Name: 'Developer',
            Password: '202cb962ac59075b964b07152d234b70',
            Role: ROLE_USER
          })
        };
      });
    });
    const { handler } = require('./get');
    const event = {
      headers: {
        authToken: 'Zm9vLCAxMjM='
      },
      pathParameters: {}
    };

    return handler(event)
      .then((data) => {
        expect(JSON.parse(data.body)).toEqual({
          Address: 'City, street',
          Login: 'admin',
          Name: 'Developer',
          Password: '202cb962ac59075b964b07152d234b70',
          Role: ROLE_USER
        });
        expect(data.statusCode).toEqual(200);
      });
  });
});
