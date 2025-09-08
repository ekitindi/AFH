exports.up = function(knex) {
  return knex.schema.createTable('residents', function(table) {
    table.increments('id').primary();
    table.string('first_name', 50).notNullable();
    table.string('last_name', 50).notNullable();
    table.date('date_of_birth').notNullable();
    table.enum('gender', ['male', 'female', 'other']);
    table.string('social_security', 20);
    table.string('phone', 20);
    table.text('previous_address');
    table.text('emergency_contacts');
    table.string('primary_physician');
    table.string('physician_phone', 20);
    table.text('medical_conditions');
    table.text('allergies');
    table.boolean('is_diabetic').defaultTo(false);
    table.enum('vitals_frequency', ['daily', 'weekly']).defaultTo('weekly');
    table.text('care_plan_notes');
    table.text('dietary_restrictions');
    table.text('personal_belongings');
    table.enum('payment_type', ['medicaid', 'private_pay', 'insurance']);
    table.decimal('monthly_rate', 8, 2);
    table.integer('home_id').unsigned().notNullable();
    table.foreign('home_id').references('id').inTable('homes');
    table.date('admission_date');
    table.date('discharge_date');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    table.index(['home_id']);
    table.index(['is_active']);
    table.index(['admission_date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('residents');
};
