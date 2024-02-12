
const { configure } = require('@testing-library/react');
const { log } = require('mathjs');
const { Client } = require('pg');

const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'osfk',
    password: 'password', // Update with your PostgreSQL password
    port: 5432,
  };


const client = new Client(dbConfig);


async function retrieveData() {

  await client.connect();
  const res = await client.query("SELECT COUNT(*) FROM flightlog");
  console.log("Toodleoo")
  console.log(res.rows);
  await client.end();
}

retrieveData()
console.log("done")