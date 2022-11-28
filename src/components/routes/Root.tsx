import React, { ReactElement } from 'react';
import { FolderOutlined } from '@ant-design/icons';

import { Layout, Menu } from 'antd';
import { LAYOUT_BREAK_POINT, SIDE_WIDTH } from '../../config/constants';
import { MenuItemType } from 'antd/es/menu/hooks/useItems';

const { Header, Content, Sider } = Layout;

/* TODO: research project listing */
const SAMPLE_PROJECT_KEY = 'project-id-1';
const items: MenuItemType[] = [
  {
    key: SAMPLE_PROJECT_KEY,
    icon: <FolderOutlined />,
    label: 'project-name',
  },
];

function Sidebar(): ReactElement {
  return (
    <Sider
      breakpoint={LAYOUT_BREAK_POINT}
      collapsedWidth={SIDE_WIDTH}
      onBreakpoint={(broken) => {
        console.log(broken);
      }}
      onCollapse={(collapsed, type) => {
        console.log(collapsed, type);
      }}
    >
      <div className="logo">Logo</div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={[SAMPLE_PROJECT_KEY]}
        items={items}
      />
    </Sider>
  );
}

function DashboardHeader(): ReactElement {
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

function DashboardContent(): ReactElement {
  return (
    <Content
      style={{
        margin: '24px 16px 0',
      }}
    >
      <div
        className="site-layout-background"
        style={{
          padding: 24,
          minHeight: 360,
        }}
      >
        content
      </div>
    </Content>
  );
}

export default function Root(): ReactElement {
  return (
    <Layout style={{ height: '100%' }}>
      <Sidebar />
      <Layout>
        <DashboardHeader />
        <DashboardContent />
      </Layout>
    </Layout>
  );
}
