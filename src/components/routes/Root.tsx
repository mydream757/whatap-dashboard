import React, { ReactElement } from 'react';
import { FolderOutlined } from '@ant-design/icons';

import { Layout, Menu } from 'antd';
import { LAYOUT_BREAK_POINT, SIDE_WIDTH } from '../../config/constants';
import { MenuItemType } from 'antd/es/menu/hooks/useItems';
import { Link, Outlet } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

/* TODO: research project listing */
const SAMPLE_PROJECT_KEY = 'project-id';
const items: MenuItemType[] = [
  {
    key: `${SAMPLE_PROJECT_KEY}-1`,
    icon: <FolderOutlined />,
    label: <Link to={'app'}>App</Link>,
  },
  {
    key: `${SAMPLE_PROJECT_KEY}-2`,
    icon: <FolderOutlined />,
    label: <Link to={'dashboard'}>Dashboard</Link>,
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
    <Content style={{ overflow: 'auto' }}>
      <Outlet />
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
