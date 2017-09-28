// @flow

import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import { ComposableMap, ZoomableGroup, Geographies, Geography, Markers, Marker } from 'react-simple-maps';

import type { Coordinate2d } from '../types';

export default class Map extends Component {
  props: {
    location: Coordinate2d,
    zoom: number,
    markerImagePath: string,
  }

  render() {
    const worldJSON =  './assets/geo/world-countries.json';
    const projectionConfig = {
      scale: 205
    };

    const mapStyle = {
      width: '800px',
      height: '100%',
      backgroundColor: '#191A1A'
    };

    const geographyStyle = {
      default: {
        fill: '#192C44',
        stroke: '#191A1A',
        strokeWidth: '1px',
      }
    };

    const motionStyle = {
      zoom: spring(this.props.zoom, {stiffness: 210, damping: 20}),
      x: spring(this.props.location[0], {stiffness: 210, damping: 20}),
      y: spring(this.props.location[1], {stiffness: 210, damping: 20}),
    };

    return (
      <Motion defaultStyle={{ zoom: 1, x: 0, y: 20 }} style={ motionStyle }>
        {({zoom, x, y}) => (
          <ComposableMap style={ mapStyle } projectionConfig={ projectionConfig }>
            <ZoomableGroup center={ [x, y] } zoom={ zoom } disablePanning={ true }>
              <Geographies geographyUrl={ worldJSON }>
                {(geographies, projection) => geographies.map((geography, i) => (
                  <Geography
                    key={ `geography-${i}` }
                    geography={ geography }
                    projection={ projection }
                    style={ geographyStyle }
                  />
                ))}
              </Geographies>
              <Markers>
                <Marker
                  key={ 'marker' }
                  marker={{ coordinates: this.props.location }}>
                  <image xlinkHref={ this.props.markerImagePath } />
                </Marker>
              </Markers>
            </ZoomableGroup>
          </ComposableMap>
        )}
      </Motion>
    );
  }
}
