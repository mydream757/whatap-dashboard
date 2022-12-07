import React, { ReactElement } from 'react';
import Header, { HeaderProps } from './Header';
import Body, { BodyProps } from './Body';

export interface WidgetProps {
  header?: HeaderProps;
  body: BodyProps;
}

export default function Widget({ header, body }: WidgetProps): ReactElement {
  return (
    <div
      style={{
        background: 'white',
        padding: '8px',
        width: '100%',
        borderRadius: '4px',
        boxShadow:
          'rgb(0 0 0 / 20%) 0px 1px 3px 0px, rgb(0 0 0 / 12%) 0px 2px 1px -1px, rgb(0 0 0 / 14%) 0px 1px 1px 0px',
      }}
    >
      {header && <Header {...header} />}
      <Body {...body} />
    </div>
  );
}
