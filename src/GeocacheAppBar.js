import * as React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import AppBar from '@mui/material/AppBar'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import './GeocacheAppBar.css'

/**
 * The app bar for the geocache webpage with information on what geocaching is, and which
 * waypoints have already been found by the user.
 */
export default function GeocacheAppBar () {
  const [expanded, setExpanded] = React.useState(false)
  const [geocacheInfoOpened, setGeocacheInfoOpened] = React.useState(false)
  const [currPosition, setCurrPosition] = useState({ lat: 0, lng: 0 })
  const [foundWaypoints, setfoundWaypoints] = React.useState([])

  navigator.geolocation.getCurrentPosition(position => {
    setCurrPosition({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    })
  })

  /**
   * Sets the current expanded accordian panel.
   */
  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  /**
   * Makes an API call to get the found waypoints from the backend.
   */
  async function getFoundWaypoints () {
    await axios
      .get('http://localhost:5000/geocacheFoundWaypoints')
      .then(response => {
        console.log('SUCCESSGETHERE', response.data.message)
        setfoundWaypoints(response.data.message)
      })
      .catch(error => {
        console.log(error)
      })
  }

  /**
   * Whenever the expanded and/or the currPosition value is changed, get the found waypoints
   * from the backend.
   */
  useEffect(() => {
    if (expanded) {
      getFoundWaypoints()
    }
  }, [expanded, currPosition])

  /**
   * Returns a dropdown element as an accordian with information on what geocaching is, and
   * which waypoints have already been found by the user.
   */
  function geocacheInfo () {
    return (
      <div>
        <Accordion
          expanded={expanded === 'panel1'}
          onChange={handleChange('panel1')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel1bh-content'
            id='panel1bh-header'
          >
            <Typography id='accordionText'>What is Geocaching?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Geocaching is an outdoor activity where you (the participant) use
              a GPS feature to locate "caches", which are usually weather
              resistant containers with various objects hidden inside. You can
              locate yourself on the map as the green checker marker on the map.
              The caches are indicated as red markers on the map. Click on the
              cache to find the name and the location of the cache. You can view
              your current live location on the top of the page, with the
              longitude and latitude values. Try browsing around the map!
            </Typography>
            <br />
            <Typography>
              Upon finding a cache, you may click on the marker on the map and
              click "Found!" to record the cache. You can then open the drop
              down below ("Personal Cache Record").
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'panel2'}
          onChange={handleChange('panel2')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel4bh-content'
            id='panel4bh-header'
          >
            <Typography id='accordionText'>Personal Cache Record</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper id='foundWaypointsPaper'>
              <List>
                {foundWaypoints.map(waypoint => (
                  <ListItem>
                    <ListItemText
                      primary={`Cache: ${waypoint.name}  Latitude: ${waypoint.lat}  
                      Longitude: ${waypoint.lng}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </AccordionDetails>
        </Accordion>
      </div>
    )
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar id='appBar' position='fixed' color='primary'>
        <Toolbar>
          <h1 id='title'>Geocacher</h1>
          <div id='currentLocation'>
            <h3 id='locationText'>Current Location</h3>
            <h3 id='locationText'>
              Latitude: {currPosition.lat !== 0 ? currPosition.lat : null}
            </h3>
            <h3 id='locationText'>
              Longitude: {currPosition.lng !== 0 ? currPosition.lng : null}
            </h3>
          </div>
          <Box id='box' />
          <IconButton
            color='inherit'
            onClick={() => setGeocacheInfoOpened(!geocacheInfoOpened)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
        {geocacheInfoOpened ? geocacheInfo() : null}
      </AppBar>
    </React.Fragment>
  )
}
