import React from 'react'
import { LineChart, Line, Label, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ShadowPredictionGraph from '../shadowGraph/predictionGraph.jsx'

const Planes = function({
    planes,
    dataLY,
    dataTY,
    dataPrediction
  }){
    if(planes.length > 0){
        return planes.map(function(each){
        return(
                <ShadowPredictionGraph
                    header= {"Årligt Flygtidsuttag " + each}
                    xlabel="Datum"
                    ylabel="Ackumulerad flygtid över året"
                    shadowLegend={"Totalt flygtidsuttag " + (new Date().getFullYear()-1)}
                    mainLegend={"Totalt flygtidsuttag " + (new Date().getFullYear())}
                    mainColor= "rgb(44, 158, 245)"
                    shadowColor="rgb(50, 70, 90)"
                    dataLY={dataLY}
                    dataTY={dataTY}
                    dataPrediction={dataPrediction}
                    dataPredictionKey = {each}
                    xDataKey="date"
                    yShadowDataKey={"cumSumByPlane['" + each + "']"}
                    yMainDataKey={"cumSumByPlane['" + each + "']"}
                />
        )
        })
    } else {
        return []
    }}

  export default Planes