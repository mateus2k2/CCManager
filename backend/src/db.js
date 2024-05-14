// db.js

const { Pool, Client } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'requests',
  password: 'postgres',
  port: 5432,
});

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'requests',
  password: 'postgres',
  port: 5432,
});

const report = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'reports',
  password: 'postgres',
  port: 5432,
});

client.connect();

module.exports = { pool, client, report };
