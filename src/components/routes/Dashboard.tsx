import React, { ReactElement, useEffect, useMemo } from 'react';
import { Col, Layout, Row } from 'antd';
import Widget, { WidgetProps } from '../widgets/Widget';
import { format } from 'date-fns';
import { useConnection } from '../../context/connectionContext';

export default function Dashboard(): ReactElement {
  const { queryConnection, datum } = useConnection();

  useEffect(() => {
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
    ].forEach((key) => queryConnection(key as unknown as any));
  }, []);

  const parsedCommon = useMemo((): WidgetProps[] => {
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
          },
        },
      };
    });
  }, [datum]);

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
