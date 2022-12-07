import React, { ReactElement } from 'react';
import { Header } from 'antd/lib/layout/layout';

export default function DashboardHeader(): ReactElement {
  return (
    <Header
      style={{
        padding: '0 10px',
        background: 'white',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        Dashboard Header
      </div>
    </Header>
  );
}
