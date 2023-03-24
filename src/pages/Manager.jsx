import React from 'react'

function Manager(props) {
  return (
    <div>
        <h1>Hello Manager</h1>
        <button className='catal' onClick={props.newLottery}>New Lottery</button>
        <button className='catal' onClick={props.declareWinner}>Declare Winner</button>
        {props.error && <h1>Error: {props.error}</h1>}
    </div>
  )
}

export default Manager