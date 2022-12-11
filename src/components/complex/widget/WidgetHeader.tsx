import React, { ReactElement } from 'react';
import { Col, Row } from 'antd';
import WidgetFeature, { WidgetFeatureProps } from './WidgetFeature';

export interface HeaderProps {
  title?: string;
  features?: WidgetFeatureProps[];
}

export default function WidgetHeader({
  title,
  features,
}: HeaderProps): ReactElement {
  return (
    <Row style={{ height: '24px' }} align={'middle'} justify={'space-between'}>
      <Col style={{ fontWeight: 'bold' }}>{title}</Col>
      <Col>
        <Row gutter={8} align={'middle'} wrap>
          {(features || []).map((feature, index) => (
            <Col key={index}>
              <WidgetFeature {...feature} />
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  );
}
