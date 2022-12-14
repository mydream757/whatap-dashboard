import { ReactElement } from 'react';
import { Chart, ChartProps } from 'react-chartjs-2';

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartType,
  ChartTypeRegistry,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { WhatapChartRegistry } from '../../constants/whatapChart';
import { ChartConnectionConfig } from '../../@types';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Filler,
  Tooltip,
  LineController,
  BarController
);

export const getDatasetConfig = ({
  type = 'line',
  datasetOptions,
}: Pick<ChartConnectionConfig<ChartType>, 'type' | 'datasetOptions'>) => {
  return {
    ...WhatapChartRegistry[type]?.datasetOptions,
    ...datasetOptions,
  } as Partial<ChartTypeRegistry[typeof type]['datasetOptions']>;
};

export function WhatapChart({ ...props }: ChartProps): ReactElement {
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
      updateMode={'none'}
    />
  );
}
