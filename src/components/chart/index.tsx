import { ReactElement } from 'react';
import { Chart, ChartProps } from 'react-chartjs-2';

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
export const LINE_DEFAULT_BORDER_COLOR = 'rgb(75, 192, 192)';
export default function WhatapChart({
  data,
  ...props
}: ChartProps): ReactElement {
  return <Chart {...props} updateMode={'active'} data={data} />;
}
