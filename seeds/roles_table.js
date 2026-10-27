/**
* @param { import("knex").Knex } knex
* @returns { Promise<void> } 
*/
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  return knex('roles').del()
    .then(function () {
      // Inserts seed entries
      return knex('roles').insert([
        {id: 1, name: 'User'},
        {id: 2, name: 'Admin'}
      ]);
    });
};