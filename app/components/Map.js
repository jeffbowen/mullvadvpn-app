// @flow

import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import { ComposableMap, ZoomableGroup, Geographies, Geography, Markers, Marker } from 'react-simple-maps';

import countriesJSON from '../assets/geo/countries.geo.json';
import citiesJSON from '../assets/geo/cities.geo.json';

import type { Coordinate2d } from '../types';

function swapLatLon(latlon: Coordinate2d): Coordinate2d {
  return [latlon[1], latlon[0]];
}

export type MapProps = {
  location: Coordinate2d,
  zoom: number,
  markerImagePath: string,
};

export default class Map extends Component {
  props: MapProps

  state: {
    initial: {
      zoom: number,
      location: Coordinate2d
    }
  }

  constructor(props: MapProps) {
    super(props);
    this.state = {
      initial: {
        zoom: props.zoom,
        location: props.location
      }
    };
  }

  render() {
    const projectionConfig = {
      scale: 3000,
      // doesn't work properly for some reason
      // see: https://github.com/zcreativelabs/react-simple-maps/issues/23
      // yOffset: -150 / this.props.zoom
    };

    const mapStyle = {
      width: '100%',
      height: '100%',
      backgroundColor: '#191A1A'
    };

    const defaultGeographyStyle = {
      fill: '#192C44',
      stroke: '#191A1A',
      strokeWidth: '1px',
    };

    const geographyStyle = {
      default: defaultGeographyStyle,
      hover: defaultGeographyStyle,
      pressed: defaultGeographyStyle
    };

    const markerLocation = swapLatLon(this.props.location);
    const cameraLocation = swapLatLon(this.props.location);
    const initialLocation = swapLatLon(this.state.initial.location);
    const initialStyle = {
      zoom: this.state.initial.zoom,
      x: initialLocation[0],
      y: initialLocation[1]
    };

    const motionStyle = {
      zoom: spring(this.props.zoom, {stiffness: 210, damping: 20}),
      x: spring(cameraLocation[0], {stiffness: 210, damping: 20}),
      y: spring(cameraLocation[1], {stiffness: 210, damping: 20}),
    };

    const userMarker = (
      <Marker key={ 'pin-marker' } marker={{ coordinates: markerLocation }}>
        <image x="-30" y="-30" href={ this.props.markerImagePath } />
      </Marker>
    );

    const countryMarkers = countriesJSON.features.map((item, i) => (
      <Marker key={ `country-marker-${i}` } marker={{ coordinates: item.geometry.coordinates }}>
        <text fill="rgba(255,255,255,.4)" fontSize="22" textAnchor="middle">
          { item.properties.name }
        </text>
      </Marker>
    ));

    const cityMarkers = citiesJSON.features.map((item, i) => (
      <Marker key={ `city-marker-${i}` } marker={{ coordinates: item.geometry.coordinates }}>
        <circle r="2" fill="rgba(255,255,255,.8)" />
        <text x="0" y="-10" fill="rgba(255,255,255,.8)" fontSize="14" textAnchor="middle">
          { item.properties.NAME }
        </text>
      </Marker>
    ));

    return (
      <Motion defaultStyle={ initialStyle } style={ motionStyle }>
        {({zoom, x, y}) => (
          <ComposableMap width={ 800 } height={ 450 } style={ mapStyle } projectionConfig={ projectionConfig }>
            <ZoomableGroup center={ [x, y] } zoom={ zoom } disablePanning={ false }>
              <Geographies geographyUrl={ './assets/geo/geometry.json' }>
                {(geographies, projection) => geographies.map((geography, i) => (
                  <Geography
                    key={ `geography-${i}` }
                    geography={ geography }
                    projection={ projection }
                    style={ geographyStyle } />
                ))}
              </Geographies>
              <Markers>
                { countryMarkers.concat(cityMarkers, [userMarker]) }
              </Markers>
            </ZoomableGroup>
          </ComposableMap>
        )}
      </Motion>
    );
  }
}
