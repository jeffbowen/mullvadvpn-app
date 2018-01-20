// @flow
import path from 'path';
import KeyframeAnimation from './keyframe-animation';

import type { Tray } from 'electron';

export type TrayIconType = 'unsecured' | 'securing' | 'secured';

export default class TrayIconManager {

  _animation: ?KeyframeAnimation;
  _iconColor: boolean;
  _iconType: TrayIconType;
  _tray: Tray;

  constructor(tray: Tray, initialColor: boolean, initialType: TrayIconType) {
    const animation = this._createAnimation(initialColor);
    animation.onFrame = (img) => tray.setImage(img);
    animation.reverse = this._isReverseAnimation(initialType);
    animation.play({ advanceTo: 'end' });

    this._animation = animation;
    this._iconColor = initialColor;
    this._iconType = initialType;
    this._tray = tray;
  }

  destroy() {
    if(this._animation) {
      this._animation.stop();
      this._animation = null;
    }
  }

  _createAnimation(color: boolean): KeyframeAnimation {
    const basePath = path.join(path.resolve(__dirname, '..'), 'assets/images/menubar icons');
    const fileName = color ? 'lock-{}.png' : 'lock-bw-{}.png';
    const filePath = path.join(basePath, fileName);
    const animation = KeyframeAnimation.fromFilePattern(filePath, [1, 10]);
    animation.speed = 100;
    return animation;
  }

  _isReverseAnimation(type: TrayIconType): bool {
    return type === 'unsecured';
  }

  set iconColor(color: boolean) {
    const animation = this._createAnimation(color);
    // TODO: Find a more DRY approach to updating the animation
    animation.onFrame = (img) => this._tray.setImage(img);
    animation.reverse = this._isReverseAnimation(this._iconType);
    animation.play({ advanceTo: 'end' });
    this._animation = animation;
    this._iconColor = color;
  }

  get iconType(): TrayIconType {
    return this._iconType;
  }

  set iconType(type: TrayIconType) {
    if(this._iconType === type || !this._animation) { return; }

    const animation = this._animation;
    if (type === 'secured') {
      animation.reverse = true;
      animation.play({ beginFromCurrentState: true, startFrame: 8, endFrame: 9 });

    } else {
      animation.reverse = this._isReverseAnimation(type);
      animation.play({ beginFromCurrentState: true });
    }

    this._iconType = type;
  }
}
