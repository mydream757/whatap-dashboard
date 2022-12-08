import { API_CATEGORIES } from '../api/constants';
import { ChartTypeRegistry } from 'chart.js';
import { ResponseParser } from '../parsers';

export type DataConfig<
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

export interface InformaticsDataConfig extends DataConfig {
  type: 'informatics';
}

export interface ChartDataConfig<
  Widget extends keyof ChartTypeRegistry,
  Category extends ApiCategoryKeys = ApiCategoryKeys
> extends DataConfig<Category> {
  type?: Widget;
  options?: ChartTypeRegistry[Widget];
}

export type OpenApiHeader = {
  'x-whatap-pcode'?: string;
  'x-whatap-token': string;
};
export type ApiCategoryKeys = keyof typeof API_CATEGORIES;