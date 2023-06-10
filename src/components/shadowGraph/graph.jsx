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
          <XAxis xAxisId="1" angle={-45} textAnchor="end" dataKey={xDataKey} >
          <Label
              value={xlabel}
              position="bottom"
            />
          </XAxis>
          <XAxis xAxisId="0" dataKey="date" tick={false} />

          <YAxis>
            <Label
              value={ylabel}
              angle={-90}
              position="left"

            />
          </YAxis>
          <Tooltip />
          <Legend iconType="circle" wrapperStyle={{top: 10, left: 60}}/>
          <Line name={shadowLegend} data={dataLY} xAxisId="0" type="monotone" dataKey={yShadowDataKey} stroke={shadowColor} dot={false} strokeWidth={3}/>
          <Line name={mainLegend} data={dataTY} xAxisId="1" type="monotone" dataKey={yMainDataKey} stroke={mainColor} dot={false} strokeWidth={3}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ShadowGraph
