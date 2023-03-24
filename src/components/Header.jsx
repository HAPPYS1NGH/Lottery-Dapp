import React from 'react'

function Header(props) {
  return (
    <div className='header'>
        <div className='header-box'>
            <h3>
              Lottery 
            </h3>
            <p className='btn'>Account {props.account ? props.account.slice(0,4) + "...."+props.account.slice(-3) : "Not Connected"}</p>
        </div>
    </div>
  )
}

export default Header