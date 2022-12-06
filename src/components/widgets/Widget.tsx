import React, { ReactElement } from 'react';
import { Col, Row } from 'antd';
import IconButton, { IconButtonProps } from '../iconButton/IconButton';
import WhatapChart, { LINE_DEFAULT_BORDER_COLOR } from '../chart';
import { WidgetDataConfig } from '../chart/constants';
import { useConnection } from '../../context/connectionContext';
import { Informatics } from '../informatics';
import { ChartOptions, ChartType } from 'chart.js';

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
    <Row style={{ height: '24px' }} align={'middle'} justify={'space-between'}>
      <Col style={{ fontWeight: 'bold' }}>{title}</Col>
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
  labelKey?: string;
  options?: ChartOptions;
  dataConfigs: WidgetDataConfig[];
}

function Body({
  type,
  dataConfigs,
  labelKey,
  options,
}: BodyProps): ReactElement {
  const { datum } = useConnection();

  switch (type) {
    case 'bar':
    case 'line':
      return (
        <WhatapChart
          type={type}
          options={options}
          data={{
            labels: labelKey
              ? (datum[labelKey] || []).map((data) => data.label)
              : [],
            datasets: dataConfigs.map((config) => {
              return {
                type: config.type as ChartType,
                pointRadius: 1.5,
                pointHoverRadius: 1.5,
                pointStyle: 'circle',
                pointBorderColor: 'rgba(107,119,119,0.69)',
                pointBackgroundColor: 'rgba(107,119,119,0.69)',
                pointHoverBorderColor: 'rgba(107,119,119,0.69)',
                backgroundColor:
                  config.backgroundColor || LINE_DEFAULT_BORDER_COLOR,
                borderColor:
                  config.backgroundColor || LINE_DEFAULT_BORDER_COLOR,
                data: (datum[config.apiUrl] || []).map(
                  (result) => result?.value
                ) as number[],
              };
            }),
          }}
        />
      );
    case 'informatics':
    default:
      return (
        <Informatics
          datum={dataConfigs.map((config) => {
            const result = datum[config.apiUrl];
            return {
              title: config.title,
              value: result?.length ? result[result.length - 1].value : 0,
            };
          })}
        />
      );
  }
}

export interface WidgetProps {
  colSpan?: number;
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
