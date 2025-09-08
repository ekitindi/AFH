exports.up = function(knex) {
  return knex.schema.createTable('medications', function(table) {
    table.increments('id').primary();
    table.integer('resident_id').unsigned().notNullable();
    table.foreign('resident_id').references('id').inTable('residents');
    table.string('medication_name').notNullable();
    table.string('dosage').notNullable();
    table.string('frequency').notNullable();
    table.string('route').notNullable();
    table.text('instructions');
    table.string('prescriber_name');
    table.string('prescriber_phone', 20);
    table.date('start_date').notNullable();
    table.date('end_date');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_prn').defaultTo(false);
    table.boolean('is_insulin').defaultTo(false);
    table.string('storage_requirements');
    table.timestamps(true, true);
    table.index(['resident_id']);
    table.index(['is_active']);
    table.index(['medication_name']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('medications');
};
