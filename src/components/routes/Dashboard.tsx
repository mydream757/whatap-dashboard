import React, { ReactElement, useEffect, useState } from 'react';
import { Col, Layout, Row } from 'antd';
import Widget, { WidgetProps } from '../widgets/Widget';
import { useConnection } from '../../context/connectionContext';
import { useLoaderData } from 'react-router-dom';
import { API_CATEGORIES } from '../../api/constants';
import { format } from 'date-fns';

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
          title: 'DB 커넥션',
          apiCategory: 'project',
          apiUrl: 'api/act_dbc',
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
      title: '최근 사용자 (5분)',
    },
    body: {
      type: 'line',
      labels: [],
      options: {
        scales: {
          y: {
            min: 0,
            suggestedMax: 800,
          },
        },
      },
      dataConfigs: [
        {
          title: 'recent',
          apiCategory: 'project',
          apiUrl: 'api/user',
        },
      ],
    },
  },
  {
    colSpan: 12,
    header: {
      title: 'DB Connection',
    },
    body: {
      type: 'line',
      labels: [],
      dataConfigs: [
        {
          title: API_CATEGORIES['project']['api/dbc_count'],
          apiCategory: 'project',
          apiUrl: 'api/dbc_count',
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
      labels: [],
      dataConfigs: [
        {
          stack: false,
          title: API_CATEGORIES['project']['api/dbc_count'],
          apiCategory: 'project',
          apiUrl: 'api/json/exception/{stime}/{etime}',
          params: {
            etime: Date.now(),
            stime: Date.now() - 1000 * 60,
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
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    async function initialize() {
      if (typeof Number(pCode) === 'number' && config[Number(pCode)]) {
        await selectProject(Number(pCode));
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
            });
          });
        });
      }
    }

    initialize();
    const timeout = setInterval(() => {
      setLabels((prevState) => [...prevState, format(new Date(), 'mm:ss')]);
    }, 5000);

    return () => {
      clear();
      clearInterval(timeout);
    };
  }, [pCode, config]);

  return (
    <Layout style={{ padding: '8px' }}>
      <Row gutter={[8, 8]} wrap>
        {widgetList.map(({ colSpan, header, body }, index) => (
          <Col span={colSpan} key={`${pCode}-${index}`}>
            <Widget
              key={`${pCode}-${index}`}
              header={header}
              body={{
                ...body,
                labels,
              }}
            />
          </Col>
        ))}
      </Row>
    </Layout>
  );
}
