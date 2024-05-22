
const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const { log } = require('console');
const { Client } = require('pg');
const fs = require('fs');

const dbConfig = {
  user: 'USERNAME.onmicrosoft.com',
  host: 'SCHEMA.postgres.database.azure.com',
  database: 'USERNAME',
  password: 'PASSWORD', // Update with your PostgreSQL password
  port: 5432,
  ssl: { 
    ca: fs.readFileSync("./DigiCertGlobalRootCA.crt.pem")
  }
};

const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
const yyyy = today.getFullYear();
const earliestAnalysisYear = yyyy-6 // CHANGEME when you change start of analysis

let flightLogs = []

const getData = () => {

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded")
    myHeaders.append("Cookie", "mwl_cookie_language=se")

    let urlencoded = new URLSearchParams()
    urlencoded.append("qtype", "GetFlightLog")
    urlencoded.append("mwl_u", process.env.MYWEBLOG_SYSTEM_USER)
    urlencoded.append("mwl_p", process.env.MYWEBLOG_SYSTEM_PASSWORD)
    urlencoded.append("app_token", process.env.MYWEBLOG_TOKEN)
    urlencoded.append("returnType", "JSON")
    urlencoded.append("limit", "20000")
    urlencoded.append("from_date", earliestAnalysisYear + "-01-01")
    urlencoded.append("to_date", dd + '-' + mm + '-' + yyyy);

    //urlencoded.append("limit", "50")
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

const updateFlightData = async () => {
    let _flightLogs = await getData()    

    // Print the first and last entry of the logbook
    console.log(_flightLogs.result.FlightLog[0]);
    if (_flightLogs.result.FlightLog.length > 0){
      //console.log(_flightLogs.result.FlightLog[_flightLogs.result.FlightLog.length-1]);
    }

    insertData(_flightLogs.result.FlightLog);
    
}

// Create a new PostgreSQL client
const client = new Client(dbConfig);

function validateTimeString(inputString, defaultValue) {
  // Regular expression for HH:mm format
  const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

  if (regex.test(inputString)) {
      // String is in HH:mm format
      return inputString;
  } else {
      // String is not in HH:mm format, set it to "13:00"
      return defaultValue;
  }
}

// Function to insert data into the FlightLog table
async function insertData(d) {
  try {
    // Connect to the PostgreSQL database
    await client.connect();
    let query = `INSERT INTO flightlog (
      flight_datum, ac_id, regnr, fullname, departure, via, arrival,
      block_start, block_end, block_total, airborne_start, airborne_end,
      airborne_total, tach_start, tach_end, tach_total, flights, distance,
      nature_beskr, comment, rowID
    )
    VALUES 
    `
    // Loop through the data array and insert each object into the FlightLog table
    for (const data of d) {
      //console.log(data)
      query = query + `
      (
            '${data.flight_datum}',
            ${data.ac_id},
            '${data.regnr}',
            'Redacted',
            '${data.departure}',
            '${data.via}',
            '${data.arrival}',
            ${data.block_start},
            ${data.block_end},
            ${data.block_total},
            '${validateTimeString(data.airborne_start, "13:00")}',
            '${validateTimeString(data.airborne_end, "13:30")}',
            ${data.airborne_total},
            ${data.tach_start},
            ${data.tach_end},
            ${data.tach_total},
            ${data.flights},
            ${data.distance},
            '${data.nature_beskr}',
            '${data.comment}',
            ${data.rowID}
          ),`;
        
    }
    
    query = query.slice(0, -1); // remove last comma

    query = query + `
    ON CONFLICT (rowId)
          DO UPDATE SET
            flight_datum = excluded.flight_datum,
            ac_id = excluded.ac_id,
            regnr = excluded.regnr,
            fullname = 'Redacted',
            departure = excluded.departure,
            via = excluded.via,
            arrival = excluded.arrival,
            block_start = excluded.block_start,
            block_end = excluded.block_end,
            block_total = excluded.block_total,
            airborne_start = excluded.airborne_start,
            airborne_end = excluded.airborne_end,
            airborne_total = excluded.airborne_total,
            tach_start = excluded.tach_start,
            tach_end = excluded.tach_end,
            tach_total = excluded.tach_total,
            flights = excluded.flights,
            distance = excluded.distance,
            nature_beskr = excluded.nature_beskr,
            comment = excluded.comment;
    `
    // Execute the insert query
    //console.log(query);
    let r = await client.query(query);
    
    console.log("Result from querry");
    console.log(r);
    console.log('Data inserted successfully!');

  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    // Close the database connection
    await client.end();
  }
}


updateFlightData()
console.log("Done updating initial flight data")
console.log(process.env.MYWEBLOG_SYSTEM_USER);
//console.log(process.env.MYWEBLOG_SYSTEM_PASSWORD);
//console.log(process.env.MYWEBLOG_TOKEN);

