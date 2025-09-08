exports.up = function(knex) {
  return knex.schema.createTable('medication_records', function(table) {
    table.increments('id').primary();
    table.integer('medication_id').unsigned().notNullable();
    table.foreign('medication_id').references('id').inTable('medications');
    table.integer('resident_id').unsigned().notNullable();
    table.foreign('resident_id').references('id').inTable('residents');
    table.integer('administered_by').unsigned().notNullable();
    table.foreign('administered_by').references('id').inTable('users');
    table.datetime('scheduled_time').notNullable();
    table.datetime('actual_time');
    table.enum('status', ['scheduled', 'given', 'refused', 'missed', 'held']).notNullable();
    table.text('notes');
    table.integer('blood_sugar_level');
    table.string('insulin_units');
    table.string('injection_site');
    table.string('caregiver_initials', 10);
    table.timestamps(true, true);
    table.index(['medication_id']);
    table.index(['resident_id']);
    table.index(['scheduled_time']);
    table.index(['status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('medication_records');
};
