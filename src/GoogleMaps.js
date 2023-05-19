import React, { useState } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow
} from '@react-google-maps/api'
import axios from 'axios'
import Button from '@mui/material/Button'
import './GoogleMaps.css'

/**
 * Style for the Google Maps API component.
 */
const containerStyle = {
  width: '100%',
  height: '100vh'
}

function MapComponent () {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCuqNmuK8YHJn06WZwIkzZd2J8_XTJxpxM'
  })

  const [position, setPosition] = useState({ lat: 0, lng: 0 })
  const mapRef = React.useRef(null)
  const [waypoints, setWayPoints] = React.useState([])
  const [foundWaypoints, setfoundWaypoints] = React.useState([])
  const [currPositionClicked, setCurrPositionClicked] = React.useState(false)
  const [activeMarkerHash, setActiveMarkerHash] = React.useState(null)

  navigator.geolocation.getCurrentPosition(position => {
    setPosition({
      lat: parseFloat(position.coords.latitude),
      lng: parseFloat(position.coords.longitude)
    })
  })

  /**
   * Makes an API call to get 15 waypoints within the bounding box of the map.
   */
  async function getWaypoints (bounds) {
    let boundaries = {
      northEastLat: bounds.getNorthEast().lat(),
      northEastLng: bounds.getNorthEast().lng(),
      southWestLat: bounds.getSouthWest().lat(),
      southWestLng: bounds.getSouthWest().lng()
    }

    await axios
      .get(
        `http://localhost:5000/geocacheWaypoints/${boundaries.northEastLat}
        /${boundaries.northEastLng}/${boundaries.southWestLat}/${boundaries.southWestLng}`
      )
      .then(response => {
        console.log('SUCCESS', response)
        setWayPoints(response.data.message)
      })
      .catch(error => {
        console.log(error)
      })
  }

  /**
   * Makes an API call to get the waypoints that have already been found by the user.
   */
  async function getFoundWaypoints () {
    await axios
      .get('http://localhost:5000/geocacheFoundWaypoints')
      .then(response => {
        console.log('SUCCESS', response)
        setfoundWaypoints(response.data.message)
      })
      .catch(error => {
        console.log(error)
      })
  }

  /**
   * Callback function to be called when new tiles/areas on the map has been loaded. Gets the
   * visible waypoints on the map and waypoints that have already been found by the user.
   */
  const onTilesLoaded = React.useCallback(async function callback () {
    const bounds = mapRef.current.getBounds()
    await getWaypoints(bounds)
    await getFoundWaypoints()
  }, [])

  /**
   * Callback function to be called when the map is loaded at the beginning. Gets the visible
   * waypoints on the map and waypoints that have already been found by the user. Creates a
   * new map component and sets it as a reference.
   */
  const onLoad = React.useCallback(
    async function callback (map) {
      const bounds = new window.google.maps.LatLngBounds(position)
      await getWaypoints(bounds)
      await getFoundWaypoints()

      map.fitBounds(bounds)
      mapRef.current = map
      map.center = position
    },
    [position]
  )

  /**
   * Callback function to be called when map is unmounted. Sets the hooks to the relevant null
   * or empty state, including the map reference.
   */
  const onUnmount = React.useCallback(function callback () {
    mapRef.current = null
    setWayPoints([])
    setCurrPositionClicked(false)
    setActiveMarkerHash(null)
  }, [])

  /**
   * Callback function to be called when the user found the geocache. Makes an API call to
   * the backend to record the found cache waypoint. Makes an API call to gather the updated
   * found waypoints by the user.
   */
  const onCacheFoundButtonClick = React.useCallback(async function callback (
    waypoint
  ) {
    // Replace '/' as '@@' since '/' cannot be used in a REST api.
    let waypointName = waypoint.name.replace('/', '@@')
    await axios
      .post(
        `http://localhost:5000/geocacheFound/${waypoint.lat}/${waypoint.lng}/'${waypointName}'/${waypoint.hash}`
      )
      .then(response => {
        console.log('SUCCESSPOST', response)
      })
      .catch(error => {
        console.log(error)
      })
    await getFoundWaypoints()
  },
  [])

  /**
   * Determines if the given hash for a waypoint exists in the waypoints that have been found
   * by the user.
   */
  function isFoundMarker (hash) {
    let foundCacheHash = []
    foundWaypoints.map(waypoint => foundCacheHash.push(waypoint.hash))
    return foundCacheHash.includes(hash)
  }

  /**
   * Clickable icon for the user's current position.
   */
  const currPositionIcon = {
    path:
      'M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 ' +
      '4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 ' +
      '0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 ' +
      '2.039-4.945t4.945-2.039z',
    fillColor: 'green',
    fillOpacity: 1,
    strokeWeight: 0,
    rotation: 0,
    scale: 2
  }

  /**
   * Clickable icon for waypoints that have been found by the user.
   */
  let foundWaypointIcon = {
    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    fillColor: 'red',
    fillOpacity: 1,
    strokeWeight: 0,
    rotation: 0,
    scale: 1.8
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      zoom={4}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onTilesLoaded={onTilesLoaded}
    >
      {waypoints.map(waypoint => {
        return (
          <Marker
            key={waypoint.hash}
            position={{ lat: waypoint.lat, lng: waypoint.lng }}
            clickable={true}
            onClick={() => setActiveMarkerHash(waypoint.hash)}
            icon={isFoundMarker(waypoint.hash) ? foundWaypointIcon : null}
          >
            {activeMarkerHash && activeMarkerHash === waypoint.hash ? (
              <InfoWindow onCloseClick={() => setActiveMarkerHash(null)}>
                <div id='markerInfo'>
                  <div id='markerName'>{waypoint.name}</div>
                  <div>Latitude: {waypoint.lat}</div>
                  <div>Longitude: {waypoint.lng}</div>
                  <Button
                    id='markerButton'
                    variant='outlined'
                    onClick={() => onCacheFoundButtonClick(waypoint)}
                    disabled={isFoundMarker(waypoint.hash)}
                  >
                    Cache found!
                  </Button>
                </div>
              </InfoWindow>
            ) : null}
          </Marker>
        )
      })}
      {
        <Marker
          key='current_location'
          position={position}
          clickable={true}
          icon={currPositionIcon}
          onClick={() => setCurrPositionClicked(true)}
        >
          {currPositionClicked && (
            <InfoWindow onCloseClick={() => setCurrPositionClicked(false)}>
              <div id='markerInfo'>
                <span>Current Location!</span>
                <div>Latitude: {position.lat}</div>
                <div>Longitude: {position.lng}</div>
              </div>
            </InfoWindow>
          )}
        </Marker>
      }
    </GoogleMap>
  ) : (
    <></>
  )
}

export default React.memo(MapComponent)
