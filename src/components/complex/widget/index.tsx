import Header from './WidgetHeader';
import Body from './WidgetBody';
import { WidgetProps } from '../../../@types';
import React, { ReactElement } from 'react';

const WidgetMain = ({ header, body }: WidgetProps): ReactElement => {
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
};

type MainInterface = typeof WidgetMain;

interface WidgetInterface extends MainInterface {
  Header: typeof Header;
  Body: typeof Body;
}

export const Widget: WidgetInterface = Object.assign(WidgetMain, {
  Header: Header,
  Body: Body,
});
