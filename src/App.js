//import logo from './logo.svg';
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import ShadowGraph from './components/shadowGraph/graph.jsx'
import Number from './components/number/number.jsx'
import Planes from './components/planes/planes.jsx'
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
  const [motorPlanes, setMotorPlanes] = React.useState({})
  const [sailPlanes, setSailPlanes] = React.useState({})

  React.useEffect(()=>{
    setMotorPlanes([]);
    setSailPlanes([]);
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
          //console.log(res)
          setBootTime(res.bootTime)
          setDataLY(res.flightCumSum.filter(f => ('2021-12-31' < f.date && f.date < '2023-01-01')));
          setDataTY(res.flightCumSum.filter(f => ('2022-12-31' < f.date && f.date < '2024-01-01')));
          setMotorPlanes(res.motorPlanes);
          setSailPlanes(res.sailPlanes);
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
      console.log(error);
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
          <ShadowGraph
            header= "Årligt Flygtidsuttag Totalt"
            xlabel="Datum"
            ylabel="Ackumulerad flygtid över året"
            shadowLegend={"Totalt flygtidsuttag " + (new Date().getFullYear()-1)}
            mainLegend={"Totalt flygtidsuttag " + (new Date().getFullYear())}
            mainColor= "rgb(44, 158, 245)"
            shadowColor="rgb(50, 70, 90)"
            dataLY={dataLY}
            dataTY={dataTY}
            xDataKey="date"
            yShadowDataKey="flightHoursAllCumSum"
            yMainDataKey="flightHoursAllCumSum"
          />
          <div className="row">
          <Number number={parseInt(getTodaysData().flightHoursAllCumSum)} description="Totalt flygtidsuttag i år fram tills idag"/>
          <Number number={parseInt(getLastYearsData().flightHoursAllCumSum)} description="Totalt flygtidsuttag fg år fram tills motsvarande idag"/>
          <Number number={parseInt(getTodaysData().flightHoursAllCumSum) - parseInt(getLastYearsData().flightHoursAllCumSum)} description="Skillnad mot fg år"/>
          </div>
        </div>

        <div className="col col-xl-4">
        <ShadowGraph
          header= "Årligt Flygtidsuttag Motorflyg"
          xlabel="Datum"
          ylabel="Ackumulerad motorflygtid över året"
          shadowLegend={"Motorflygtidsuttag " + (new Date().getFullYear()-1)}
          mainLegend={"Motorflygtidsuttag " + (new Date().getFullYear())}
          mainColor= "#f1f52c"
          shadowColor="#4b4d0e"
          dataLY={dataLY}
          dataTY={dataTY}
          xDataKey="date"
          yShadowDataKey="flightHoursMotorCumSum"
          yMainDataKey="flightHoursMotorCumSum"
        />
          <div className="row">
          <Number number={parseInt(getTodaysData().flightHoursMotorCumSum)} description="Totalt flygtidsuttag i år fram tills idag"/>
          <Number number={parseInt(getLastYearsData().flightHoursMotorCumSum)} description="Totalt flygtidsuttag fg år fram tills motsvarande idag"/>
          <Number number={parseInt(getTodaysData().flightHoursMotorCumSum) - parseInt(getLastYearsData().flightHoursMotorCumSum)} description="Skillnad mot fg år"/>
          </div>
        </div>

        <div className="col col-xl-4">
        <ShadowGraph
          header="Årligt Flygtidsuttag Segelflyg"
          xlabel="Datum"
          ylabel="Ackumulerad segelflygtid över året"
          shadowLegend={"Segelflygtidsuttag " + (new Date().getFullYear()-1)}
          mainLegend={"Segelflygtidsuttag " + (new Date().getFullYear())}
          mainColor= "#22ba35"
          shadowColor="#0e4d16"
          dataLY={dataLY}
          dataTY={dataTY}
          xDataKey="date"
          yShadowDataKey="flightHoursGliderCumSum"
          yMainDataKey="flightHoursGliderCumSum"
        />
          <div className="row">
          <Number number={parseInt(getTodaysData().flightHoursGliderCumSum)} description="Totalt flygtidsuttag i år fram tills idag"/>
          <Number number={parseInt(getLastYearsData().flightHoursGliderCumSum)} description="Totalt flygtidsuttag fg år fram tills motsvarande idag"/>
          <Number number={parseInt(getTodaysData().flightHoursGliderCumSum) - parseInt(getLastYearsData().flightHoursGliderCumSum)} description="Skillnad mot fg år"/>
          </div>
        </div>
      </div>
      <div className="row">
        <h2>Flygtid per motorflygplan</h2>
      </div>
      <Planes
        planes={motorPlanes}
        dataLY={dataLY}
        dataTY={dataTY}
      />
      <div className="row">
        <h2>Flygtid per segelflygplan</h2>
      </div>
      <Planes
        planes={sailPlanes}
        dataLY={dataLY}
        dataTY={dataTY}
      />
    </div>
    
    < />
  );
}

export default App;
