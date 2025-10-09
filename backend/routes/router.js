module.exports = (app) => {
  app.use('/api/auth', require('./auth'));
  app.use('/api/account', require('./account'));
  app.use('/api/pro', require('./pro'));
};