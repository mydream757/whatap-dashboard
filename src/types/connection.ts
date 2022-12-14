import { API_CATEGORIES } from '../api/constants';
import { ChartTypeRegistry } from 'chart.js';
import { ResponseParser } from '../constants/parsers';

/** Connection
 * @description
 *  네트워크 요청이 주기적으로 일어나게 만드는 행위를 Connection 이라 정의함.
 */

type ConnectionConfig<Category extends ApiCategoryKeys = ApiCategoryKeys,
  Params = { [key: string]: string | number }> = {
  connectionKey?: string;
  apiCategory: Category;
  apiKey: keyof typeof API_CATEGORIES[Category] | string;
  maxStackSize?: number;
  params?: Params;
  intervalTime?: number;
  responseParser?: ResponseParser;
  recurParams?: (args?: Params) => Params;
  dataType?: 'series' | 'active';
  title: string;
};

interface InformaticsConnectionConfig extends ConnectionConfig<'project'> {
  type: 'informatics';
}

interface ChartConnectionConfig<Widget extends keyof ChartTypeRegistry,
  Category extends ApiCategoryKeys = ApiCategoryKeys> extends ConnectionConfig<Category> {
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
