describe('Routes - router branches', () => {
  const originalEnv = process.env.NODE_ENV;
  afterAll(() => { process.env.NODE_ENV = originalEnv; });

  const makeApp = () => {
    const handlers = { get: [], use: [], mounted: [] };
    return {
      handlers,
      get: (path, handler) => handlers.get.push({ path, handler }),
      use: (pathOrHandler, maybeHandler) => {
        if (typeof pathOrHandler === 'string') {
          handlers.mounted.push(pathOrHandler);
          if (maybeHandler) handlers.use.push(maybeHandler);
        } else {
          handlers.use.push(pathOrHandler);
        }
      },
    };
  };

  it('mounts all routes and logs in non-production', () => {
    process.env.NODE_ENV = 'test';
    const app = makeApp();
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    require('../../routes/router')(app);
    expect(app.handlers.mounted).toEqual([
      '/api/auth',
      '/api/account',
      '/api/pro',
      '/api/posts',
      '/api/users',
      '/api/reservations',
    ]);
    expect(logSpy).toHaveBeenCalled();
  });

  it('error handler returns status from err and default 500', () => {
    process.env.NODE_ENV = 'production';
    const app = makeApp();
    require('../../routes/router')(app);
    const errorHandler = app.handlers.use[app.handlers.use.length - 1];

    const res1 = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    errorHandler({ status: 418, message: 'teapot' }, {}, res1, () => {});
    expect(res1.status).toHaveBeenCalledWith(418);

    const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    errorHandler({ message: 'no status' }, {}, res2, () => {});
    expect(res2.status).toHaveBeenCalledWith(500);
  });

  it('error handler logs in non-production', () => {
    process.env.NODE_ENV = 'test';
    const app = makeApp();
    require('../../routes/router')(app);
    const errorHandler = app.handlers.use[app.handlers.use.length - 1];
    const errLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    errorHandler(new Error('boom'), {}, res, () => {});
    expect(errLog).toHaveBeenCalled();
  });
});
