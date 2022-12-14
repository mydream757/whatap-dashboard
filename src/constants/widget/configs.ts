import { startOfToday, subDays } from 'date-fns';
import { WidgetListItemRegistry } from '../../@types';
import { API_CATEGORIES } from '../api';
import { API_RESPONSE_PARSERS } from '../parsers';
import { DESIGN } from '../design';

export const WidgetConfig: WidgetListItemRegistry = {
  activeStatus: {
    header: {
      title: 'Active Status',
    },
    body: {
      type: 'informatics',
      dataConfigs: [
        {
          type: 'informatics',
          title: '메서드',
          apiCategory: 'project',
          apiKey: 'api/act_method',
        },
        {
          type: 'informatics',
          title: '에이전트',
          apiCategory: 'project',
          apiKey: 'api/act_agent',
        },
        {
          type: 'informatics',
          title: '5분 간 고유 사용자',
          apiCategory: 'project',
          apiKey: 'api/user',
        },
        {
          type: 'informatics',
          title: 'Sql',
          apiCategory: 'project',
          apiKey: 'api/act_sql',
        },
        {
          type: 'informatics',
          title: 'Http 호출',
          apiCategory: 'project',
          apiKey: 'api/act_httpc',
        },
        {
          type: 'informatics',
          title: '소켓',
          apiCategory: 'project',
          apiKey: 'api/act_socket',
        },
      ],
    },
  },
  transaction: {
    header: {
      title: 'Transaction',
    },
    body: {
      type: 'informatics',
      dataConfigs: [
        {
          type: 'informatics',
          title: '총 트랜잭션',
          apiCategory: 'project',
          apiKey: 'api/txcount',
        },
        {
          type: 'informatics',
          title: '활성 트랜잭션',
          apiCategory: 'project',
          apiKey: 'api/actx',
        },
        {
          type: 'informatics',
          title: '초당 트랜잭션',
          apiCategory: 'project',
          apiKey: 'api/tps',
        },
      ],
    },
  },
  exception: {
    labelKey: 'api/json/exception/{stime}/{etime}',
    header: {
      title: 'Exception',
    },
    body: {
      type: 'line',
      dataConfigs: [
        {
          title: API_CATEGORIES['project']['api/dbc_count'],
          apiCategory: 'project',
          apiKey: 'api/json/exception/{stime}/{etime}',
          params: {
            etime: Date.now(),
            stime: Date.now() - 1000 * 60 * 60,
          },
          recurParams: (args) => {
            return {
              stime: ((args?.stime as number) || 0) + 1000 * 5,
              etime: ((args?.etime as number) || 0) + 1000 * 5,
            };
          },
        },
      ],
    },
  },
  clientIP: {
    labelKey: 'api/json/remote/{stime}/{etime}',
    header: {
      title: '국가 별 Client',
    },
    body: {
      type: 'bar',
      dataConfigs: [
        {
          type: 'bar',
          title: 'Client IP',
          apiCategory: 'project',
          apiKey: 'api/json/remote/{stime}/{etime}',
          responseParser:
            API_RESPONSE_PARSERS[
              'api/json/remote/{stime}/{etime}-into-country'
            ],
          params: {
            etime: Date.now(),
            stime: Date.now() - 1000 * 60 * 60,
          },
          recurParams: (args) => {
            return {
              stime: ((args?.stime as number) || 0) + 1000 * 5,
              etime: ((args?.etime as number) || 0) + 1000 * 5,
            };
          },
        },
      ],
    },
  },
  activeUsers5m: {
    labelKey: 'previousTotal',
    header: {
      title: '활성 사용자 (5분 단위)',
    },
    body: {
      type: 'line',
      dataConfigs: [
        {
          type: 'line',
          datasetOptions: {
            pointRadius: 0.5,
            backgroundColor: DESIGN.COLOR.red['10'],
            borderColor: DESIGN.COLOR.red['10'],
            order: 2,
          },
          intervalTime: 1000 * 60 * 60,
          title: 'visitors',
          apiCategory: 'project',
          connectionKey: 'previousTotal',
          apiKey: 'api/json/visitor_5m/{stime}/{etime}',
          params: {
            etime: startOfToday().getTime(),
            stime: subDays(startOfToday(), 1).getTime(),
          },
          responseParser:
            API_RESPONSE_PARSERS[
              'api/json/visitor_5m/{stime}/{etime}-into-time-series'
            ],
        },
        {
          type: 'line',
          title: 'visitors',
          apiCategory: 'project',
          apiKey: 'api/json/visitor_5m/{stime}/{etime}',
          params: {
            etime: Date.now(),
            stime: startOfToday().getTime(),
          },
          datasetOptions: {
            pointRadius: 0.5,
            fill: 'start',
            order: 1,
          },
          responseParser:
            API_RESPONSE_PARSERS[
              'api/json/visitor_5m/{stime}/{etime}-into-time-series'
            ],
          recurParams: (args) => {
            return {
              stime: ((args?.stime as number) || 0) + 1000 * 5,
              etime: ((args?.etime as number) || 0) + 1000 * 5,
            };
          },
        },
      ],
    },
  },
  activeUsers1h: {
    labelKey: 'api/json/visitor_h/{stime}/{etime}',
    header: {
      title: '활성 사용자 (1시간 단위)',
    },
    body: {
      type: 'line',
      dataConfigs: [
        {
          title: 'visitors',
          apiCategory: 'project',
          apiKey: 'api/json/visitor_h/{stime}/{etime}',
          params: {
            etime: Date.now(),
            stime: startOfToday().getTime(),
          },
          responseParser:
            API_RESPONSE_PARSERS[
              'api/json/visitor_h/{stime}/{etime}-into-time-series'
            ],
          recurParams: (args) => {
            return {
              stime: ((args?.stime as number) || 0) + 1000 * 5,
              etime: ((args?.etime as number) || 0) + 1000 * 5,
            };
          },
        },
      ],
    },
  },
  activeThread: {
    labelKey: 'api/threadpool_active',
    header: {
      title: '활성 쓰레드 수',
    },
    body: {
      type: 'line',
      dataConfigs: [
        {
          maxStackSize: 10,
          title: API_CATEGORIES['project']['api/threadpool_active'],
          apiCategory: 'project',
          apiKey: 'api/threadpool_active',
        },
      ],
    },
  },
  queueingThread: {
    labelKey: 'api/threadpool_queue',
    header: {
      title: '큐잉 스레드 수',
    },
    body: {
      type: 'line',
      dataConfigs: [
        {
          maxStackSize: 20,
          title: API_CATEGORIES['project']['api/threadpool_queue'],
          apiCategory: 'project',
          apiKey: 'api/threadpool_queue',
        },
      ],
    },
  },
};
