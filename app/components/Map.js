// @flow

import path from 'path';
import React, { Component } from 'react';
import { ComposableMap, ZoomableGroup, Geographies, Geography, Markers, Marker } from "react-simple-maps";
import cheapRuler from 'cheap-ruler';

import type { Coordinate2d } from '../types';

export default class Map extends Component {
  props: {
    animate: boolean,
    location: Coordinate2d,
    altitude: number,
    markerImagePath: string,
  }

  render() {

    // const mapBounds = this.calculateMapBounds(this.props.location, this.props.altitude);
    // const mapBoundsOptions = { offset: [0, -113], animate: this.props.animate };

    const worldJSON =  './assets/geo/world-countries.json';

    const projection = {
      scale: 300
    };

    const mapStyle = {
      width: '800px',
      height: '100%',
      backgroundColor: '#191A1A'
    };

    return <ComposableMap style={ mapStyle } projectionConfig={ projection }>
      <ZoomableGroup disablePanning={ true }>
        <Geographies geographyUrl={ worldJSON }>
          {(geographies, projection) => geographies.map((geography, i) => (
            <Geography
              key={ `geography-${i}` }
              geography={ geography }
              projection={ projection }
              style={{
                default: {
                  fill: '#192C44',
                  stroke: '#191A1A',
                  strokeWidth: '1px',
                }
              }}
            />
          ))}
        </Geographies>
        <Markers>
          <Marker
            key={ 'marker' }
            marker={{ coordinates: this.convertToMapCoordinate(this.props.location) }}>
            <image xlinkHref={ this.props.markerImagePath } />
          </Marker>
        </Markers>
      </ZoomableGroup>
    </ComposableMap>;
  }

  calculateMapBounds(center: Coordinate2d, altitude: number): [Coordinate2d, Coordinate2d] {
    const bounds = cheapRuler(center[0], 'meters').bufferPoint(center, altitude);
    // convert [lat,lng] bounds to [lng,lat]
    return [ [bounds[1], bounds[0]], [bounds[3], bounds[2]] ];
  }

  convertToMapCoordinate(pos: Coordinate2d): Coordinate2d {
    // convert [lat,lng] bounds to [lng,lat]
    return [pos[1], pos[0]];
  }
}
