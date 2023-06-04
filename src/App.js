//import logo from './logo.svg';
import React, { PureComponent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import ReactDOM from 'react-dom'
/*
import { library } from '@fortawesome/fontawesome-svg-core'
import {faClock } from '@fortawesome/free-solid-svg-icons'
import {faPlaneDeparture } from '@fortawesome/free-solid-svg-icons'
import {faMapMarked } from '@fortawesome/free-solid-svg-icons'
import {faRuler } from '@fortawesome/free-solid-svg-icons'
import {faMedal } from '@fortawesome/free-solid-svg-icons'
import {faPlane } from '@fortawesome/free-solid-svg-icons'
*/
import { LineChart, Line, Label, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

//library.add(faClock, faPlaneDeparture, faMapMarked, faRuler, faMedal, faPlane)

function App() {
  const [bootTime, setBootTime] = React.useState({})
  const [dataLY, setDataLY] = React.useState({})
  const [dataTY, setDataTY] = React.useState({})

  React.useEffect(()=>{
    const fetchData = () => {
      let baseUrl = ""
  
      // Figure out if in dev or prod and set base url to api accordingly
      if (window.location.href.includes("localhost:3000")) {
        baseUrl = "http://localhost:8889/"
      }
  
      console.log("Fetching");
      fetch(baseUrl + "stats").then(x=>x.json()).then(
        (res)=>{
          console.log("Fetching finished")
  
          if (bootTime && res.bootTime) {
            if (bootTime < res.bootTime){
              console.log("Reloading!");
              window.location.reload();
            }
          }
          console.log(res)
          setBootTime(res.bootTime)
          setDataLY(res.flightCumSum.filter(f => ('2021-12-31' < f.date && f.date < '2023-01-01')));
          setDataTY(res.flightCumSum.filter(f => ('2022-12-31' < f.date && f.date < '2024-01-01')));
  
        }
      )
      .catch(console.error)
    }

    fetchData();
    setInterval(()=>{
      var d = new Date();
      if (d.getHours() < 9 || 20 < d.getHours() ) {
        return // Dont update during the night, to save heroku application up-time qouta
      }
      fetchData();
    },1000*60*180) // Fetch every 180:th minute
  }, [])

  const getTodaysData = () => {
    let d = new Date();
    let flightDay = {};
    try{
      flightDay = dataTY.find(o => o.date === d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0'));
    } catch (error){
      flightDay = {
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
    
    return flightDay;
  }

  const getLastYearsData = () => {
    let d = new Date();
    d.setFullYear( d.getFullYear() - 1 );
    let flightDay  = {};
    try{
      flightDay = dataLY.find(o => o.date === d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0'));
    } catch (error) {
      flightDay = {
        "date": d.getFullYear()-1 + "-" + String(d.getMonth()+1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0'),
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
    
    
    return flightDay;
  }

  

  return (
    < >
    <div className="mainContainer container-fluid">
      <div className="row">
        <div className="col col-xl-4">
          <h2>Årligt Flygtidsuttag Totalt</h2>
          <ResponsiveContainer width={"100%"} height={500} min-width={300}>
            <LineChart
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" fill="#151515"/>
              <XAxis xAxisId="1" angle={-45} textAnchor="end" dataKey="date" >
              <Label
                  value="Datum"
                  position="bottom"
                />
              </XAxis>
              <XAxis xAxisId="0" dataKey="date" tick={false} />
              
              <YAxis>
                <Label
                  value="Alla flygtimmar"
                  angle={-90}
                  position="left"
                  
                />
              </YAxis> 
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{top: 10, left: 60}}/>
              <Line name={"Totalt flygtidsuttag " + (new Date().getFullYear()-1)} data={dataLY} xAxisId="0" type="monotone" dataKey="flightHoursAllCumSum" stroke="rgb(50, 70, 90)" dot={false} strokeWidth={3}/>
              <Line name={"Totalt flygtidsuttag " + (new Date().getFullYear())} data={dataTY} xAxisId="1" type="monotone" dataKey="flightHoursAllCumSum" stroke="rgb(44, 158, 245)" dot={false} strokeWidth={3}/>
            </LineChart>
          </ResponsiveContainer>
          <div className="row">
            <div className="col numberStatistic">
              <p className="numberStatisticNumber">{parseInt(getTodaysData().flightHoursAllCumSum)}h</p>
              <p className="numberStatisticDescription">Totalt flygtidsuttag i år</p>
            </div>
            <div className="col numberStatistic">
              <p className="numberStatisticNumber">{parseInt(getLastYearsData().flightHoursAllCumSum)}h</p>
              <p className="numberStatisticDescription">Totalt flygtidsuttag idag fg år</p>
            </div>
            <div className="col numberStatistic">
              <p className="numberStatisticNumber">&#916; {parseInt(getTodaysData().flightHoursAllCumSum) - parseInt(getLastYearsData().flightHoursAllCumSum)}h</p>
              <p className="numberStatisticDescription">Skillnad mot fg år</p>
            </div>
          </div>
        </div>

        <div className="col col-xl-4">
          <h2>Årligt Flygtidsuttag Motorflyg</h2>
          <ResponsiveContainer width={"100%"} height={500} min-width={300}>
            <LineChart
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" fill="#151515" />
              <XAxis xAxisId="1" angle={-45} textAnchor="end" dataKey="date" >
              <Label
                  value="Datum"
                  position="bottom"
                />
              </XAxis>
              <XAxis xAxisId="0" dataKey="date" tick={false} />
              
              <YAxis>
                <Label
                  value="Motorflygtimmar"
                  angle={-90}
                  position="left"
                />
              </YAxis> 
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{top: 10, left: 60}}/>
              <Line name={"Motorflygtidsuttag " + (new Date().getFullYear()-1)} data={dataLY} xAxisId="0" type="monotone" dataKey="flightHoursMotorCumSum" stroke="#4b4d0e" dot={false} strokeWidth={3}/>
              <Line name={"Motorflygtidsuttag " + (new Date().getFullYear())} data={dataTY} xAxisId="1" type="monotone" dataKey="flightHoursMotorCumSum" stroke="#f1f52c" dot={false} strokeWidth={3}/>
            </LineChart>
          </ResponsiveContainer>
          <div className="row">
            <div className="col numberStatistic">
              <p className="numberStatisticNumber">{parseInt(getTodaysData().flightHoursMotorCumSum)}h</p>
              <p className="numberStatisticDescription">Totalt flygtidsuttag i år</p>
            </div>
            <div className="col numberStatistic">
              <p className="numberStatisticNumber">{parseInt(getLastYearsData().flightHoursMotorCumSum)}h</p>
              <p className="numberStatisticDescription">Totalt flygtidsuttag idag fg år</p>
            </div>
            <div className="col numberStatistic">
              <p className="numberStatisticNumber">&#916; {parseInt(getTodaysData().flightHoursMotorCumSum) - parseInt(getLastYearsData().flightHoursMotorCumSum)}h</p>
              <p className="numberStatisticDescription">Skillnad mot fg år</p>
            </div>
          </div>
        </div>

        <div className="col col-xl-4">
          <h2>Årligt Flygtidsuttag Segelflyg</h2>
          <ResponsiveContainer width={"100%"} height={500} min-width={300}>
          <LineChart
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" fill="#151515" />
            <XAxis xAxisId="1" angle={-45} textAnchor="end" dataKey="date" >
            <Label
                value="Datum"
                position="bottom"
              />
            </XAxis>
            <XAxis xAxisId="0" dataKey="date" tick={false} />
            
            <YAxis>
              <Label
                value="Segelflygtimmar"
                angle={-90}
                position="left"
              />
            </YAxis> 
            <Tooltip />
            <Legend iconType="circle" wrapperStyle={{top: 10, left: 60}}/>
            <Line name={"Segelflygtidsuttag " + (new Date().getFullYear()-1)} data={dataLY} xAxisId="0" type="monotone" dataKey="flightHoursGliderCumSum" stroke="#0e4d16" dot={false} strokeWidth={3}/>
            <Line name={"Segelflygtidsuttag " + (new Date().getFullYear())} data={dataTY} xAxisId="1" type="monotone" dataKey="flightHoursGliderCumSum" stroke="#22ba35" dot={false} strokeWidth={3}/>
          </LineChart>
          </ResponsiveContainer>
          <div className="row">
          <div className="col numberStatistic">
            <p className="numberStatisticNumber">{parseInt(getTodaysData().flightHoursGliderCumSum)}h</p>
            <p className="numberStatisticDescription">Totalt flygtidsuttag i år</p>
          </div>
          <div className="col numberStatistic">
            <p className="numberStatisticNumber">{parseInt(getLastYearsData().flightHoursGliderCumSum)}h</p>
            <p className="numberStatisticDescription">Totalt flygtidsuttag idag fg år</p>
          </div>
          <div className="col numberStatistic">
            <p className="numberStatisticNumber">&#916; {parseInt(getTodaysData().flightHoursGliderCumSum) - parseInt(getLastYearsData().flightHoursGliderCumSum)}h</p>
            <p className="numberStatisticDescription">Skillnad mot fg år</p>
          </div>
          </div>
        </div>
      </div>
    </div>
    < />
  );
}

export default App;


