/**
* @param { import("knex").Knex } knex
* @returns { Promise<void> }
*/
exports.up = function(knex) {
  return knex.schema
    .createTable("users", function (table) {
      table.increments("id").primary();
      table.string("username");
      table.string("email");
      table.string("password")
    })
    .createTable("roles", function (table) {
      table.increments("id").primary();
      table.string("name")
    })
    .createTable("user-roles", function (table) {
      table.increments("id").primary();
      table
        .integer("user_id")
        .references("id")
        .inTable("users") // пропущен .inTable("users"), для внешнего ключа PostgreSQL
      table
        .integer("roles_id")
        .references("id")
        .inTable("roles")
    })
};

/**
* @param { import("knex").Knex } knex
* @returns { Promise<void> }
*/
exports.down = function(knex) {
};