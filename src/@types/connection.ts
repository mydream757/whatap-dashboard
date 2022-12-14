import { ChartTypeRegistry } from 'chart.js';
import { API_CATEGORIES } from '../constants';
import { ResponseParser } from './api';

/** Connection
 * @description
 *  네트워크 요청이 주기적으로 일어나게 만드는 행위를 Connection 이라 정의함.
 */

export type ConnectionConfig<
  Category extends ApiCategoryKeys = ApiCategoryKeys,
  Params = { [key: string]: string | number }
> = {
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

export interface InformaticsConnectionConfig
  extends ConnectionConfig<'project'> {
  type: 'informatics';
}

export interface ChartConnectionConfig<
  Widget extends keyof ChartTypeRegistry,
  Category extends ApiCategoryKeys = ApiCategoryKeys
> extends ConnectionConfig<Category> {
  type?: Widget;
  datasetOptions?: Partial<ChartTypeRegistry[Widget]['datasetOptions']>;
}

type ApiCategoryKeys = keyof typeof API_CATEGORIES;

export interface ConnectionContextReturn {
  queryConnection: (args: QueryConnectionArgs) => void;
  selectProject: (projectCode: number) => void;
  setApiTokenMap: (value: { [key: ApiToken]: string }) => void;
  dataRecord: DataRecord;
  clear: () => void;
  apiTokenMap: Record<ProjectCode, ApiToken>;
}

// 네트워크 응답 데이터를 저장하기 위한 타입
export interface ConnectionResult<Data = number> {
  value: Data;
  label?: string | number;
  time: number;
}

// 각각의 네트워크 요청을 식별하기 위한 key
export type ConnectionKey = string;

export type ProjectCode = number;
export type ApiToken = string;

// 네트워크 요청 주기(timeout, interval) 관련 타입
export type ConnectionState = {
  apiKey: string;
  interval?: NodeJS.Timer;
  timeout?: NodeJS.Timer;
  callback?: () => void;
};
export type DataRecord = Record<ConnectionKey, ConnectionResult[]>;

export type ConnectionStateRecord = Record<ConnectionKey, ConnectionState>;

//네트워크 요청을 반복적으로 수행토록 요청(query)하기 위해 필요한 인자
export interface QueryConnectionArgs<
  Param = { [field: string]: string | number }
> {
  pcode: number;
  category: ApiCategoryKeys;
  fail?: number;
  connectionKey?: ConnectionKey;
  apiKey: string;
  responseParser?: (response: any) => ConnectionResult[];
  maxStackSize?: number;
  params?: Param;
  recurParams?: (args?: Param) => Param;
  intervalTime?: number;
}
