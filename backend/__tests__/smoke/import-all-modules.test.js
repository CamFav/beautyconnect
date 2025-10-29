// This file ensures top-level code in modules is loaded to improve coverage of lines
describe('Smoke - import all modules', () => {
  it('imports controllers and routes without crashing', () => {
    require('../../controllers/account/account.controller');
    require('../../controllers/account/export.controller');
    require('../../controllers/pro/availability.controller');
    require('../../controllers/pro/services.controller');
    require('../../controllers/pro/slots.controller');
    require('../../controllers/pro/dashboard.controller');
    require('../../controllers/reservations/reservation.controller');

    require('../../routes/auth.routes');
    require('../../routes/account.routes');
    require('../../routes/pro.routes');
    require('../../routes/posts.routes');
    require('../../routes/reservations.routes');
    require('../../routes/users.routes');
    require('../../routes/router');

    require('../../models/User');
    require('../../models/Reservation');
    require('../../models/ProDetails');
    require('../../models/Post');

    require('../../utils/jwt');
    require('../../utils/validators');
  });
});

