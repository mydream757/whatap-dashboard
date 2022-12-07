import React, { ReactElement, useEffect, useState } from 'react';
import { Layout } from 'antd';
import { DataRecord, useConnection } from '../../context/connectionContext';
import { useLoaderData } from 'react-router-dom';
import Widget from '../../components/widget';
import GridContainer from '../../components/containers';
import WidgetConfig, { WidgetListItem } from '../../constants/widgets';

export function dashboardLoader({ params }: { params: { pcode: string } }) {
  return params.pcode;
}

const colSpans = [6, 6, 12, 12, 12, 12];
const initialList: WidgetListItem[] = [
  WidgetConfig['activeStatus'],
  WidgetConfig['transaction'],
  WidgetConfig['exception'],
  WidgetConfig['clientIP'],
  WidgetConfig['activeUsers5m'],
  WidgetConfig['activeUsers1h'],
];

export default function Dashboard(): ReactElement {
  const pCode = useLoaderData();
  const { selectProject, config, clear, queryConnection, datum } =
    useConnection();

  const [widgetList] = useState(initialList);

  useEffect(() => {
    if (typeof Number(pCode) === 'number' && config[Number(pCode)]) {
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
  }, [pCode, config, widgetList]);

  return (
    <Layout style={{ padding: '8px' }}>
      <GridContainer colSpan={colSpans}>
        {widgetList.map(({ header, body, labelKey }, index) => {
          const labels = labelKey
            ? (datum[labelKey] || []).map((data) => data.label || data.time)
            : [];
          const chartRecord: DataRecord = {};
          body.dataConfigs.forEach((config) => {
            chartRecord[config.apiUrl] = datum[config.apiUrl];
          });

          return (
            <Widget
              key={`${pCode}-${index}`}
              header={header}
              body={{
                ...body,
                labels,
                chartRecord,
              }}
            />
          );
        })}
      </GridContainer>
    </Layout>
  );
}
