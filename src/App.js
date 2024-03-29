//import logo from './logo.svg';
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import ShadowGraph from './components/shadowGraph/graph.jsx'
import ShadowPredictionGraph from './components/shadowGraph/predictionGraph.jsx'
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
  const [dataHistoric, setDataHistoric] = React.useState([])
  const [dataTYPrediction, setDataTYPrediction] = React.useState({})
  const [motorPlanes, setMotorPlanes] = React.useState({})
  const [towPlanes, setTowPlanes] = React.useState({})
  const [sailPlanes, setSailPlanes] = React.useState({})
  const today = new Date();
  const yyyy = today.getFullYear();

  React.useEffect(()=>{
    setMotorPlanes([]);
    setTowPlanes([]);
    setSailPlanes([]);
    setDataTYPrediction([])

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

          setMotorPlanes(res.motorPlanes);
          setTowPlanes(res.towPlanes);
          setSailPlanes(res.sailPlanes);
          
          setDataHistoric(res.flightCumSum);
          setDataTYPrediction(res.prediction);
          
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

  return (
    < >
    <div className="mainContainer container-fluid">
      <div className="row mainDescription">
        <h1>Statestik för olika klubbsegment i Östra Sörmlands Flygklubb</h1>
        <p>Se ackumulerad flygtid för olika klubbsegment. Utöver historisk data visar den även en prognos på kommande flygtidsuttag om föregående års trender följs.</p>
        <p>Syftet är att kunna se om något segment hamnar efter som möjliggör proaktiva beslut istället för att vid årets slut få överraskningar.</p>
        <p>Det går även att använda prognosen som en fingervisning till när flygplans nästa periodiska service kan väntas behöva göras.</p>
      </div>
      <div className="row">
        <div className="col">
          <ShadowPredictionGraph
            header= "Årligt Flygtidsuttag: Alla klubbflygplan summerat"
            xlabel="Datum"
            ylabel="Ackumulerade årliga motorflygtimmar"
            mainLegend={"Flygtimmar"}
            mainColor= "rgb(44, 158, 245)"
            shadowColor="rgb(50, 70, 90)"
            dataHistoric={dataHistoric}
            dataPrediction={dataTYPrediction}
            dataPredictionKey = "predictionFlightHoursAllCumSum"
            xDataKey="date"
            yShadowDataKey="flightHoursAllCumSum"
            yMainDataKey="flightHoursAllCumSum"
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
        <ShadowPredictionGraph
            header= "Årligt Flygtidsuttag Motorflyg"
            xlabel="Datum"
            ylabel="Ackumulerade årliga motorflygtimmar"
            mainLegend={"Motortimmar"}
            mainColor= "#f1f52c"
            shadowColor="#4b4d0e"
            dataHistoric={dataHistoric}
            dataPrediction={dataTYPrediction}
            dataPredictionKey = "predictionFlightHoursMotorCumSum"
            xDataKey="date"
            yShadowDataKey="flightHoursMotorCumSum"
            yMainDataKey="flightHoursMotorCumSum"
          />        
        </div>
      </div>
      <div className="row">
        <div className="col">
        <ShadowPredictionGraph
            header="Årligt Flygtidsuttag Segelflyg"
            xlabel="Datum"
            ylabel="Ackumulerade årliga segelflygtimmar"
            mainLegend={"Segelflygtimmar"}
            mainColor= "#22ba35"
            shadowColor="#0e4d16"
            dataHistoric={dataHistoric}
            dataPrediction={dataTYPrediction}
            dataPredictionKey = "predictionFlightHoursGliderCumSum"
            xDataKey="date"
            yShadowDataKey="flightHoursGliderCumSum"
            yMainDataKey="flightHoursGliderCumSum"
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
        <ShadowPredictionGraph
            header="Årligt Flygtidsuttag Bogsering"
            xlabel="Datum"
            ylabel="Ackumulerade årliga bogsertimmar"
            mainLegend={"Bogsertimmar"}
            mainColor= "#a83297"
            shadowColor="#591a50"
            dataHistoric={dataHistoric}
            dataPrediction={dataTYPrediction}
            dataPredictionKey = "predictionFlightHoursTowCumSum"
            xDataKey="date"
            yShadowDataKey="flightHoursTowCumSum"
            yMainDataKey="flightHoursTowCumSum"
          />
        </div>
      </div>
      <div className="row">
        <h2>Flygtid per motorflygplan</h2>
      </div>
      <div className="col">
        <Planes
          planes={motorPlanes}
          dataHistoric={dataHistoric}
          dataPrediction={dataTYPrediction}
        />
      </div>
      
      <div className="row">
        <h2>Flygtid per segelflygplan</h2>
      </div>
      <div className="col">
        <Planes
          planes={sailPlanes}
          dataHistoric={dataHistoric}
          dataPrediction={dataTYPrediction}
        />
      </div>
      <div className="row">
        <h2>Flygtid per bogserflygplan</h2>
      </div>
      <div className="col">
        <Planes
          planes={towPlanes}
          dataHistoric={dataHistoric}
          dataPrediction={dataTYPrediction}
        />
      </div>
    </div>
    
    < />
  );
}

export default App;
