import './App.css'
import React from 'react'
import Map from './GoogleMaps'
import GeocacheAppBar from './GeocacheAppBar'

function App () {
  return (
    <div>
      <GeocacheAppBar />
      <Map />
    </div>
  )
}

export default App
