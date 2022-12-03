import React, { ReactElement, useEffect, useMemo } from 'react';
import { Col, Layout, Row } from 'antd';
import Widget, { WidgetProps } from '../widgets/Widget';
import { format } from 'date-fns';
import { useConnection } from '../../context/connectionContext';
import { useLoaderData } from 'react-router-dom';
import { API_CATEGORIES } from '../../api/constants';

export function dashboardLoader({ params }: any) {
  return params.pcode;
}

export default function Dashboard(): ReactElement {
  const pCode = useLoaderData();
  const { queryConnection, datum, selectProject, clear, config } =
    useConnection();

  useEffect(() => {
    if (typeof Number(pCode) === 'number' && config[Number(pCode)]) {
      selectProject(Number(pCode));

      [
        'cpu',
        'act_agent',
        'act_sql',
        'threadpool_active',
        'cpucore',
        'dbc_active',
        'dbc_idle',
        'tps',
        'txcount',
        'act_socket',
        'act_method',
        'actx',
        'user',
        'threadpool_queue',
      ].forEach((key) =>
        queryConnection(key as keyof typeof API_CATEGORIES['project']['api'])
      );
    }
    return () => clear();
  }, [pCode, config]);

  const parsedBasic = useMemo((): WidgetProps[] => {
    return Object.keys(datum).map((key) => {
      const data = datum[key as keyof typeof datum]?.data;

      return {
        header: {
          title: key,
        },
        body: {
          chartProps: {
            type: 'line' as const,
            data: {
              labels: (data || [])?.map((data) =>
                format(new Date(data.time), 'mm:ss')
              ),
              datasets: [
                {
                  type: 'line',
                  label: key,
                  data: (data || []).map((data) => data.value),
                  borderColor: 'rgb(75, 192, 192)',
                },
              ],
            },
            options: {
              scales: {
                y: {
                  min: -5,
                  stepSize: 5,
                },
              },
            },
            tension: 0.1,
          },
        },
      };
    });
  }, [datum]);

  return (
    <Layout style={{ padding: '8px' }}>
      <Row gutter={[8, 8]} wrap>
        {parsedBasic.map((props, index) => (
          <Col key={`${index}`}>
            <Widget {...props} />
          </Col>
        ))}
      </Row>
    </Layout>
  );
}
