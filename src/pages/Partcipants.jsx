import React from 'react'

function Partcipants(props) {
                  const pa =props.participants.filter((participant)=>{
                    return (participant.time > 	1679739339 )
                  }
                  )
    const participantObj = pa.map((p =>{
        return(
            <div className='participant' key={p.time}>
                <p className='participant-address'>{p.participant}</p>
                <p className='participant-date'>{(new Date(p.time * 1000).toLocaleString())}</p>
            </div>
        )
    }))
    
    console.log(props.participants)
  return (
    <div>
        <h2>Current Participants</h2>
        {participantObj}
    </div>
  )
}

export default Partcipants