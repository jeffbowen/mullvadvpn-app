// @flow

import React, { Component } from 'react';
import { ComposableMap, ZoomableGroup, Geographies, Geography, Markers, Marker } from 'react-simple-maps';

import { geoTimes } from 'd3-geo-projection';

import countriesJSON from '../assets/geo/countries.geo.json';
import citiesJSON from '../assets/geo/cities.geo.json';

import type { Coordinate2d } from '../types';

export type MapProps = {
  center: Coordinate2d, // longitude, latitude
  zoomIn: boolean,
  markerImagePath: string,
};

export default class Map extends Component {
  props: MapProps;

  state = {
    bounds: {
      width: 320,
      height: 494
    }
  };

  render() {
    const projectionConfig = {
      scale: 3000,
      // doesn't work properly for some reason
      // see: https://github.com/zcreativelabs/react-simple-maps/issues/23
      // yOffset: -150 / this.props.zoom
    };

    const { bounds } = this.state;
    const projection = this.getProjection(bounds.width, bounds.height, projectionConfig);

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

    const zoom = this.props.zoomIn ? 2 : 1;
    const userMarker = (
      <Marker key={ 'pin-marker' } marker={{ coordinates: this.props.center }}>
        <image x="-30" y="-30" href={ this.props.markerImagePath } />
      </Marker>
    );

    const boundsFilter = item => this.isWithinVisibleBounds(
      item.geometry.coordinates,
      this.state.bounds,
      projection,
      zoom
    );

    const countryMarkers = this.props.zoomIn ? [] :
      countriesJSON.features.filter(boundsFilter).map((item) => (
        <Marker key={ `country-${item.id}` } marker={{ coordinates: item.geometry.coordinates }}>
          <text fill="rgba(255,255,255,.4)" fontSize="22" textAnchor="middle">
            { item.properties.name }
          </text>
        </Marker>
      ));

    const cityMarkers = this.props.zoomIn ?
      citiesJSON.features.filter(boundsFilter).map((item) => {
        return (
          <Marker key={ `city-${item.id}` } marker={{ coordinates: item.geometry.coordinates }}>
            <circle r="2" fill="rgba(255,255,255,.8)" />
            <text x="0" y="-10" fill="rgba(255,255,255,.8)" fontSize="14" textAnchor="middle">
              { item.properties.name }
            </text>
          </Marker>
        );
      }) : [];

    return (
      <ComposableMap
        width={ bounds.width }
        height={ bounds.height }
        style={ mapStyle }
        projection={ this.getProjection }
        projectionConfig={ projectionConfig }>
        <ZoomableGroup center={ this.props.center } zoom={ zoom } disablePanning={ false }>
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
            { [].concat(cityMarkers, countryMarkers, userMarker) }
          </Markers>
        </ZoomableGroup>
      </ComposableMap>
    );
  }

  getProjection(width: number, height: number, config: {
    scale?: number,
    xOffset?: number,
    yOffset?: number,
    rotation?: [number, number, number],
    precision?: number,
  }) {
    const scale = config.scale || 160;
    const xOffset = config.xOffset || 0;
    const yOffset = config.yOffset || 0;
    const rotation = config.rotation || [0, 0, 0];
    const precision = config.precision || 0.1;

    return geoTimes()
      .scale(scale)
      .translate([ xOffset + width / 2, yOffset + height / 2 ])
      .rotate(rotation)
      .precision(precision);
  }


  isWithinVisibleBounds(
    coordinate: [number, number],
    bounds: { width: number, height: number },
    projection: ([number, number]) => [number, number],
    zoom: number)
  {
    const center = projection(this.props.center);
    const halfWidth = bounds.width * 0.5 / zoom;
    const halfHeight = bounds.height * 0.5 / zoom;

    const northWest = [center[0] - halfWidth, center[1] - halfHeight];
    const southEast = [center[0] + halfWidth, center[1] + halfHeight];
    const markerPos = projection(coordinate);

    return markerPos[0] >= northWest[0] && markerPos[0] <= southEast[0] &&
      markerPos[1] >= northWest[1] && markerPos[1] <= southEast[1];
  };
}
