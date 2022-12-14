import React, { ReactElement } from 'react';
import { IconButton } from '../../basic';
import { IconButtonProps, WidgetFeatureProps } from '../../../@types';

export function WidgetFeature({
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
