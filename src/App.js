//import logo from './logo.svg';
import React, { PureComponent } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
//import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


//library.add(faClock, faPlaneDeparture, faMapMarked, faRuler, faMedal, faPlane)

function App() {
  const [bootTime, setBootTime] = React.useState({})
  const [dataLY, setDataLY] = React.useState({})
  const [dataTY, setDataTY] = React.useState({})

  React.useEffect(()=>{
    fetchData();
    setInterval(()=>{
      var d = new Date();
      if (d.getHours() < 9 || 20 < d.getHours() ) {
        return // Dont update during the night, to save heroku application up-time qouta
      }
      fetchData();
    },1000*60*180) // Fetch every 180:th minute
  }, [])


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

  return (
    < >
      <div className="canvas">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis xAxisId="1" angle={-45} textAnchor="end" dataKey="date" />
            <XAxis xAxisId="0" dataKey="date" tick={false} />
            
            <YAxis />
            <Tooltip />
            <Legend wrapperStyle={{top: 0, left: 25}}/>
            <Line data={dataLY} xAxisId="0" type="monotone" dataKey="flightHoursAllCumSum" stroke="rgb(0, 50, 150)" dot={false} strokeWidth={3}/>
            <Line data={dataTY} xAxisId="1" type="monotone" dataKey="flightHoursAllCumSum" stroke="rgb(50, 150, 0)" dot={false} strokeWidth={3}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    < />
  );
}

export default App;


