// @flow

import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import { ComposableMap, ZoomableGroup, Geographies, Geography, Markers, Marker, Annotation } from 'react-simple-maps';

import type { Coordinate2d } from '../types';

export type MapProps = {
  location: Coordinate2d,
  zoom: number,
  markerImagePath: string,
};

export default class Map extends Component {
  props: MapProps

  state: {
    initialZoom: number,
    initialLocation: [number, number]
  }

  constructor(props: MapProps) {
    super(props);
    this.state = {
      initialZoom: props.zoom,
      initialLocation: props.location
    };
  }

  render() {
    const worldJSON =  './assets/geo/world-countries.json';
    const projectionConfig = {
      scale: 6000,
      // doesn't work properly for some reason
      // see: https://github.com/zcreativelabs/react-simple-maps/issues/23
      // yOffset: -150 / this.props.zoom
    };

    const mapStyle = {
      width: '100%',
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

    const lonlat = [this.props.location[1], this.props.location[0]];
    const initialStyle = {
      zoom: this.state.initialZoom,
      x: this.state.initialLocation[1],
      y: this.state.initialLocation[0]
    };

    const motionStyle = {
      zoom: spring(this.props.zoom, {stiffness: 210, damping: 20}),
      x: spring(lonlat[0], {stiffness: 210, damping: 20}),
      y: spring(lonlat[1], {stiffness: 210, damping: 20}),
    };

    return (
      <Motion defaultStyle={ initialStyle } style={ motionStyle }>
        {({zoom, x, y}) => (
          <ComposableMap width={ 800 } height={ 450 } style={ mapStyle } projectionConfig={ projectionConfig }>
            <ZoomableGroup center={ [x, y] } zoom={ zoom } disablePanning={ true }>
              <Geographies geographyUrl={ worldJSON }>
                {(geographies, projection) => geographies.map((geography, i) => (
                  <Geography
                    key={ `geography-${i}` }
                    geography={ geography }
                    projection={ projection }
                    style={ geographyStyle } />
                ))}
              </Geographies>
              <Markers>
                <Marker key={ 'marker' } marker={{ coordinates: lonlat }}>
                  { /* TODO: find the way to use relative x/y (i.e -50%) */  }
                  <image x="-30" y="-30" xlinkHref={ this.props.markerImagePath } />
                </Marker>
              </Markers>
            </ZoomableGroup>
          </ComposableMap>
        )}
      </Motion>
    );
  }
}
