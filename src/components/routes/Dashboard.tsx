import React, { ReactElement, useEffect } from 'react';
import { Col, Layout, Row } from 'antd';
import Widget, { WidgetProps } from '../widgets/Widget';
import { useConnection } from '../../context/connectionContext';
import { useLoaderData } from 'react-router-dom';
import { API_CATEGORIES } from '../../api/constants';
import { format, startOfToday } from 'date-fns';
import Widget from '../widget';
import { WidgetProps } from '../widget/Widget';
import GridLayout from '../layout';

export function dashboardLoader({ params }: { params: { pcode: string } }) {
  return params.pcode;
}

const widgetList: WidgetProps[] = [
  {
    colSpan: 6,
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
  {
    colSpan: 6,
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
  {
    colSpan: 12,
    header: {
      title: 'Exception',
    },
    body: {
      type: 'line',
      labelKey: 'api/json/exception/{stime}/{etime}',
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

  {
    colSpan: 12,
    header: {
      title: '국가 별 Client',
    },
    body: {
      type: 'bar',
      labelKey: 'api/json/remote/{stime}/{etime}',
      dataConfigs: [
        {
          stack: false,
          title: 'Client IP',
          apiCategory: 'project',
          apiUrl: 'api/json/remote/{stime}/{etime}',
          responseParser: (response: {
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
  {
    colSpan: 12,
    header: {
      title: '활성 사용자 (5분 단위)',
    },
    body: {
      type: 'line',
      labelKey: 'api/json/visitor_5m/{stime}/{etime}',
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
          responseParser: (response: {
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
  {
    colSpan: 12,
    header: {
      title: '활성 사용자 (1시간 단위)',
    },
    body: {
      type: 'line',
      labelKey: 'api/json/visitor_h/{stime}/{etime}',
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
          responseParser: (response: {
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
];

export default function Dashboard(): ReactElement {
  const pCode = useLoaderData();
  const { selectProject, config, clear, queryConnection } = useConnection();

  useEffect(() => {
    if (typeof Number(pCode) === 'number' && config[Number(pCode)]) {
      selectProject(Number(pCode));
      widgetList.forEach((config) => {
        config.body.dataConfigs.forEach((config) => {
          queryConnection({
            pcode: Number(pCode),
            category: config.apiCategory,
            key: config.apiUrl,
            timeout: 5000,
            params: config.params,
            recurParams: config.recurParams,
            updateData: config.stack,
            responseParser: config.responseParser,
          });
        });
      });
    }

    return () => {
      clear();
    };
  }, [pCode, config]);

  return (
    <Layout style={{ padding: '8px' }}>
      <Row gutter={[8, 8]} wrap>
        {widgetList.map(({ colSpan, header, body }, index) => (
          <Col span={colSpan} key={`${pCode}-${index}`}>
            <Widget key={`${pCode}-${index}`} header={header} body={body} />
          </Col>
        ))}
      </Row>
    </Layout>
  );
}
