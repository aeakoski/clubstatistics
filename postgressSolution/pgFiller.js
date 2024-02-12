
const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const { log } = require('console');
const { Client } = require('pg');

const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'osfk',
  password: 'password', // Update with your PostgreSQL password
  port: 5432,
};

const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
const yyyy = today.getFullYear();
const lastYear = yyyy-1
const lastlastYear = yyyy-2
const lastlastlastYear = yyyy-3
const lastlastlastlastYear = yyyy-4
const earliestAnalysisYear = lastYear // CHANGEME when you change start of analysis

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

// Function to insert data into the FlightLog table
async function insertData(d) {
  try {
    // Connect to the PostgreSQL database
    await client.connect();

    // Loop through the data array and insert each object into the FlightLog table
    for (const data of d) {
      //console.log(data)
      const query = `
          INSERT INTO flightlog (
            flight_datum, ac_id, regnr, fullname, departure, via, arrival,
            block_start, block_end, block_total, airborne_start, airborne_end,
            airborne_total, tach_start, tach_end, tach_total, flights, distance,
            nature_beskr, comment, rowID
          )
          VALUES (
            '${data.flight_datum}',
            ${data.ac_id},
            '${data.regnr}',
            '${data.fullname}',
            '${data.departure}',
            '${data.via}',
            '${data.arrival}',
            ${data.block_start},
            ${data.block_end},
            ${data.block_total},
            '${data.airborne_start}',
            '${data.airborne_end}',
            ${data.airborne_total},
            ${data.tach_start},
            ${data.tach_end},
            ${data.tach_total},
            ${data.flights},
            ${data.distance},
            '${data.nature_beskr}',
            '${data.comment}',
            ${data.rowID}
          )
          ON CONFLICT (rowId)
          DO UPDATE SET
            flight_datum = '${data.flight_datum}',
            ac_id = ${data.ac_id},
            regnr = '${data.regnr}',
            fullname = '${data.fullname}',
            departure = '${data.departure}',
            via = '${data.via}',
            arrival = '${data.arrival}',
            block_start = ${data.block_start},
            block_end = ${data.block_end},
            block_total = ${data.block_total},
            airborne_start = '${data.airborne_start}',
            airborne_end = '${data.airborne_end}',
            airborne_total = ${data.airborne_total},
            tach_start = ${data.tach_start},
            tach_end = ${data.tach_end},
            tach_total = ${data.tach_total},
            flights = ${data.flights},
            distance = ${data.distance},
            nature_beskr = '${data.nature_beskr}',
            comment = '${data.comment}';
        `;

      // Execute the insert query
      let r = await client.query(query);
      console.log(query)
      console.log("Result from querry");
      console.log(r);
      
    }

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

