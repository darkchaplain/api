const { handler } = require('./delete');

beforeEach(() => {
  jest.resetModules();
});

describe('Delete handler', () => {
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
  it('should return 204 if user was deleted', () => {
    const mockDelete = jest.fn();

    jest.doMock('../repositories/user.repository', () => {
      return jest.fn().mockImplementation(() => {
        return {
          delete: mockDelete
        };
      });
    });
    const { handler } = require('./delete');
    const event = {
      headers: {
        authToken: 'Zm9vLCAxMjM='
      },
      pathParameters: {
        login: 'user'
      }
    };

    return handler(event)
      .then((data) => {
        expect(mockDelete).toHaveBeenCalledWith('user', 'Zm9vLCAxMjM=');
        expect(data.statusCode).toEqual(204);
      });
  });
});
