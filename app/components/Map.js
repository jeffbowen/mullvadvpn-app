// @flow

import React, { Component } from 'react';
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

    const userMarker = (
      <Marker key={ 'pin-marker' } marker={{ coordinates: markerLocation }}>
        <image x="-30" y="-30" href={ this.props.markerImagePath } />
      </Marker>
    );

    const IS_MARKER_IN_VISIBLE_BOUNDARIES = () => {
      return false;
    };

    const CountryMarker = ({ item, projection, ...otherProps }) => {
      const translation = projection()(item.geometry.coordinates);

      return !IS_MARKER_IN_VISIBLE_BOUNDARIES(translation) ? null : (
        <Marker marker={{ coordinates: item.geometry.coordinates }}
          projection={ projection }
          { ...otherProps }>
          <text fill="rgba(255,255,255,.4)" fontSize="22" textAnchor="middle">
            { item.properties.name }
          </text>
        </Marker>
      );
    };

    const countryMarkers = countriesJSON.features.map(item => (
      <CountryMarker key={ `a${item.id}` } item={ item } />
    ));

    const cityMarkers = [] || citiesJSON.features.map((item) => (
      <Marker key={ `b${item.id}` } marker={{ coordinates: item.geometry.coordinates }}>
        <circle r="2" fill="rgba(255,255,255,.8)" />
        <text x="0" y="-10" fill="rgba(255,255,255,.8)" fontSize="14" textAnchor="middle">
          { item.properties.name }
        </text>
      </Marker>
    ));

    return (
      <ComposableMap width={ 800 } height={ 450 } style={ mapStyle } projectionConfig={ projectionConfig }>
        <ZoomableGroup center={ cameraLocation } zoom={ this.props.zoom } disablePanning={ false }>
          <Geographies geography={ './assets/geo/geometry.json' }>
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
    );
  }
}
