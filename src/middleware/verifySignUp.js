const databaseConfig = require('../config/knexfile'); 
const knex = require('knex')(databaseConfig);

const sendError = (req, res, field, message) => {
  if (req.accepts('html') && !req.is('application/json')) {
    return res.status(400).render('pages/reg', {
      roles: ['User', 'Admin'],
      errors: { [field]: [message] },
      values: req.body
    });
  }
  return res.status(400).send({ message });
};

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    if (req.body.username) {
      const user = await knex('users').select().where('username', req.body.username);
      if (user.length !== 0) {
        return sendError(req, res, 'username', 'Ошибка. Имя пользователя уже занято!');
      }
    }

    if (req.body.email) {
      const emailUser = await knex('users').select().where('email', req.body.email);
      if (emailUser.length !== 0) {
        return sendError(req, res, 'email', 'Ошибка. Email уже используется!');
      }
    }

    next();
  } catch (err) {
    res.status(500).send({ message: 'Ошибка сервера при проверке пользователя' });
  }
};

const checkRolesExisted = async (req, res, next) => {
  try {
    if (req.body.roles) {
      const roles = Array.isArray(req.body.roles) ? req.body.roles : [req.body.roles];
      for (let i = 0; i < roles.length; i++) {
        const role = await knex('roles').select().where('name', roles[i]);
        if (role.length === 0) {
          return sendError(req, res, 'username', 'Ошибка! Такой роли не существует = ' + roles[i]);
        }
      }
    }
    next();
  } catch (err) {
    res.status(500).send({ message: 'Ошибка сервера при проверке ролей' });
  }
};

module.exports = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};