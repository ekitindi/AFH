exports.up = function(knex) {
  return knex.schema.createTable('homes', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('license_number').unique();
    table.text('address').notNullable();
    table.string('city', 50).notNullable();
    table.string('state', 2).defaultTo('WA');
    table.string('zip_code', 10).notNullable();
    table.string('phone', 20);
    table.decimal('latitude', 10, 8);
    table.decimal('longitude', 11, 8);
    table.integer('max_residents').defaultTo(6);
    table.integer('current_residents').defaultTo(0);
    table.string('liability_insurance_provider');
    table.string('liability_insurance_policy');
    table.date('liability_insurance_expires');
    table.string('medical_contract_provider');
    table.date('last_evacuation_drill');
    table.text('succession_plan');
    table.integer('provider_id').unsigned().notNullable();
    table.foreign('provider_id').references('id').inTable('users');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    table.index(['provider_id']);
    table.index(['license_number']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('homes');
};
