import React, { ReactElement, useEffect, useState } from 'react';
import { Col, Layout, Row } from 'antd';
import Widget, { WidgetProps } from '../widgets/Widget';
import { useConnection } from '../../context/connectionContext';
import { useLoaderData } from 'react-router-dom';
import { WidgetDataConfig } from '../chart/constants';
import { API_CATEGORIES } from '../../api/constants';
import { format } from 'date-fns';

export function dashboardLoader({ params }: any) {
  return params.pcode;
}

const widgetList: WidgetProps[] = [
  {
    header: {
      title: 'AGENTS',
    },
    body: {
      type: 'informatics',
      dataConfigs: [
        {
          title: 'Active agents',
          apiCategory: 'project',
          apiUrl: 'api/act_agent',
        },
        {
          title: 'Inactive agents',
          apiCategory: 'project',
          apiUrl: 'api/inact_agent',
        },
      ] as WidgetDataConfig[],
    },
  },
  {
    header: {
      title: 'HOST',
    },
    body: {
      type: 'informatics',
      dataConfigs: [
        {
          title: 'hosts',
          apiCategory: 'project',
          apiUrl: 'api/host',
        },
        {
          title: 'SUM: cpu cores',
          apiCategory: 'project',
          apiUrl: 'api/cpucore',
        },
      ] as WidgetDataConfig[],
    },
  },
  {
    header: {
      title: 'TRANSACTION',
    },
    body: {
      type: 'informatics',
      dataConfigs: [
        {
          title: 'Transactions',
          apiCategory: 'project',
          apiUrl: 'api/txcount',
        },
        {
          title: 'tps',
          apiCategory: 'project',
          apiUrl: 'api/tps',
        },
      ] as WidgetDataConfig[],
    },
  },
  {
    header: {
      title: API_CATEGORIES['project']['api/rtime'],
    },
    body: {
      type: 'line',
      labels: [],
      dataConfigs: [
        {
          title: 'rtime',
          apiCategory: 'project',
          apiUrl: 'api/rtime',
        },
      ] as WidgetDataConfig[],
    },
  },
  {
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
        {
          title: API_CATEGORIES['project']['api/dbc_active'],
          apiCategory: 'project',
          backgroundColor: 'rgb(89, 209, 65)',
          apiUrl: 'api/dbc_active',
        },
        {
          title: API_CATEGORIES['project']['api/dbc_idle'],
          apiCategory: 'project',
          backgroundColor: 'rgb(190, 23, 55)',
          apiUrl: 'api/dbc_idle',
        },
      ] as WidgetDataConfig[],
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
            queryConnection(Number(pCode), config.apiCategory, config.apiUrl);
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
        {widgetList.map(({ header, body }, index) => (
          <Col key={`${pCode}-${index}`}>
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
