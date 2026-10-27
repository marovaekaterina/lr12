const databaseConfig = require('../config/knexfile'); 
//относительный путь к файлу настроек
var knex = require('knex')(databaseConfig);

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  knex("users")
    .select().where("username", req.body.username)
    .then(user => {
      if (user.length != 0) {
        res.status(400).send({
          message: "Ошибка. Имя пользователя уже занято!"
        });
        return;
      }
      // Email
      knex("users")
        .select().where("email", req.body.email)
        .then(user => {
          if (user.length != 0) {
            res.status(400).send({
              message: "Ошибка. Email уже используется!"
            });
            return;
          }
          next();
        });
    });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      knex("roles")
        .select().where("name", req.body.roles[i])
        .then(role => {
          if (role.length == 0) {
            console.log(req.body.roles[i])
            res.status(400).send({
              message: "Ошибка! Такой роли не существует = " + req.body.roles[i]
            });
            return;
          }
        });
    }
  }
  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
  checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;