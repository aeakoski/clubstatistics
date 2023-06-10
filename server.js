
const express = require('express');
const fetch = require('node-fetch');
const http = require('http')
const app = express();
const path = require('path');
const { Headers } = require('node-fetch');
const { log } = require('console');

const PORT = process.env.PORT || 8889;

const bootTime = Date.now();
const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
const yyyy = today.getFullYear();
const lastYear = yyyy-1

const OUR_GLIDERS = ['SE-TZY', 'SE-URG', 'SE-TVL', 'SE-UUY', 'SE-UFA', 'SE-SKZ']
const OUR_MOTORPLANES = ['SE-MLT', 'SE-MMB', 'SE-MMC', 'SE-KBT', 'SE-CKB',]
const OUR_AIRPLANES = OUR_MOTORPLANES + OUR_GLIDERS

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

    urlencoded.append("from_date", lastYear + "-01-01")
    urlencoded.append("to_date", dd + '-' + mm + '-' + yyyy);

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

const addFlightsToPlane = (registration, noFlights, noHours) => {
  if (airplanes[registration] === undefined){
    airplanes[registration] = {
      "flights": noFlights,
      "hours": noHours
    }
  } else {
    airplanes[registration]["flights"] = airplanes[registration]["flights"] + noFlights
    airplanes[registration]["hours"] = airplanes[registration]["hours"] + noHours
  }
}

const updateBookingData = async () => {
  /*
  Return
  [
    {
      "date": "2023-05-25",
      "allFutureBookings": 37,
      "allFutureBookedHours": 153,
      "motorFutureBookings": 37,
      "motorFutureBookedHours": 153,
      "gliderFutureBookings": 37,
      "gliderFutureBookedHours": 153,
    }...
  ]
  */
  1+1;
}

const updateFlightData = async () => {
    const data = await getData()

    //console.log(data.result.FlightLog[0]);
    // Init cumsum list with empty buckets

    for (let d = new Date(lastYear, 0, 1); d <= new Date(yyyy, 11, 31); d.setDate(d.getDate() + 1)) {
      flightDataByDate[d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0')] = {
        "date": d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0'),
        "flightHoursAllCumSum": null,
        "flightHoursMotorCumSum": null,
        "flightHoursGliderCumSum": null,
        "noFlightsAllCumSum": null,
        "noFlightsMotorCumSum": null,
        "noFlightsGliderCumSum": null,
        "membersCumSum": null,
        "flights": []
      }
    }

    // Sort the flights into the date buckets
    data.result.FlightLog.filter((flight) => OUR_AIRPLANES.includes(flight.regnr)).forEach(flight => flightDataByDate[flight.flight_datum].flights.push(flight))

    // Calculate cumsum and reset on every new year
    for (let d = new Date(lastYear, 0, 2); d <= today; d.setDate(d.getDate() + 1)) {
      let thisDate = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');

      // Reset cumsum in the begining of the year
      if(d.getMonth() == 0 && d.getDate() == 1){
        flightDataByDate[thisDate]["flightHoursAllCumSum"] = flightDataByDate[thisDate]["flights"].reduce(
          (accumulator, currentFlight)=> accumulator + parseFloat(currentFlight.airborne_total), 0
        );

        flightDataByDate[thisDate]["flightHoursMotorCumSum"] = flightDataByDate[thisDate]["flights"].filter((flight) => OUR_MOTORPLANES.includes(flight.regnr)).reduce(
          (accumulator, currentFlight)=> accumulator + parseFloat(currentFlight.airborne_total), 0
        );

        flightDataByDate[thisDate]["flightHoursGliderCumSum"] = flightDataByDate[thisDate]["flights"].filter((flight) => OUR_GLIDERS.includes(flight.regnr)).reduce(
          (accumulator, currentFlight)=> accumulator + parseFloat(currentFlight.airborne_total), 0
        );
        continue;
      }

      // Calculate cumsum based on yesterdays cumsum
      let yd = (new Date(d));
      yd.setDate(d.getDate() - 1);
      let yesterdaysDate = yd.getFullYear() + "-" + String(yd.getMonth()+1).padStart(2, '0') + "-" + String(yd.getDate()).padStart(2, '0');

      flightDataByDate[thisDate].flightHoursAllCumSum = flightDataByDate[thisDate]["flights"].reduce(
        (accumulator, currentFlight) => accumulator + parseFloat(currentFlight.airborne_total), flightDataByDate[yesterdaysDate].flightHoursAllCumSum
      );
      flightDataByDate[thisDate].flightHoursMotorCumSum = flightDataByDate[thisDate]["flights"].filter((flight) => OUR_MOTORPLANES.includes(flight.regnr)).reduce(
        (accumulator, currentFlight)=> accumulator + parseFloat(currentFlight.airborne_total), flightDataByDate[yesterdaysDate].flightHoursMotorCumSum
      );
      flightDataByDate[thisDate].flightHoursGliderCumSum = flightDataByDate[thisDate]["flights"].filter((flight) => OUR_GLIDERS.includes(flight.regnr)).reduce(
        (accumulator, currentFlight)=> accumulator + parseFloat(currentFlight.airborne_total), flightDataByDate[yesterdaysDate].flightHoursGliderCumSum
      );
    }

    /*
    let pilots = new Map()
    data.result.FlightLog.forEach((x) => {pilots.set(x.fullname, 1)})
    totNoPilots = [...pilots.keys()].length
    */

    // Anonomyse by removing the individual flights
    let tmp_cumSumFlightList = Object.values(flightDataByDate);
    for (let index = 0; index < tmp_cumSumFlightList.length; index++) {
      tmp_cumSumFlightList[index].flights = [];
    }

    // Return
    cumSumFlightList = tmp_cumSumFlightList;
}

var airplanes = {}

var flightDataByDate = {} // This is LiveFlights
var cumSumFlightList = []
var cumSumBookingtList = []

updateFlightData()
updateBookingData()
setInterval(updateFlightData, 15*60*1000); // 5th min

console.log(process.env.MYWEBLOG_SYSTEM_USER);
console.log(process.env.MYWEBLOG_SYSTEM_PASSWORD);
console.log(process.env.MYWEBLOG_TOKEN);

app.get('/stats', async (req, res) => {

    res.set("Access-Control-Allow-Origin", "*")
    res.send(
      {
        "futureBookingCumSum" : cumSumBookingtList,
        "flightCumSum" : cumSumFlightList,
        "bootTime": bootTime
      }
    );
});


app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

http.createServer(app)
    .listen(PORT, function () {
        console.log('Example app listening on port 8889! Go to http://localhost:'+PORT+'/')
    })
