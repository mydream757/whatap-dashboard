import React, { ReactElement, ReactNode, useMemo } from 'react';
import { Col, Row, Space } from 'antd';
import IconButton, { IconButtonProps } from '../iconButton/IconButton';
import WhatapChart, { LINE_DEFAULT_BORDER_COLOR } from '../chart';
import { WidgetDataConfig } from '../chart/constants';
import { useConnection } from '../../context/connectionContext';
import { Informatics } from '../informatics';
import { ChartType } from 'chart.js';

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

type WidgetType = 'informatics' | 'line' | 'bar';

interface BodyProps {
  type: WidgetType;
  labels?: string[];
  dataConfigs: WidgetDataConfig[];
}

function Body({ type, dataConfigs, labels }: BodyProps): ReactElement {
  const { datum } = useConnection();
  let innerRender: ReactNode;

  switch (type) {
    case 'bar':
    case 'line':
      innerRender = (
        <WhatapChart
          type={type}
          data={{
            labels,
            datasets: useMemo(
              () =>
                dataConfigs.map((config) => {
                  return {
                    type: config.type as ChartType,
                    backgroundColor:
                      config.backgroundColor || LINE_DEFAULT_BORDER_COLOR,
                    borderColor:
                      config.backgroundColor || LINE_DEFAULT_BORDER_COLOR,
                    label: config.title,
                    data: (datum[config.apiUrl] || []).map(
                      (result) => result.data?.value
                    ) as number[],
                  };
                }),
              [labels]
            ),
          }}
        />
      );
      break;
    case 'informatics':
    default:
      innerRender = (
        <Informatics
          datum={useMemo(
            () =>
              dataConfigs.map((config) => {
                const result = datum[config.apiUrl];
                return {
                  title: config.title,
                  value: result?.length
                    ? result[result.length - 1].data.value
                    : 0,
                };
              }),
            [labels]
          )}
        />
      );
      break;
  }
  return <Space>{innerRender}</Space>;
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
