const databaseConfig = require('../config/knexfile');
const knex = require('knex')(databaseConfig);
const config = require('../config/auth.config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validate } = require('validate.js');

exports.signin = (req, res) => {
  const { username, password } = req.body;

  const constraints = {
    username: { presence: { allowEmpty: false, message: '^Введите имя пользователя' } },
    password: { presence: { allowEmpty: false, message: '^Введите пароль' } }
  };

  const validation = validate({ username, password }, constraints);
  if (validation) {
    if (req.accepts('html') && !req.is('application/json')) {
      return res.status(400).render('pages/login', {
        errors: validation,
        values: { username }
      });
    }
    return res.status(400).json({ error: validation });
  }

  knex('users')
    .join('user-roles', 'users.id', '=', 'user-roles.user_id')
    .join('roles', 'roles.id', '=', 'user-roles.roles_id')
    .where('users.username', username)
    .select('users.id', 'users.username', 'users.email', 'users.password', 'roles.name')
    .then(users => {
      if (users.length === 0) {
        if (req.accepts('html') && !req.is('application/json')) {
          return res.status(401).render('pages/login', {
            errors: { username: ['Пользователь с таким именем не зарегистрировался!'] },
            values: { username }
          });
        }
        return res.status(401).json({ error: 'Пользователь с таким именем не зарегистрировался!' });
      }

      bcrypt.compare(password, users[0].password, (err, result) => {
        if (err || !result) {
          if (req.accepts('html') && !req.is('application/json')) {
            return res.status(401).render('pages/login', {
              errors: { password: ['Неверный пароль!'] },
              values: { username }
            });
          }
          return res.status(401).json({ error: 'Неверный пароль!' });
        }

        const token = jwt.sign({ id: users[0].id }, config.secret, {
          expiresIn: 86400 // 24 часа
        });

        const roles = users.map(row => 'ROLE_' + row.name.toUpperCase());
        const userData = {
          id: users[0].id,
          username: users[0].username,
          email: users[0].email,
          roles: roles,
          accessToken: token
        };

        // переход на страницу аккаунта с выводом всех данных
        if (req.accepts('html') && !req.is('application/json')) {
          return res.status(200).render('pages/account', { user: userData });
        }

        res.status(200).send(userData);
      });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    });
};