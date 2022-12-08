import { WidgetProps } from '../components/widget/Widget';
import { API_CATEGORIES } from '../api/constants';
import API_RESPONSE_PARSERS from '../parsers';
import { startOfToday } from 'date-fns';

export interface WidgetListItem extends WidgetProps {
  labelKey?: string;
}

type WidgetListItemRegistry = {
  [key: string]: WidgetListItem;
};

const WidgetConfig: WidgetListItemRegistry = {
  activeStatus: {
    header: {
      title: 'Active Status',
    },
    body: {
      type: 'informatics',
      dataConfigs: [
        {
          stack: false,
          title: '메서드',
          apiCategory: 'project',
          apiUrl: 'api/act_method',
        },
        {
          stack: false,
          title: '에이전트',
          apiCategory: 'project',
          apiUrl: 'api/act_agent',
        },
        {
          stack: false,
          title: '5분 간 고유 사용자',
          apiCategory: 'project',
          apiUrl: 'api/user',
        },
        {
          stack: false,
          title: 'Sql',
          apiCategory: 'project',
          apiUrl: 'api/act_sql',
        },
        {
          stack: false,
          title: 'Http 호출',
          apiCategory: 'project',
          apiUrl: 'api/act_httpc',
        },
        {
          stack: false,
          title: '소켓',
          apiCategory: 'project',
          apiUrl: 'api/act_socket',
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
          stack: false,
          title: '총 트랜잭션',
          apiCategory: 'project',
          apiUrl: 'api/txcount',
        },
        {
          stack: false,
          title: '활성 트랜잭션',
          apiCategory: 'project',
          apiUrl: 'api/actx',
        },
        {
          stack: false,
          title: '초당 트랜잭션',
          apiCategory: 'project',
          apiUrl: 'api/tps',
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
          stack: false,
          title: API_CATEGORIES['project']['api/dbc_count'],
          apiCategory: 'project',
          apiUrl: 'api/json/exception/{stime}/{etime}',
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
          stack: false,
          title: 'Client IP',
          apiCategory: 'project',
          apiUrl: 'api/json/remote/{stime}/{etime}',
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
    labelKey: 'api/json/visitor_5m/{stime}/{etime}',
    header: {
      title: '활성 사용자 (5분 단위)',
    },
    body: {
      type: 'line',
      dataConfigs: [
        {
          stack: false,
          title: 'visitors',
          apiCategory: 'project',
          apiUrl: 'api/json/visitor_5m/{stime}/{etime}',
          params: {
            etime: Date.now(),
            stime: startOfToday().getTime(),
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
          stack: false,
          title: 'visitors',
          apiCategory: 'project',
          apiUrl: 'api/json/visitor_h/{stime}/{etime}',
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
          stack: true,
          title: API_CATEGORIES['project']['api/threadpool_active'],
          apiCategory: 'project',
          apiUrl: 'api/threadpool_active',
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
          stack: true,
          title: API_CATEGORIES['project']['api/threadpool_queue'],
          apiCategory: 'project',
          apiUrl: 'api/threadpool_queue',
        },
      ],
    },
  },
};

export default WidgetConfig;