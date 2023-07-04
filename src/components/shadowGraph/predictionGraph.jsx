import React from 'react'
import './graph.css'
import { LineChart, Line, Label, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Number from '../number/number.jsx'


const ShadowPredictionGraph = function({
  header,
  shadowLegend,
  mainLegend,
  mainColor,
  shadowColor,
  dataLY,
  dataTY,
  dataPrediction,
  xDataKey,
  yShadowDataKey,
  yMainDataKey,
  dataPredictionKey
}){
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length == 1) {
      return (
          <div className="custom-tooltip">
            <p>{payload[0].payload.date} - {Math.round(payload[0].value)} timmar</p>
          </div>
        );
    } else if (active && payload && payload.length == 2) {
      return (
          <div className="custom-tooltip">
            <p>{payload[0].payload.date} - {Math.round(payload[0].value)} timmar</p>
            <p>{payload[1].payload.date} - {Math.round(payload[1].value)} timmar</p>
          </div>
        );
    } else {
      return([])
    }
  }

  const getTodaysData = () => {
    let d = new Date();
    let flightDay = {};
    try{
      flightDay = dataTY.find(o => o.date === d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0'));
    } catch (error){
      //console.log(error);
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

  return(
    <div>
      <div className="chart">
      <h2>{header}</h2>
      
      <ResponsiveContainer width={"100%"} height={450} min-width={300}>
        <LineChart
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: -80,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" fill="#151515"/>
          <XAxis 
            xAxisId="1" 
            angle={-45} 
            textAnchor="end" 
            dataKey={xDataKey}
            tickCount={12}
            tickFormatter={(tick) => {
              let d = new Date(tick).toLocaleString('default', { month: 'short' })
              return d.charAt(0).toUpperCase() + d.slice(1)
              }}>
          </XAxis>
          <XAxis xAxisId="0" dataKey="date" tick={false} />
          <XAxis xAxisId="2" dataKey="date" tick={false} axisLine={false} />
          <YAxis
            tickFormatter={(tick) => tick + " h"}>
          </YAxis>
          <Tooltip itemStyle="animation: 'none'" content={<CustomTooltip />} />
          <Legend layout="vertical" iconType="circle"  wrapperStyle={{top: 10, left: 90}}/>
          <Line 
            name={shadowLegend} 
            data={dataLY} 
            xAxisId="0" 
            type="monotone" 
            dataKey={yShadowDataKey} 
            stroke={shadowColor} 
            dot={false} 
            strokeWidth={3}
            isAnimationActive={false}
            />
          <Line 
            name={mainLegend} 
            data={dataTY} 
            xAxisId="1" 
            type="monotone" 
            dataKey={yMainDataKey} 
            stroke={mainColor} 
            dot={false} 
            strokeWidth={3}
            isAnimationActive={false}
            />
          <Line 
            name={"Prognos " + (new Date().getFullYear())} 
            data={dataPrediction} 
            xAxisId="2" 
            type="monotone" 
            dataKey={dataPredictionKey} 
            stroke={mainColor} 
            dot={false} 
            strokeWidth={1} 
            strokeDasharray="2 10"
            isAnimationActive={false}
            />
        </LineChart>
      </ResponsiveContainer>
      <div className="row">
        <Number number={parseInt(getTodaysData()[yMainDataKey]) || "--"} description="Totalt flygtidsuttag i år fram tills idag"/>
        <Number number={parseInt(getLastYearsData()[yMainDataKey]) || "--"} description="Totalt flygtidsuttag fg år fram tills motsvarande idag"/>
        <Number number={parseInt(getTodaysData()[yMainDataKey]) - parseInt(getLastYearsData()[yMainDataKey])  || "--"} description="Skillnad mot fg år"/>
      </div>
      </div>
      <hr></hr>
    </div>
  )
}

export default ShadowPredictionGraph
