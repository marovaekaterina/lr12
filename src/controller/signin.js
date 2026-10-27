const databaseConfig = require('../config/knexfile'); 
//относительный путь к файлу настроек
var knex = require('knex')(databaseConfig);
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

exports.signin = (req, res) => {
  knex('users')
    .join('user_roles', 'users.id', '=', 'user_roles.user_id')
    .join('roles', 'roles.id', '=', 'user_roles.roles_id')
    .where('users.username', req.body.username)
    .select('users.id', 'users.username', 'users.email', 'users.password', 'roles.name')
    .then(users => {
      console.log(users)
      if (users.length == 0) {
        // Если пользователь не найден
        res.status(401).json({ error: 'Пользователь с таким именем не зарегистрировался!' });
      } else {
        bcrypt.compare(req.body.password, users[0].password, (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Неверный пароль!' });
            return;
          }
        })
        var token = jwt.sign({ id: users[0].id }, config.secret, {
          expiresIn: 86400 // 24 часа
        });
        // Если пользователь найден
        const roles = users.map(row => 'ROLE_' + row.name.toUpperCase());
        res.status(200).send({
          id: users[0].id,
          username: users[0].username,
          email: users[0].email,
          roles: roles,
          accessToken: token
        });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    });
};