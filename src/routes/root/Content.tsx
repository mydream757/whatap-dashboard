import React, { ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import { Content } from 'antd/lib/layout/layout';

export default function DashboardContent(): ReactElement {
  return (
    <Content style={{ overflow: 'auto' }}>
      <Outlet />
    </Content>
  );
}
