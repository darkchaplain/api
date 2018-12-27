const { handler } = require('./list');

beforeEach(() => {
  jest.resetModules();
});

describe('List handler', () => {
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
  it('should return users', () => {
    jest.doMock('../repositories/user.repository', () => {
      return jest.fn().mockImplementation(() => {
        return {
          list: () => Promise.resolve([
            { login: 'foo', password: 'foo' },
            { login: 'bar', password: 'bar' }
          ])
        };
      });
    });
    const { handler } = require('./list');
    const event = {
      headers: {
        authToken: 'Zm9vLCAxMjM='
      },
      pathParameters: {}
    };

    return handler(event)
      .then((data) => {
        expect(JSON.parse(data.body)).toEqual([
          {login: 'foo', password: 'foo'},
          {login: 'bar', password: 'bar'}
        ]);
        expect(data.statusCode).toEqual(200);
      });
  });
});
