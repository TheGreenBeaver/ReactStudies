import React, { useLayoutEffect, useState } from 'react';
import { node, oneOf, string } from 'prop-types';
import { STANDARD_RATIO } from '../../util/constants';
import { Ratio } from '../../util/types';


const MEDIA_TYPES = {
  video: 'video',
  image: 'image',
};

const SETTINGS = {
  [MEDIA_TYPES.video]: {
    eventName: 'loadedmetadata',
    propNames: ['videoWidth', 'videoHeight'],
    create: () => document.createElement('video'),
    Component: props => <video {...props} />
  },
  [MEDIA_TYPES.image]: {
    eventName: 'load',
    propNames: ['width', 'height'],
    create: () => new Image(),
    Component: props => <img {...props} />
  }
};

function AutosizeMedia({ src, ratio, placeholder, mediaType, ...otherProps }) {
  const [comparesToRatio, setComparesToRatio] = useState(0);

  useLayoutEffect(() => {
    setComparesToRatio(0);
    const { eventName, propNames, create } = SETTINGS[mediaType];
    const sizeTracker = create();
    sizeTracker.addEventListener(eventName, () => {
      const width = sizeTracker[propNames[0]];
      const height = sizeTracker[propNames[1]];
      setComparesToRatio(Math.sign(width / height - ratio.w / ratio.h));
      sizeTracker.remove();
    });
    sizeTracker.src = src;
  }, [src]);

  if (comparesToRatio === 0) {
    return placeholder;
  }

  const { Component } = SETTINGS[mediaType];

  return (
    <Component
      src={src}
      height={comparesToRatio < 0 ? '100%' : 'auto'}
      width={comparesToRatio > 0 ? '100%' : 'auto'}
      {...otherProps}
    />
  );
}

AutosizeMedia.propTypes = {
  src: string.isRequired,
  mediaType: oneOf([...Object.values(MEDIA_TYPES)]).isRequired,
  ratio: Ratio,
  placeholder: node
};

AutosizeMedia.defaultProps = {
  ratio: STANDARD_RATIO,
  placeholder: null
};

AutosizeMedia.MEDIA_TYPES = MEDIA_TYPES;

export default AutosizeMedia;