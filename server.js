
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
let LYPredSmooth;
const OUR_GLIDERS = ['SE-TZY', 'SE-URG', 'SE-TVL', 'SE-UUY', 'SE-UFA', 'SE-SKZ']
const OUR_MOTORPLANES = ['SE-MLT', 'SE-MMB', 'SE-MMC', 'SE-KBT', 'SE-CKB',]
const OUR_AIRPLANES = OUR_MOTORPLANES.concat(OUR_GLIDERS)
const movingAverageDays = 15


const range = n => Array.from(Array(n).keys())

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
      let dateString = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
      flightDataByDate[dateString] = {
        "date": dateString,
        "flightHoursAllCumSum": null,
        "flightHoursMotorCumSum": null,
        "flightHoursGliderCumSum": null,
        "noFlightsAllCumSum": null,
        "noFlightsMotorCumSum": null,
        "noFlightsGliderCumSum": null,
        "membersCumSum": null,
        "flights": [],
        "cumSumByPlane": {}
      };
      OUR_AIRPLANES.forEach( p => { flightDataByDate[dateString].cumSumByPlane[p] = null } )

    }

    // Sort the flights into the date buckets
    (
      data.result.FlightLog
      .filter((flight) => OUR_AIRPLANES.includes(flight.regnr))
      .forEach(flight => {
        flightDataByDate[flight.flight_datum].flights.push(flight);
        flightDataByDate[flight.flight_datum].cumSumByPlane[flight.regnr] = flightDataByDate[flight.flight_datum].cumSumByPlane[flight.regnr] + parseFloat(flight.airborne_total)
      })
    )

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

        OUR_AIRPLANES.forEach(plane => {
          flightDataByDate[thisDate].cumSumByPlane[plane] = flightDataByDate[thisDate].cumSumByPlane[plane]
        })
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

      OUR_AIRPLANES.forEach(plane => {
        flightDataByDate[thisDate].cumSumByPlane[plane] = flightDataByDate[thisDate].cumSumByPlane[plane] + flightDataByDate[yesterdaysDate].cumSumByPlane[plane]
      })
    }
  
    // Anonomyse by removing the individual flights
    let tmp_cumSumFlightList = Object.values(flightDataByDate);
    for (let index = 0; index < tmp_cumSumFlightList.length; index++) {
      tmp_cumSumFlightList[index].flights = [];
    }

    // Return value
    cumSumFlightList = tmp_cumSumFlightList;
 
    // Predictions
    let LY = tmp_cumSumFlightList.filter(f => ('2021-12-31' < f.date && f.date < '2023-01-01'))
    let TY = tmp_cumSumFlightList.filter(f => ('2022-12-31' < f.date && f.date < '2024-01-01'))
    
    let _largestDateTYLY = new Date()
    _largestDateTYLY.setFullYear(_largestDateTYLY.getFullYear() - 1 );
    let largestDateTYLY = _largestDateTYLY.toISOString().split('T')[0];

    let _largestDateTY = new Date()
    _largestDateTY.setDate(_largestDateTY.getDate() - 1);
    let largestDateTY = _largestDateTY.toISOString().split('T')[0];
    let diff = {
      "all": TY.filter(f => largestDateTY == f.date)[0].flightHoursAllCumSum 
              - range(movingAverageDays).reduce((accumulator, currentValue)=> {return LY[LY.map(f => f.date).indexOf(largestDateTYLY) - currentValue].flightHoursAllCumSum + accumulator}, 0) / movingAverageDays || 0, 
      "motor": TY.filter(f => largestDateTY == f.date)[0].flightHoursMotorCumSum 
              - range(movingAverageDays).reduce((accumulator, currentValue)=> {return LY[LY.map(f => f.date).indexOf(largestDateTYLY) - currentValue].flightHoursMotorCumSum + accumulator}, 0) / movingAverageDays || 0, 
      "glider": TY.filter(f => largestDateTY == f.date)[0].flightHoursGliderCumSum 
              - range(movingAverageDays).reduce((accumulator, currentValue)=> {return LY[LY.map(f => f.date).indexOf(largestDateTYLY) - currentValue].flightHoursGliderCumSum + accumulator}, 0) / movingAverageDays || 0, 
    }
    
    OUR_AIRPLANES.map((regnr)=>{
      diff[regnr] = TY.filter(f => largestDateTY == f.date)[0].cumSumByPlane[regnr]
        - range(movingAverageDays).reduce((accumulator, currentValue)=> {return LY[LY.map(f => f.date).indexOf(largestDateTYLY) - currentValue].cumSumByPlane[regnr] + accumulator}, 0) / movingAverageDays || 0
    })
    
    LYPredSmooth = LY.map((item, index)=>{
      let _tmpDate = new Date(item.date)
      _tmpDate.setFullYear(new Date().getFullYear());
      let predictionDateTY = _tmpDate.toISOString().split('T')[0];
      if (item.date < largestDateTYLY){
        let a = {
          "date": predictionDateTY,
          "predictionFlightHoursAllCumSum": null,
          "predictionFlightHoursMotorCumSum": null,
          "predictionFlightHoursGliderCumSum": null
        }
        return a
      }      

      if (index < movingAverageDays) {
        let a = {
          "date": predictionDateTY,
          "predictionFlightHoursAllCumSum": item.flightHoursAllCumSum,
          "predictionFlightHoursMotorCumSum": item.flightHoursMotorCumSum,
          "predictionFlightHoursGliderCumSum": item.flightHoursGliderCumSum
        }
        return a
      } else {
        let a = {
          "date": predictionDateTY, 
          "predictionFlightHoursAllCumSum": (
            Math.round(
              range(movingAverageDays).reduce((accumulator, currentValue)=> {return LY[index - currentValue].flightHoursAllCumSum + accumulator}, 0)
              /movingAverageDays) + diff.all
              ),
          "predictionFlightHoursMotorCumSum": (
            Math.round(
              range(movingAverageDays).reduce((accumulator, currentValue)=> {return LY[index - currentValue].flightHoursMotorCumSum + accumulator}, 0)
              /movingAverageDays) + diff.motor
              ),
          "predictionFlightHoursGliderCumSum": (
            Math.round(
              range(movingAverageDays).reduce((accumulator, currentValue)=> {return LY[index - currentValue].flightHoursGliderCumSum + accumulator}, 0)
              /movingAverageDays) + diff.glider
              )
          }
          OUR_AIRPLANES.map((regnr)=>{
            a[regnr] = (
              Math.round(
                range(movingAverageDays).reduce((accumulator, currentValue)=> {return LY[index - currentValue].cumSumByPlane[regnr] + accumulator}, 0)
                /movingAverageDays) + diff[regnr]
                )
          })
          return a
      }
    })
}

var airplanes = {}

var flightDataByDate = {} // This is LiveFlights
var cumSumFlightList = []
var cumSumBookingtList = []

updateFlightData()
console.log("Done updating initial flight data")
updateBookingData()
setInterval(updateFlightData, 15*60*1000); // 5th min

console.log(process.env.MYWEBLOG_SYSTEM_USER);
//console.log(process.env.MYWEBLOG_SYSTEM_PASSWORD);
//console.log(process.env.MYWEBLOG_TOKEN);

app.get('/stats', async (req, res) => {
    //console.log(cumSumFlightList.slice(0, 7))
    res.set("Access-Control-Allow-Origin", "*")
    res.send(
      {
        "futureBookingCumSum" : cumSumBookingtList,
        "flightCumSum" : cumSumFlightList,
        "prediction": LYPredSmooth,
        "bootTime": bootTime,
        "sailPlanes": OUR_GLIDERS,
        "motorPlanes": OUR_MOTORPLANES,
        "": LYPredSmooth
      }
    );
});


app.use((req, res, next) => {

  // -----------------------------------------------------------------------
  // Authentication middleware

  const auth = {login: process.env.CLUB_MEMBER_USER || "medlem", password: process.env.CLUB_MEMBER_PASSWORD || "lösen"}

  // Parse login and password from headers
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

  // Verify login and password are set and correct
  if (login && password && login === auth.login && password === auth.password) {
    // Access granted...
    return next()
  }

  // Access denied...
  res.set('WWW-Authenticate', 'Basic realm="401"') // change this
  res.status(401).send('Authentication required.') // custom message

  // -----------------------------------------------------------------------

})


app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

http.createServer(app)
    .listen(PORT, function () {
        console.log('Example app listening on port 8889! Go to http://localhost:'+PORT+'/')
    })
