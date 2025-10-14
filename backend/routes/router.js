module.exports = (app) => {
  app.use('/api/auth', require('./auth'));
  app.use('/api/account', require('./account'));
  app.use('/api/pro', require('./pro'));
  app.use('/api/posts', require('./posts'));

  // Routes users
  app.use('/api/users', require('./users/getPros'));
  app.use('/api/users', require('./users/follow'));
  app.use('/api/users', require('./users/avatar'));
  app.use("/api/users", require("./users/getOne"));
  app.use("/api/users", require("./users/getMany"));

};
