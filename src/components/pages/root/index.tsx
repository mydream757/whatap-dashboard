import React, { ReactElement, useEffect } from 'react';
import { useConnection } from '../../../contexts/connectionContext';
import { NavLink, useLoaderData } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import DashboardHeader from './Header';
import DashboardContent from './Content';
import { MenuItemType } from 'antd/es/menu/hooks/useItems';
import { DEMO_ACCOUNT_API_TOCKEN } from '../../../constants';
import { getApiModule } from '../../../api';

export type ProjectListItem = {
  apiToken: string;
  createTime: string;
  platform: string;
  productType: string;
  projectCode: number;
  projectName: string;
  status: string;
};

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
    <Layout
      style={{
        flexDirection: 'row',
        height: '100%',
      }}
    >
      <Sidebar
        menus={(projects as ProjectListItem[]).map((project) =>
          getMenuItem(project)
        )}
      />
      <Layout>
        <DashboardHeader />
        <DashboardContent />
      </Layout>
    </Layout>
  );
}
