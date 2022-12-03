import { ReactElement } from 'react';
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

export default function WhatapChart({ ...props }: ChartProps): ReactElement {
  return <Chart updateMode={'active'} {...props} />;
}
