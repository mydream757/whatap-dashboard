import React, { ReactElement, useEffect, useState } from 'react';
import { Layout } from 'antd';
import {
  QueryConnectionArgs,
  useConnection,
} from '../../../contexts/connectionContext';
import { useLoaderData } from 'react-router-dom';
import WidgetConfig from '../../../constants/widgets';
import { WidgetList } from '../../list/WidgetList';
import { ConnectionConfig } from '../../../types';

export function dashboardLoader({ params }: { params: { pcode: string } }) {
  return params.pcode;
}

const colSpans = [6, 6, 12, 12, 12, 12, 12, 12];
const initialList: (keyof typeof WidgetConfig)[] = [
  'activeStatus',
  'transaction',
  'exception',
  'clientIP',
  'activeUsers5m',
  'activeUsers1h',
  'activeThread',
  'queueingThread',
];

const parseConnectionConfig = ({
  apiCategory,
  apiKey,
  params,
  maxStackSize,
  connectionKey,
  recurParams,
  intervalTime,
  responseParser,
}: ConnectionConfig): Omit<QueryConnectionArgs, 'pcode'> => {
  return {
    connectionKey,
    category: apiCategory,
    apiKey: apiKey,
    params: params,
    maxStackSize: maxStackSize,
    recurParams: recurParams,
    intervalTime: intervalTime,
    responseParser: responseParser,
  };
};

export default function Dashboard(): ReactElement {
  const pathParam = useLoaderData();
  const { selectProject, apiTokenMap, clear, queryConnection, dataRecord } =
    useConnection();

  const [widgetList] = useState(() => {
    return initialList.map((key) => WidgetConfig[key]);
  });

  useEffect(() => {
    const pcode = Number(pathParam);
    if (apiTokenMap[pcode]) {
      selectProject(pcode);
      widgetList.forEach((config) => {
        config.body.dataConfigs.forEach((config) => {
          queryConnection({
            ...parseConnectionConfig(config),
            pcode,
          });
        });
      });
    }
    return () => {
      clear();
    };
  }, [pathParam, apiTokenMap, widgetList]);

  return (
    <Layout style={{ padding: '8px' }}>
      <WidgetList list={widgetList} datum={dataRecord} colSpans={colSpans} />
    </Layout>
  );
}
