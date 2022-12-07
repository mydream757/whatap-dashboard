import React, { ReactElement } from 'react';
import IconButton, { IconButtonProps } from '../iconButton/IconButton';

export type WidgetFeatureProps =
  | ({ type: 'iconButton' } & IconButtonProps)
  | { type: 'toggle' };

export default function WidgetFeature({
  type,
  ...props
}: WidgetFeatureProps): ReactElement {
  switch (type) {
    case 'iconButton':
      return <IconButton {...(props as IconButtonProps)} />;
    case 'toggle':
      return <div></div>;
    default:
      throw new Error(
        `Incorrect property transfer: "type" is unable to be - ${type}`
      );
  }
}
