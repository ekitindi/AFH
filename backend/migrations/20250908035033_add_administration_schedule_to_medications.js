/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('medications', function(table) {
    table.text('administration_times'); // JSON array of times
    table.text('custom_times'); // JSON array of custom times
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('medications', function(table) {
    table.dropColumn('administration_times');
    table.dropColumn('custom_times');
  });
};
