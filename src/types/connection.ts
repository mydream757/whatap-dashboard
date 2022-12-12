import { API_CATEGORIES } from '../api/constants';
import { ChartTypeRegistry } from 'chart.js';
import { ResponseParser } from '../constants/parsers';

type ConnectionConfig<
  Category extends ApiCategoryKeys = ApiCategoryKeys,
  Params = { [key: string]: string | number }
> = {
  queryKey?: string;
  apiCategory: Category;
  apiKey: keyof typeof API_CATEGORIES[Category] | string;
  maxStackSize?: number;
  params?: Params;
  responseParser?: ResponseParser;
  recurParams?: (args?: Params) => Params;
  dataType?: 'series' | 'active';
  backgroundColor?: string;
  description?: string;
  title: string;
};

interface InformaticsConnectionConfig extends ConnectionConfig<'project'> {
  type: 'informatics';
}

interface ChartConnectionConfig<
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
  InformaticsConnectionConfig,
  OpenApiHeader,
  ChartConnectionConfig,
};
