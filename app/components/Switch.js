// @flow
import React, { Component } from 'react';

import type { Point2d } from '../types';

const CLICK_TIMEOUT = 1000;
const MOVE_THRESHOLD = 10;

export type SwitchProps = {
  isOn: boolean;
  onChange: ?((isOn: boolean) => void);
};

export default class Switch extends Component {
  props: SwitchProps;
  static defaultProps: SwitchProps = {
    isOn: false,
    onChange: null
  }

  isCapturingMouseEvents = false;
  ref: ?HTMLInputElement;
  onRef = (e: HTMLInputElement) => this.ref = e;

  state = {
    ignoreChange: false,
    initialPos: ({x: 0, y: 0}: Point2d),
    startTime: (null: ?number)
  }

  handleMouseDown = (e: MouseEvent) => {
    const { clientX: x, clientY: y } = e;
    this.startCapturingMouseEvents();
    this.setState({
      initialPos: { x, y },
      startTime: e.timeStamp
    });
  }

  handleMouseMove = (e: MouseEvent) => {
    const inputElement = this.ref;
    const { x: x0 } = this.state.initialPos;
    const { clientX: x, clientY: y } = e;
    const dx = Math.abs(x0 - x);

    if(dx < MOVE_THRESHOLD) {
      return;
    }

    const isOn = !!this.props.isOn;
    let nextOn = isOn;

    if(x < x0 && isOn) {
      nextOn = false;
    } else if(x > x0 && !isOn) {
      nextOn = true;
    }

    if(isOn !== nextOn) {
      this.setState({
        initialPos: { x, y },
        ignoreChange: true
      });

      if(inputElement) {
        inputElement.checked = nextOn;
      }

      this.notify(nextOn);
    }
  }

  handleMouseUp = () => {
    this.stopCapturingMouseEvents();
  }

  handleChange = (e: Event) => {
    const startTime = this.state.startTime;
    const eventTarget: Object = e.target;

    if(typeof(startTime) !== 'number') {
      throw new Error('startTime must be a number.');
    }

    const dt = e.timeStamp - startTime;

    if(this.state.ignoreChange) {
      this.setState({ ignoreChange: false });
      e.preventDefault();
    } else if(dt > CLICK_TIMEOUT) {
      e.preventDefault();
    } else {
      this.notify(eventTarget.checked);
    }
  }

  notify(isOn: boolean) {
    const onChange = this.props.onChange;
    if(onChange) {
      onChange(isOn);
    }
  }

  startCapturingMouseEvents() {
    if(this.isCapturingMouseEvents) {
      throw new Error('startCapturingMouseEvents() is called out of order.');
    }
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    this.isCapturingMouseEvents = true;
  }

  stopCapturingMouseEvents() {
    if(!this.isCapturingMouseEvents) {
      throw new Error('stopCapturingMouseEvents() is called out of order.');
    }
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.isCapturingMouseEvents = false;
  }

  componentWillUnmount() {
    // guard from abrupt programmatic unmount
    if(this.isCapturingMouseEvents) {
      this.stopCapturingMouseEvents();
    }
  }

  render(): React.Element<*> {
    const { isOn, onChange, ...otherProps } = this.props; // eslint-disable-line no-unused-vars
    let className = ('switch' + ' ' + (otherProps.className || '')).trim();
    return (
      <input { ...otherProps }
        type="checkbox"
        ref={ this.onRef }
        className={ className }
        checked={ isOn }
        onMouseDown={ this.handleMouseDown }
        onChange={ this.handleChange } />
    );
  }
}
