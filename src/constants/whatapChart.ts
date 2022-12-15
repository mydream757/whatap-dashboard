import { ChartType, ChartTypeRegistry } from 'chart.js';
import { DESIGN } from './design';

export const WhatapChartRegistry: {
  [chartType in ChartType]+?: {
    [options in keyof ChartTypeRegistry[chartType]]+?: Partial<
      ChartTypeRegistry[chartType][options]
    >;
  };
} = {
  line: {
    datasetOptions: {
      pointHoverRadius: 1,
      pointStyle: 'circle',
      backgroundColor: DESIGN.COLOR.mint['100'],
      borderColor: DESIGN.COLOR.mint['100'],
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
