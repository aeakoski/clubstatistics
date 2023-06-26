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
    
    const dayOfYear = date => Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

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

          const lastYearData = dataLY.map((point) => [dayOfYear(new Date(point.date)), point.flightHoursAllCumSum]); // Convert data to array of [x, y] pairs
          const fittedCurve = math.polynomialFit(lastYearData, 3); // Use a polynomial of degree 3 for fitting
          const extrapolationRange = math.range(dayOfYear(new Date(dayOfYear(dataTY[dataTY.length-1]))), 366, 1).toArray();
          const _extrapolatedData = extrapolationRange.map((x) => [x, math.evaluate(fittedCurve, { x })]);
          _extrapolatedData.map((item) => dataTY[(new Date().setMonth(0, item[0])).toISOString().split('T')[0]].prediction = item[0]);

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
        <div className="col">
        <div>
          <h2>{"Årligt Flygtidsuttag: Alla klubbflygplan summerat"}</h2>
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
              <XAxis 
                xAxisId="1" 
                angle={-45} 
                textAnchor="end" 
                dataKey="date"
                tickCount={12}
                tickFormatter={(tick) => {
                  let d = new Date(tick).toLocaleString('default', { month: 'short' })
                  return d.charAt(0).toUpperCase() + d.slice(1)
                  }}>
              </XAxis>
              <XAxis xAxisId="0" dataKey="date" tick={false} />
              <XAxis xAxisId="2" dataKey="date" tick={false} />
              <YAxis
                tickFormatter={(tick) => tick + " h"}>
              </YAxis>
              <Tooltip itemStyle="animation: 'none'" />
              <Legend layout="vertical" iconType="circle"  wrapperStyle={{top: 10, left: 90}}/>
              <Line name={"Flygtimmar " + (new Date().getFullYear()-1)} data={dataLY} xAxisId="0" type="monotone" dataKey="flightHoursAllCumSum" stroke="rgb(50, 70, 90)" dot={false} strokeWidth={3}/>
              <Line name={"Flygtimmar " + (new Date().getFullYear())} data={dataTY} xAxisId="1" type="monotone" dataKey="flightHoursAllCumSum" stroke="rgb(44, 158, 245)" dot={false} strokeWidth={3}/>
              <Line name={"Prognos " + (new Date().getFullYear())} data={dataTY} xAxisId="2" type="monotone" dataKey="prediction" stroke="rgb(44, 158, 245)" dot={false} strokeWidth={1}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

          <ShadowGraph
            header= "Årligt Flygtidsuttag: Alla klubbflygplan summerat"
            xlabel="Datum"
            ylabel="Ackumulerade årliga motorflygtimmar"
            shadowLegend={"Flygtimmar " + (new Date().getFullYear()-1)}
            mainLegend={"Flygtimmar " + (new Date().getFullYear())}
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
      </div>
      <div className="row">
        <div className="col">
        <ShadowGraph
          header= "Årligt Flygtidsuttag Motorflyg"
          xlabel="Datum"
          ylabel="Ackumulerade årliga motorflygtimmar"
          shadowLegend={"Motorflygtimmar " + (new Date().getFullYear()-1)}
          mainLegend={"Motorflygtimmar " + (new Date().getFullYear())}
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
      </div>
      <div className="row">
        <div className="col">
        <ShadowGraph
          header="Årligt Flygtidsuttag Segelflyg"
          xlabel="Datum"
          ylabel="Ackumulerade årliga segelflygtimmar"
          shadowLegend={"Segelflygtimmar " + (new Date().getFullYear()-1)}
          mainLegend={"Segelflygtimmar " + (new Date().getFullYear())}
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
