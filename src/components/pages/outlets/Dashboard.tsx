import React, { ReactElement, useEffect, useState } from 'react';
import { Layout } from 'antd';
import { useConnection } from '../../../contexts/connectionContext';
import { useLoaderData } from 'react-router-dom';
import WidgetConfig from '../../../constants/widgets';
import { WidgetList } from '../../list/WidgetList';

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

export default function Dashboard(): ReactElement {
  const pCode = useLoaderData();
  const { selectProject, apiTokenMap, clear, queryConnection, dataRecord } =
    useConnection();

  const [widgetList] = useState(() => {
    return initialList.map((key) => WidgetConfig[key]);
  });

  useEffect(() => {
    if (typeof Number(pCode) === 'number' && apiTokenMap[Number(pCode)]) {
      selectProject(Number(pCode));
      widgetList.forEach((config) => {
        config.body.dataConfigs.forEach((config) => {
          queryConnection({
            pcode: Number(pCode),
            category: config.apiCategory,
            key: config.apiUrl,
            timeout: 5000,
            params: config.params,
            recurParams: config.recurParams,
            updateData: config.stack,
            responseParser: config.responseParser,
          });
        });
      });
    }

    return () => {
      clear();
    };
  }, [pCode, apiTokenMap, widgetList]);

  return (
    <Layout style={{ padding: '8px' }}>
      <WidgetList list={widgetList} datum={dataRecord} colSpans={colSpans} />
    </Layout>
  );
}
