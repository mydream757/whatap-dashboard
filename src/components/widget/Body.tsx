import React, { ReactElement } from 'react';
import { useConnection } from '../../context/connectionContext';
import WhatapChart, { LINE_DEFAULT_BORDER_COLOR } from '../chart';
import { ChartOptions, ChartType } from 'chart.js';
import { Informatics } from '../informatics';
import { WidgetDataConfig } from '../chart/constants';

export type WidgetType = 'informatics' | 'line' | 'bar';

export interface BodyProps {
  type: WidgetType;
  labelKey?: string;
  options?: ChartOptions;
  dataConfigs: WidgetDataConfig[];
}

export default function Body({
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
