import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import { MenuItemType } from 'antd/es/menu/hooks/useItems';
import Sider from 'antd/lib/layout/Sider';

interface SidebarProps {
  menus: MenuItemType[];
}

/* TODO: research project listing */
const DEFAULT_MENUS: MenuItemType[] = [
  {
    key: 'guide',
    icon: <FolderOutlined />,
    label: <Link to={'guide'}>Guide</Link>,
  },
];
const LAYOUT_BREAK_POINT = 'sm';
const SIDE_WIDTH = 200;

export default function Sidebar({ menus }: SidebarProps): ReactElement {
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
            <img width={'100%'} src={'/images/logo_header.svg'} />
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
