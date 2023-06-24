import React from 'react'
import { LineChart, Line, Label, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import ShadowGraph from '../shadowGraph/graph.jsx'
const Planes = function({
    planes,
    dataLY,
    dataTY
  }){
    if(planes.length > 0){
        return planes.map(function(each){
        return(
            <div className="row">
            <div className="col col-xl-4">
                <ShadowGraph
                header= {"Årligt Flygtidsuttag " + each}
                xlabel="Datum"
                ylabel="Ackumulerad flygtid över året"
                shadowLegend={"Totalt flygtidsuttag " + (new Date().getFullYear()-1)}
                mainLegend={"Totalt flygtidsuttag " + (new Date().getFullYear())}
                mainColor= "rgb(44, 158, 245)"
                shadowColor="rgb(50, 70, 90)"
                dataLY={dataLY}
                dataTY={dataTY}
                xDataKey="date"
                yShadowDataKey={"cumSumByPlane['" + each + "']"}
                yMainDataKey={"cumSumByPlane['" + each + "']"}
                />
            </div>
        </div>
        )
        })
    } else {
        return []
    }}

  export default Planes