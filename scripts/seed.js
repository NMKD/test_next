const { Pool } = require("pg");
const {
  invoices,
  customers,
  revenue,
  users,
} = require("../app/lib/placeholder-data.js");
const bcrypt = require("bcrypt");

const connectionString = process.env.DATABASE_URL;

async function seedUsers(client) {
  try {
    const pool = await client.connect();
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    // Create the "invoices" table if it doesn't exist
    const createTable = await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);

    console.log(`Created "users" table`);

    // Insert data into the "users" table

    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const { id, name, email, password } = user;
        const hashedPassword = await bcrypt.hash(password, 10);
        return await pool.query(`
        INSERT INTO users (id, name, email, password)
        VALUES ('${id}', '${name}', '${email}', '${hashedPassword}')`);
      })
    );

    console.log(`Seeded ${insertedUsers.length} users`);

    return {
      createTable,
      users: insertedUsers,
    };
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

async function seedInvoices(client) {
  try {
    const pool = await client.connect();
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create the "invoices" table if it doesn't exist
    const createTable = await pool.query(`
    CREATE TABLE IF NOT EXISTS invoices (
    customer_id TEXT NOT NULL,
    amount INT NOT NULL,
    status TEXT NOT NULL,
    date DATE NOT NULL
  );
`);

    console.log(`Created "invoices" table`);

    // Insert data into the "invoices" table
    const insertedInvoices = await Promise.all(
      invoices.map(
        async (invoice) =>
          await pool.query(`
        INSERT INTO invoices (customer_id, amount, status, date) 
        VALUES ('${invoice.customer_id}', '${invoice.amount}', '${invoice.status}', '${invoice.date}')`)
      )
    );

    console.log(`Seeded ${insertedInvoices.length} invoices`);

    return {
      createTable,
      invoices: insertedInvoices,
    };
  } catch (error) {
    console.error("Error seeding invoices:", error);
    throw error;
  }
}

async function seedCustomers(client) {
  try {
    const pool = await client.connect();
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create the "customers" pool if it doesn't exist
    const createTable = await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        image_url TEXT NOT NULL
      );
    `);

    console.log(`Created "customers" table`);

    // Insert data into the "customers" table
    const insertedCustomers = await Promise.all(
      customers.map(
        async (customer) =>
          await pool.query(`
        INSERT INTO customers (id, name, email, image_url)
        VALUES ('${customer.id}', '${customer.name}', '${customer.email}', '${customer.image_url}')`)
      )
    );

    console.log(`Seeded ${insertedCustomers.length} customers`);
    return {
      createTable,
      customers: insertedCustomers,
    };
  } catch (error) {
    console.error("Error seeding customers:", error);
    throw error;
  }
}

async function seedRevenue(client) {
  try {
    const pool = await client.connect();
    // Create the "revenue" table if it doesn't exist
    const createTable = await pool.query(`
      CREATE TABLE IF NOT EXISTS revenue (
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL
      );
    `);

    console.log(`Created "revenue" table`);

    // Insert data into the "revenue" table
    const insertedRevenue = await Promise.all(
      revenue.map(
        async (rev) =>
          await pool.query(`
        INSERT INTO revenue (month, revenue)
        VALUES ('${rev.month}', '${rev.revenue}')
        ON CONFLICT (month) DO NOTHING;
      `)
      )
    );

    console.log(`Seeded ${insertedRevenue.length} revenue`);

    return {
      createTable,
      revenue: insertedRevenue,
    };
  } catch (error) {
    console.error("Error seeding revenue:", error);
    throw error;
  }
}

async function main() {
  const client = new Pool({
    connectionString,
  });
  await seedUsers(client);
  await seedCustomers(client);
  await seedInvoices(client);
  await seedRevenue(client);
  await client.end(client);
}

main().catch((err) => {
  console.error(
    "An error occurred while attempting to seed the database:",
    err
  );
});
