const databaseConfig = require('../config/knexfile');
const knex = require('knex')(databaseConfig);
const bcrypt = require('bcrypt');
const { validate } = require('validate.js');

exports.signup = (req, res) => {
  let { username, email, password, roles } = req.body;

  if (!roles) {
    roles = ['User'];
  } else if (!Array.isArray(roles)) {
    roles = [roles];
  }

  // Валидация с помощью validate.js
  const constraints = {
    username: {
      presence: { allowEmpty: false, message: '^Введите имя пользователя' },
      length: {
        minimum: 4,
        maximum: 20,
        message: '^От 4 до 20 символов'
      },
      format: {
        pattern: '^[a-zA-Z0-9_]+$',
        message: '^Только латинские буквы, цифры и _'
      }
    },
    email: {
      presence: { allowEmpty: false, message: '^Введите почту' },
      email: { message: '^Некорректный формат email' }
    },
    password: {
      presence: { allowEmpty: false, message: '^Введите пароль' },
      length: {
        minimum: 6,
        maximum: 20,
        message: '^От 6 до 20 символов'
      },
      format: {
        pattern: '^(?=.*[A-Za-z])(?=.*\\d).+$',
        message: '^Пароль должен содержать буквы и цифры'
      }
    }
  };

  const validation = validate({ username, email, password }, constraints);
  if (validation) {
    if (req.accepts('html') && !req.is('application/json')) {
      return res.status(400).render('pages/reg', {
        roles: ['User', 'Admin'],
        errors: validation,
        values: { username, email }
      });
    }
    return res.status(400).json({ error: validation });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    knex.transaction(async trx => {
      try {
        const userId = await trx('users')
          .insert({ username, password: hashedPassword, email })
          .returning('id');

        const insertedId = typeof userId[0] === 'object' ? userId[0].id : userId[0];

        const roleIds = await trx('roles')
          .whereIn('name', roles)
          .pluck('id');

        await trx('user-roles').insert(
          roleIds.map(roleId => ({
            user_id: insertedId,
            roles_id: roleId
          }))
        );

        // Если регистрация через браузер, то на страницу входа
        if (req.accepts('html') && !req.is('application/json')) {
          return res.redirect('/auth/signin');
        }

        res.status(200).send({ message: 'Пользователь добавлен' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  });
};