import React, { ReactElement, useEffect } from 'react';
import { FolderOutlined } from '@ant-design/icons';

import { Layout, Menu } from 'antd';
import { MenuItemType } from 'antd/es/menu/hooks/useItems';
import { Link, NavLink, Outlet, useLoaderData } from 'react-router-dom';
import { useConnection } from '../../context/connectionContext';
import getApiModule from '../../api/getApiModule';
import { DEMO_ACCOUNT_API_TOCKEN } from '../../api/constants';

const { Header, Content, Sider } = Layout;

const LAYOUT_BREAK_POINT = 'sm';
const SIDE_WIDTH = 200;

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
      <NavLink onClick={onClick} to={`dashboard/${projectCode}`}>
        ${projectName}
      </NavLink>
    ),
  };
};

function Sidebar({ projects }: SidebarProps): ReactElement {
  const menus = projects.map((project) =>
    getMenuItem({
      ...project,
    })
  );

  return (
    <Sider breakpoint={LAYOUT_BREAK_POINT} collapsedWidth={SIDE_WIDTH}>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="logo" style={{ padding: '16px' }}>
          <Link to={'/'}>
            <img width={'100%'} src={'/logo_header.svg'} />
          </Link>
        </div>
        <Menu
          theme="dark"
          mode={'inline'}
          style={{
            overflow: 'auto',
          }}
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
  const result = await getApiModule('account', {
    'x-whatap-token': DEMO_ACCOUNT_API_TOCKEN,
  })('api/json/projects');
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
