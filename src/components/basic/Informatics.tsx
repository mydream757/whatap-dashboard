import React, { ReactElement } from 'react';
import { Col, Row, Space } from 'antd';
import { InformaticsProps } from '../../@types/chart/informatics';

export function Informatics({ datum }: InformaticsProps): ReactElement {
  return (
    <Space
      style={{
        width: '100%',
      }}
      size={4}
      direction={'vertical'}
    >
      {datum.map((data, index) => {
        return (
          <div
            style={{
              padding: '8px',
              border: '1px solid #f0f0f0',
              borderRadius: '4px',
            }}
            key={`${data.title}-${index}`}
          >
            <Row>
              <Col flex={2}>{data.title}</Col>
              <Col
                style={{
                  display: 'flex',
                  justifyContent: 'end',
                }}
                flex={1}
              >
                {data.value}
              </Col>
            </Row>
          </div>
        );
      })}
    </Space>
  );
}
