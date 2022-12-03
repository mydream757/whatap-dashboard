import React, { ReactElement, useMemo } from 'react';
import { Col, Layout, Row } from 'antd';
import Widget, { WidgetProps } from '../widgets/Widget';
import { format } from 'date-fns';
import { useSpotConnections } from '../../hooks/useSpotConnections';

export default function Dashboard(): ReactElement {
  const apiResult = useSpotConnections({
    apis: [
      'cpu',
      'act_agent',
      'act_sql',
      'threadpool_active',
      'cpucore',
      'dbc_active',
      'dbc_idle',
      'tps',
      'txcount',
    ],
  });

  const parsedCommon = useMemo((): WidgetProps[] => {
    return Object.keys(apiResult).map((key) => {
      const data = apiResult[key as keyof typeof apiResult]?.data;

      return {
        header: {
          title: key,
        },
        body: {
          chartProps: {
            type: 'bar' as const,
            data: {
              labels: data?.map((data) => format(new Date(data.time), 'mm:ss')),
              datasets: [
                {
                  type: 'bar',
                  label: key,
                  data: (data || []).map((data) => data.value),
                  borderColor: 'rgb(75, 192, 192)',
                },
              ],
            },
          },
        },
      };
    });
  }, [apiResult]);

  return (
    <Layout style={{ padding: '8px' }}>
      <Row gutter={[8, 8]} wrap>
        {parsedCommon.map((props, index) => (
          <Col key={`${index}`}>
            <Widget {...props} />
          </Col>
        ))}
      </Row>
    </Layout>
  );
}
