import React from 'react'
import './graph.css'
import { LineChart, Line, Label, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const ShadowGraph = function({
  header,
  xlabel,
  ylabel,
  shadowLegend,
  mainLegend,
  mainColor,
  shadowColor,
  dataLY,
  dataTY,
  xDataKey,
  yShadowDataKey,
  yMainDataKey
}){

  const yAxisTickFormatter = (value) => {
    return `${value} %`; // Add the desired suffix here
  };

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

  return(
    <div>
      <h2>{header}</h2>
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
            dataKey={xDataKey}
            tickCount={12}
            tickFormatter={(tick) => {
              let d = new Date(tick).toLocaleString('default', { month: 'short' })
              return d.charAt(0).toUpperCase() + d.slice(1)
              }}>
            
          
          </XAxis>
          <XAxis xAxisId="0" dataKey="date" tick={false} />

          <YAxis
            tickFormatter={(tick) => tick + " h"}>
            
          </YAxis>
          <Tooltip itemStyle="animation: 'none'" content={<CustomTooltip />} />
          <Legend layout="vertical" iconType="circle"  wrapperStyle={{top: 10, left: 90}}/>
          <Line name={shadowLegend} data={dataLY} xAxisId="0" type="monotone" dataKey={yShadowDataKey} stroke={shadowColor} dot={false} strokeWidth={3}/>
          <Line name={mainLegend} data={dataTY} xAxisId="1" type="monotone" dataKey={yMainDataKey} stroke={mainColor} dot={false} strokeWidth={3}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ShadowGraph
