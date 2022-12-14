import React, { ForwardRefExoticComponent, ReactElement } from 'react';
import Icon from '@ant-design/icons';
import { IconRegistry } from '../../constants';
import { IconButtonProps } from '../../@types';

/* TODO: 필요 시 antd 를 통해 사용할 index key 와 컴포넌트 스펙 등록 */
export function IconButton({
  iconKey,
  onClick,
}: IconButtonProps): ReactElement {
  return (
    <button
      style={{
        cursor: 'pointer',
        background: 'rgba(0, 0, 0, 0)',
        border: 'none',
        color: 'rgb(117, 117, 117)',
        display: 'flex',
        borderRadius: '4px',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        outline: 'none',
        padding: '0px 4px',
        transition: 'all 0.1s ease-out 0s',
      }}
      onClick={onClick}
    >
      <Icon
        component={IconRegistry[iconKey] as ForwardRefExoticComponent<any>}
      />
    </button>
  );
}
