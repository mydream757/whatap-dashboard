import { ConnectionResult } from '../context/connectionContext';
import { API_CATEGORIES } from '../api/constants';
import { format } from 'date-fns';

export type ResponseParser = (response: any) => ConnectionResult[];
type apiKeys =
  | keyof typeof API_CATEGORIES['project']
  | keyof typeof API_CATEGORIES['account'];

type ParserName = `${apiKeys}-into-${string}`;

type ParserRegistry = { [key: ParserName]: ResponseParser };

const API_RESPONSE_PARSERS: ParserRegistry = {
  'api/json/remote/{stime}/{etime}-into-country': (response: {
    records: {
      city: string;
      country: string;
      ip: string;
      count: number;
    }[];
    total: number;
    retrievedTotal: number;
  }) => {
    const recordMap: { [country: string]: number } = {};
    response.records.forEach((record) => {
      if (recordMap[record.country] === undefined) {
        recordMap[record.country] = 0;
      }
      recordMap[record.country] += record.count;
    });

    return Object.keys(recordMap)
      .sort((a, b) => {
        return recordMap[b] - recordMap[a];
      })
      .map((country) => {
        return {
          value: recordMap[country],
          label: country.split(' ')[0],
          time: Date.now(),
        };
      });
  },
  'api/json/visitor_5m/{stime}/{etime}-into-time-series': (response: {
    data: [number, number][];
    etime: bigint;
    stime: bigint;
    pcode: number;
    total: number;
  }) => {
    return response.data.map(([time, count]) => {
      return {
        value: count,
        time: time,
        label: format(new Date(time), 'hh:mm'),
      };
    });
  },
  'api/json/visitor_h/{stime}/{etime}-into-time-series': (response: {
    data: [number, number][];
    etime: bigint;
    stime: bigint;
    pcode: number;
    total: number;
  }) => {
    return response.data.map(([time, count]) => {
      return {
        value: count,
        time: time,
        label: format(new Date(time), 'hh:mm'),
      };
    });
  },
} as const;

export default API_RESPONSE_PARSERS;
