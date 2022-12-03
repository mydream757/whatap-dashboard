import React, { ReactElement, useEffect } from 'react';
import { FolderOutlined } from '@ant-design/icons';

import { Layout, Menu } from 'antd';
import { LAYOUT_BREAK_POINT, SIDE_WIDTH } from '../../config/constants';
import { MenuItemType } from 'antd/es/menu/hooks/useItems';
import { Link, Outlet, useLoaderData } from 'react-router-dom';
import api from '../../api';
import { useConnection } from '../../context/connectionContext';

const { Header, Content, Sider } = Layout;

type ProjectListItem = {
  apiToken: string;
  createTime: string;
  platform: string;
  productType: string;
  projectCode: number;
  projectName: string;
  status: string;
};

/* TODO: research project listing */
const DEFAULT_MENUS: MenuItemType[] = [
  {
    key: 'guide',
    icon: <FolderOutlined />,
    label: <Link to={'guide'}>Guide</Link>,
  },
];

interface SidebarProps {
  projects: ProjectListItem[];
}

const getMenuItem = ({
  projectCode,
  projectName,
  onClick,
}: ProjectListItem & { onClick?: () => void }): MenuItemType => {
  return {
    key: `${projectCode}`,
    label: (
      <Link onClick={onClick} to={`dashboard/${projectCode}`}>
        ${projectName}
      </Link>
    ),
  };
};

function Sidebar({ projects }: SidebarProps): ReactElement {
  const menus = projects.map((project) =>
    getMenuItem({
      ...project,
    })
  );
  const defaultSelected = menus.length > 0
? [menus[0].key as string]
: [];

  return (
    <Sider breakpoint={LAYOUT_BREAK_POINT} collapsedWidth={SIDE_WIDTH}>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="logo">Logo</div>
        <Menu
          theme="dark"
          mode={'inline'}
          style={{
            overflow: 'auto',
          }}
          defaultSelectedKeys={defaultSelected}
          items={[
            ...DEFAULT_MENUS,
            {
              key: 'projects',
              icon: <FolderOutlined />,
              label: 'Projects',
              children: menus,
            },
          ]}
        />
      </div>
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

export async function rootLoader() {
  const result = await api.accountMeta('projects');
  return result.data.data || ([] as ProjectListItem[]);
}

export default function Root(): ReactElement {
  const { setApiTokenMap } = useConnection();
  const projects = useLoaderData();

  useEffect(() => {
    if (projects) {
      const tokenMap: { [key: string]: string } = {};
      (projects as ProjectListItem[]).forEach((project) => {
        tokenMap[project.projectCode] = project.apiToken;
      });
      setApiTokenMap(tokenMap);
    }
  }, [projects]);

  return (
    <Layout style={{ height: '100%' }}>
      <Sidebar projects={projects as ProjectListItem[]} />
      <Layout>
        <DashboardHeader />
        <DashboardContent />
      </Layout>
    </Layout>
  );
}
