import { ConnectionResult } from './connection';
import { API_CATEGORIES } from '../constants';

export type OpenApiHeader = {
  'x-whatap-pcode'?: string;
  'x-whatap-token': string;
};

export type ResponseParser = (response: any) => ConnectionResult[];
type ApiKeys =
  | keyof typeof API_CATEGORIES['project']
  | keyof typeof API_CATEGORIES['account'];

type ParserName = `${ApiKeys}-into-${string}`;

export type ParserRegistry = { [key: ParserName]: ResponseParser };
