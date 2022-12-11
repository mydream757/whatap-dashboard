import { API_CATEGORIES } from '../api/constants';
import { ChartTypeRegistry } from 'chart.js';
import { ResponseParser } from '../constants/parsers';

type ConnectionConfig<
  Category extends ApiCategoryKeys = ApiCategoryKeys,
  Params = { [key: string]: string | number }
> = {
  apiCategory: Category;
  apiUrl: keyof typeof API_CATEGORIES[Category];
  stack?: boolean;
  params?: Params;
  responseParser?: ResponseParser;
  recurParams?: (args?: Params) => Params;
  dataType?: 'series' | 'active';
  backgroundColor?: string;
  description?: string;
  title: string;
};

interface InformaticsDataConfig extends ConnectionConfig<'project'> {
  type: 'informatics';
}

interface ChartDataConfig<
  Widget extends keyof ChartTypeRegistry,
  Category extends ApiCategoryKeys = ApiCategoryKeys
> extends ConnectionConfig<Category> {
  type?: Widget;
  datasetOptions?: Partial<ChartTypeRegistry[Widget]['datasetOptions']>;
}

type OpenApiHeader = {
  'x-whatap-pcode'?: string;
  'x-whatap-token': string;
};
type ApiCategoryKeys = keyof typeof API_CATEGORIES;

export type {
  ApiCategoryKeys,
  ConnectionConfig,
  InformaticsDataConfig,
  OpenApiHeader,
  ChartDataConfig,
};
