import React, { ReactElement } from 'react';
import { Card, Col, Row, Statistic } from 'antd';

type InformaticsData = {
  apiKey?: string;
  title: string;
  value: number;
};

interface InformaticsProps {
  loading?: boolean;
  datum: InformaticsData[];
}

export function Informatics({ datum }: InformaticsProps): ReactElement {
  return (
    <Row gutter={8}>
      {datum.map((data, index) => {
        return (
          <Col key={`${data.title}-${index}`}>
            <Card>
              <Statistic title={data.title} value={data.value} />
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
