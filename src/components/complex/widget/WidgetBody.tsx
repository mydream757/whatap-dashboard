import React, { ReactElement } from 'react';
import { DataRecord } from '../../../contexts/connectionContext';
import { ChartOptions } from 'chart.js';
import {
  ChartConnectionConfig,
  InformaticsConnectionConfig,
} from '../../../types';
import { Informatics, WhatapChart } from '../../basic';
import { getDatasetConfig } from '../../basic/WhatapChart';

type ChartType = 'line' | 'bar';

type Label = string | number;

export type BodyProps = (getWhatapChartDataArgs | getInformaticsDataArgs) & {
  type: 'informatics' | ChartType;
  options?: ChartOptions;
  labels?: Label[];
};

type getInformaticsDataArgs = {
  dataConfigs: InformaticsConnectionConfig[];
  dataRecord?: DataRecord;
};

const getInformaticsData = ({
  dataConfigs,
  dataRecord = {},
}: getInformaticsDataArgs) => {
  return dataConfigs.map(({ title, apiKey }) => {
    const spots = dataRecord[apiKey];
    const length = spots?.length;

    const latestValue = length ? spots[length - 1].value : 0;

    return {
      title,
      value: latestValue,
    };
  });
};

type getWhatapChartDataArgs = {
  type: ChartType;
  dataConfigs: ChartConnectionConfig<ChartType, 'project'>[];
  dataRecord?: DataRecord;
  labels?: Label[];
};
const getWhatapChartData = ({
  type,
  dataConfigs,
  dataRecord = {},
  labels = [],
}: getWhatapChartDataArgs) => {
  return {
    labels: labels || [],
    datasets: dataConfigs.map(({ type: eachType, apiKey, datasetOptions }) => {
      return {
        ...getDatasetConfig({
          type: eachType || type,
          datasetOptions,
        }),
        data: (dataRecord[apiKey] || []).map((result) => result?.value),
      };
    }),
  };
};

export default function WidgetBody({
  type,
  dataRecord,
  dataConfigs,
  labels,
  options,
}: BodyProps): ReactElement {
  switch (type) {
    case 'bar':
    case 'line':
      return (
        <WhatapChart
          type={type}
          options={options}
          data={getWhatapChartData({
            type,
            dataConfigs: dataConfigs as ChartConnectionConfig<
              ChartType,
              'project'
            >[],
            labels,
            dataRecord,
          })}
        />
      );
    case 'informatics':
    default:
      return (
        <Informatics
          datum={getInformaticsData({
            dataRecord,
            dataConfigs,
          })}
        />
      );
  }
}
