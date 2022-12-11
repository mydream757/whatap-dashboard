import { Col, Row } from 'antd';
import React, { ReactElement, ReactNode } from 'react';

interface GridLayoutProps {
  colSpan?: number | (number | undefined)[];
  children?: ReactNode;
}

const DEFAULT_COL_SPAN = 12;

export default function FlexibleGridContainer({
  colSpan,
  children,
}: GridLayoutProps): ReactElement {
  const elements = Array.isArray(children) ? children : [children];
  const spans = Array.isArray(colSpan) ? colSpan : [colSpan];

  return (
    <Row gutter={[8, 8]} wrap>
      {elements.map((element, index) => (
        <Col span={spans.at(index) || DEFAULT_COL_SPAN} key={`${index}`}>
          {element}
        </Col>
      ))}
    </Row>
  );
}
