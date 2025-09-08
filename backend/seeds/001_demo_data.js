const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('medication_records').del();
  await knex('medications').del();
  await knex('residents').del();
  await knex('homes').del();
  await knex('users').del();

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Insert demo users
  await knex('users').insert([
    {
      id: 1,
      first_name: 'John',
      last_name: 'Provider',
      email: 'provider@example.com',
      password_hash: hashedPassword,
      role: 'provider',
      phone: '(555) 123-4567',
      is_active: true,
      is_verified: true
    },
    {
      id: 2,
      first_name: 'Jane',
      last_name: 'Caregiver',
      email: 'caregiver@example.com',
      password_hash: hashedPassword,
      role: 'caregiver',
      phone: '(555) 987-6543',
      hourly_rate: 18.50,
      years_experience: 3,
      is_active: true,
      is_verified: true
    }
  ]);

  // Insert demo home
  await knex('homes').insert([
    {
      id: 1,
      name: 'Sunset Manor AFH',
      license_number: 'AFH-WA-2024-001',
      address: '123 Care Street',
      city: 'Seattle',
      state: 'WA',
      zip_code: '98101',
      phone: '(206) 555-0123',
      max_residents: 6,
      current_residents: 2,
      provider_id: 1,
      is_active: true
    }
  ]);

  // Insert demo residents
  await knex('residents').insert([
    {
      id: 1,
      first_name: 'Mary',
      last_name: 'Johnson',
      date_of_birth: '1940-05-15',
      gender: 'female',
      phone: '(555) 111-2222',
      emergency_contacts: JSON.stringify([
        {
          name: 'Robert Johnson',
          relationship: 'Son',
          phone: '(555) 333-4444'
        }
      ]),
      primary_physician: 'Dr. Smith',
      physician_phone: '(206) 555-9999',
      medical_conditions: JSON.stringify(['Diabetes', 'Hypertension']),
      allergies: JSON.stringify(['Penicillin']),
      is_diabetic: true,
      vitals_frequency: 'daily',
      payment_type: 'medicaid',
      monthly_rate: 3500.00,
      home_id: 1,
      admission_date: '2024-01-15',
      is_active: true
    },
    {
      id: 2,
      first_name: 'Robert',
      last_name: 'Williams',
      date_of_birth: '1935-11-22',
      gender: 'male',
      phone: '(555) 222-3333',
      emergency_contacts: JSON.stringify([
        {
          name: 'Sarah Williams',
          relationship: 'Daughter',
          phone: '(555) 444-5555'
        }
      ]),
      primary_physician: 'Dr. Jones',
      physician_phone: '(206) 555-8888',
      medical_conditions: JSON.stringify(['Arthritis']),
      allergies: JSON.stringify([]),
      is_diabetic: false,
      vitals_frequency: 'weekly',
      payment_type: 'private_pay',
      monthly_rate: 4000.00,
      home_id: 1,
      admission_date: '2024-02-01',
      is_active: true
    }
  ]);
};
