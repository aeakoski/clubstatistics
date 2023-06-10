import React from 'react'
import './number.css'

const Number = function({
  number,
  description
}){
  return(
    <div className="numberStatistic col">
      <p className="numberStatisticNumber">{number}h</p>
      <p className="numberStatisticDescription">{description}</p>
    </div>
  )}

export default Number
