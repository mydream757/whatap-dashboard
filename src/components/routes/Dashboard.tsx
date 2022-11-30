import React, { ReactElement } from 'react';
import { Col, Layout, Row } from 'antd';
import Widget, { WidgetProps } from '../widgets/Widget';

const testWidgetDatum: WidgetProps[] = [
  {
    header: {
      title: 'Widget 1',
      features: [
        {
          type: 'iconButton',
          iconKey: 'arrow-right',
        },
      ],
    },
    body: {
      data: '',
    },
  },
];

export default function Dashboard(): ReactElement {
  return (
    <Layout style={{ padding: '8px' }}>
      <Row gutter={8} wrap>
        {testWidgetDatum.map((props, index) => (
          <Col flex={1} key={`${index}`}>
            <Widget {...props} />
          </Col>
        ))}
      </Row>
    </Layout>
  );
}
