/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('first_name', 50).notNullable();
    table.string('last_name', 50).notNullable();
    table.string('email').unique().notNullable();
    table.string('phone', 20);
    table.string('password_hash').notNullable();
    table.enum('role', ['provider', 'admin', 'caregiver']).notNullable();
    table.text('certifications');
    table.text('experience_description');
    table.integer('years_experience');
    table.decimal('hourly_rate', 8, 2);
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_verified').defaultTo(false);
    table.string('verification_token');
    table.datetime('last_login');
    table.timestamps(true, true);
    table.index(['email']);
    table.index(['role']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
