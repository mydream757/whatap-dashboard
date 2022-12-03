import { ReactElement, useMemo } from 'react';
import { Chart } from 'react-chartjs-2';

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { ChartProps } from 'react-chartjs-2/dist/types';

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

/** Sample data
 const data = {
  labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  datasets: [
    {
      type: 'bar' as const,
      label: 'My First Dataset',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
    {
      type: 'line' as const,
      label: 'My First Dataset',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
  ],
};
 */

const REAL_TIME_DATA_POOL = 15;

export default function WhatapChart({
  data,
  ...props
}: ChartProps): ReactElement {
  const parsedChartDataForRealTime = useMemo(() => {
    return {
      ...data,
      labels: data.labels?.slice(
        data.labels?.length - REAL_TIME_DATA_POOL > 0
          ? data.labels?.length - REAL_TIME_DATA_POOL
          : 0,
        data.labels?.length
      ),
      datasets: data.datasets.map((dataSet) => {
        return {
          ...dataSet,
          data: dataSet.data?.slice(
            dataSet.data?.length - REAL_TIME_DATA_POOL > 0
              ? dataSet.data?.length - REAL_TIME_DATA_POOL
              : 0,
            dataSet.data?.length
          ),
        };
      }),
    };
  }, [data]);

  return (
    <Chart updateMode={'active'} {...props} data={parsedChartDataForRealTime} />
  );
}
