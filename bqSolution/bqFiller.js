const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const { log } = require('console');
const { BigQuery } = require('@google-cloud/bigquery');
const fs = require('fs');
const path = require('path');
const { not } = require('mathjs');
const crypto = require('crypto');



// Create a new BigQuery client
const bigquery = new BigQuery({ projectId: 'osfk-it' });

// Define your BigQuery dataset and table ID
const datasetId = 'flight_log';
const tableId = 'flight';


const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
const yyyy = today.getFullYear();
const lastYear = yyyy-1
const lastlastYear = yyyy-2
const lastlastlastYear = yyyy-3
const lastlastlastlastYear = yyyy-4
const lastlastlastlastlastYear = yyyy-6
const earliestAnalysisYear = lastlastlastlastlastYear // CHANGEME when you change start of analysis

let flightLogs = []

let anonNames = {}

const hashCode = (str) => {
  // Generate a hash from the input string
  return crypto.createHash('sha256').update(str).digest('hex');
};

const seedRandom = (seed) => {
  // Create a random number generator using the seed
  let x = parseInt(seed.slice(0, 8), 16); // Use first 8 characters of the seed hash for seeding
  return () => {
    // Simple linear congruential generator (LCG)
    x = (x * 1664525 + 1013904223) % 4294967296;
    return x / 4294967296;
  };
};

const generateRandomString = (length, random) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(random() * characters.length));
  }
  return result;
};

const getAnonName = (name) => {
  if (anonNames[name]) {
    return anonNames[name];
  }

  const seed = hashCode(name);
  const random = seedRandom(seed);

  const randomString = generateRandomString(10, random); // Generate a random string of length 10
  anonNames[name] = randomString;

  return randomString;
};

const getData = () => {

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded")
    myHeaders.append("Cookie", "mwl_cookie_language=se")
    console.log("process.env.MYWEBLOG_SYSTEM_USER");
    console.log(process.env.MYWEBLOG_SYSTEM_USER);
    console.log(process.env.MYWEBLOG_SYSTEM_USER.length);
    console.log("process.env.MYWEBLOG_SYSTEM_PASSWORD");
    console.log(process.env.MYWEBLOG_SYSTEM_PASSWORD);
    console.log(process.env.MYWEBLOG_SYSTEM_PASSWORD.length);
    console.log("process.env.MYWEBLOG_TOKEN");
    console.log(process.env.MYWEBLOG_TOKEN);
    let urlencoded = new URLSearchParams()
    urlencoded.append("qtype", "GetFlightLog")
    urlencoded.append("mwl_u", process.env.MYWEBLOG_SYSTEM_USER)
    urlencoded.append("mwl_p", process.env.MYWEBLOG_SYSTEM_PASSWORD)
    urlencoded.append("app_token", process.env.MYWEBLOG_TOKEN)
    urlencoded.append("returnType", "JSON")
    urlencoded.append("limit", "20000")
    urlencoded.append("from_date", earliestAnalysisYear + "-01-01")
    urlencoded.append("to_date", dd + '-' + mm + '-' + yyyy);

    //urlencoded.append("limit", "3")
    //urlencoded.append("from_date", "01-01-2022")
    //urlencoded.append("to_date", "07-01-2022");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    return fetch("https://api.myweblog.se/api_mobile.php?version=2.0.3", requestOptions)
        .then(response => response.json())
        .catch(error => console.log('error', error));
}

async function createTable() {
  // Define the schema for the table
  const schema = [
    { name: 'flight_datum', type: 'DATE' },
    { name: 'ac_id', type: 'INTEGER' },
    { name: 'regnr', type: 'STRING' },
    { name: 'fullname', type: 'STRING' },
    { name: 'departure', type: 'STRING' },
    { name: 'via', type: 'STRING' },
    { name: 'arrival', type: 'STRING' },
    { name: 'block_start', type: 'TIME' },
    { name: 'block_end', type: 'TIME' },
    { name: 'block_total', type: 'FLOAT' },
    { name: 'airborne_start', type: 'TIME' },
    { name: 'airborne_end', type: 'TIME' },
    { name: 'airborne_total', type: 'FLOAT' },
    { name: 'tach_start', type: 'FLOAT' },
    { name: 'tach_end', type: 'FLOAT' },
    { name: 'tach_total', type: 'FLOAT' },
    { name: 'flights', type: 'INTEGER' },
    { name: 'distance', type: 'FLOAT' },
    { name: 'nature_beskr', type: 'STRING' },
    { name: 'comment', type: 'STRING' },
    { name: 'rowID', type: 'INTEGER', mode: 'REQUIRED' }
  ];

  // Create the table
  await bigquery
      .dataset(datasetId)
      .createTable(tableId, {
          schema: schema,
      });

  console.log(`Table ${tableId} created.`);
}

const updateFlightData = async () => {
    let _flightLogs = await getData();
    if (_flightLogs.result == undefined){
      console.log(_flightLogs)
    }
    let flightLogs = _flightLogs.result.FlightLog;
    
    if (Array.isArray(flightLogs)) {
      console.log(flightLogs[0]);
    } else {
      console.log(flightLogs);
    }
    
    try {
        // Check if the table exists
        const [tableExists] = await bigquery.dataset(datasetId).table(tableId).exists();

        // If the table exists, delete it
        if (tableExists) {
            await bigquery.dataset(datasetId).table(tableId).delete();
            console.log(`Table ${tableId} deleted.`);
        }

        // Create the table
        await createTable();

        // Insert data into the newly created table
        
        const csvData = flightLogs.map(log => {
            if (log.comment && log.comment.includes(',')) {
                log.comment = log.comment.replace(/,/g, '');
            }
            if (log.comment && log.comment.includes('"')) {
              log.comment = log.comment.replace(/"/g, '');
            }
            if (log.nature_beskr && log.nature_beskr.includes(',')) {
                log.nature_beskr = log.nature_beskr.replace(/,/g, '');
            }

            if (log.block_start && log.block_start.includes('.')) {
              log.block_start = log.block_start.replace(/\./g, '0');
            }
            if (log.block_start && log.block_start.includes(',')) {
              log.block_start = log.block_start.replace(/,/g, '0');
            }
            if (log.block_start) log.block_start += ":00";
            
            if (log.block_end && log.block_end.includes('.')) {
              log.block_end = log.block_end.replace(/\./g, '0');
            }
            if (log.block_end && log.block_end.includes(',')) {
              log.block_end = log.block_end.replace(/,/g, '0');
            }
            if (log.block_end) log.block_end += ":00";
            
            if (log.airborne_start && log.airborne_start.includes('.')) {
              log.airborne_start = log.airborne_start.replace(/\./g, '1');
            }
            if (log.airborne_start && log.airborne_start.includes(',')) {
              log.airborne_start = log.airborne_start.replace(/,/g, '1');
            }
            if (log.airborne_start) log.airborne_start += ":00";
            
            if (log.airborne_end && log.airborne_end.includes('....')) {
              log.airborne_end = '00:00';
            }
            if (log.airborne_end && log.airborne_end.includes('.')) {
              log.airborne_end = log.airborne_end.replace(/\./g, '0');
            }
            if (log.airborne_end && log.airborne_end.includes(',')) {
              log.airborne_end = log.airborne_end.replace(/,/g, '0');
            }
            if (log.airborne_end) log.airborne_end += ":00";
            
            if (log.fullname) log.fullname = getAnonName(log.fullname);
            
            return Object.values(log).join(',') + '\n';
        }).join('');

        const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').replace(/\..+/, '');
        const csvFolder = "csv"
        const filename = `${csvFolder}/flight_logs_${timestamp}.csv`;

        const dir = path.join(__dirname, 'csv');

        // Check if the CSV directory already exists
        if (!fs.existsSync(dir)) {
            // Create the directory
            fs.mkdirSync(dir, { recursive: true });
            console.log('Initiated directory "csv" created successfully.');
        }

        fs.writeFileSync(filename, csvData);
        console.log('Data written to flight_logs.csv');
        
        const [job] = await bigquery
            .dataset(datasetId)
            .table(tableId)
            .load(filename);

        // Wait for the job to finish

        console.log(`Inserted ${flightLogs.length} rows into BigQuery table.`);
    } catch (error) {
        console.error('Error updating flight data:', error);
    }
}

updateFlightData()
console.log("Done updating initial flight data")
//console.log(process.env.MYWEBLOG_SYSTEM_PASSWORD);
//console.log(process.env.MYWEBLOG_TOKEN);

