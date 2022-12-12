import { ReactElement } from 'react';
import { Chart, ChartProps } from 'react-chartjs-2';

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartType,
  ChartTypeRegistry,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import DESIGN from '../../system/design';
import { ChartConnectionConfig } from '../../types';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController
);

export const WhatapChartRegistry: {
  [chartType in ChartType]+?: {
    [options in keyof ChartTypeRegistry[chartType]]+?: Partial<
      ChartTypeRegistry[chartType][options]
    >;
  };
} = {
  line: {
    datasetOptions: {
      pointHoverRadius: 1.5,
      pointStyle: 'circle',
      pointBorderColor: DESIGN.COLOR.mint['100'],
      pointBackgroundColor: DESIGN.COLOR.mint['100'],
      pointHoverBorderColor: DESIGN.COLOR.grey['100'],
    },
  },
  bar: {
    datasetOptions: {
      pointStyle: 'circle',
      backgroundColor: DESIGN.COLOR.mint['100'],
      borderColor: DESIGN.COLOR.mint['100'],
    },
  },
} as const;

export const getDatasetConfig = ({
  type = 'line',
  datasetOptions,
}: Pick<ChartConnectionConfig<ChartType>, 'type' | 'datasetOptions'>) => {
  return {
    ...WhatapChartRegistry[type]?.datasetOptions,
    ...datasetOptions,
  } as Partial<ChartTypeRegistry[typeof type]['datasetOptions']>;
};

export default function WhatapChart({ ...props }: ChartProps): ReactElement {
  return (
    <Chart
      {...props}
      options={{
        plugins: {
          legend: {
            display: false,
          },
        },
        ...props.options,
      }}
      updateMode={'active'}
    />
  );
}
