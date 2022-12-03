import React, { ReactElement } from 'react';
import { Col, Row, Space } from 'antd';
import IconButton, { IconButtonProps } from '../iconButton/IconButton';
import { ChartProps } from 'react-chartjs-2/dist/types';
import WhatapChart from '../chart';

type Feature = ({ type: 'iconButton' } & IconButtonProps) | { type: 'toggle' };

interface HeaderProps {
  title?: string;
  features?: Feature[];
}

function FeatureComponent({ type, ...props }: Feature): ReactElement {
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

function Header({ title, features }: HeaderProps): ReactElement {
  return (
    <Row justify={'space-between'}>
      <Col>{title}</Col>
      <Col>
        <Row gutter={8} align={'middle'} wrap>
          {(features || []).map((feature, index) => (
            <Col key={index}>
              <FeatureComponent {...feature} />
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  );
}

interface BodyProps {
  chartProps: ChartProps;
}

function Body({ chartProps }: BodyProps): ReactElement {
  return (
    <Space>
      <WhatapChart {...chartProps} />
    </Space>
  );
}

export interface WidgetProps {
  header?: HeaderProps;
  body: BodyProps;
}

export default function Widget({ header, body }: WidgetProps): ReactElement {
  return (
    <Space
      style={{
        background: 'white',
        padding: '8px',
        width: '100%',
        borderRadius: '4px',
        boxShadow:
          'rgb(0 0 0 / 20%) 0px 1px 3px 0px, rgb(0 0 0 / 12%) 0px 2px 1px -1px, rgb(0 0 0 / 14%) 0px 1px 1px 0px',
      }}
      direction={'vertical'}
    >
      {header && <Header {...header} />}
      <Body {...body} />
    </Space>
  );
}
