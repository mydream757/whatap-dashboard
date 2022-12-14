import React, { ReactElement } from 'react';
import { DataRecord, WidgetListItem, WidgetListProps } from '../../@types';
import { FlexibleGridContainer } from '../container';
import { Widget } from '../complex';

const getItemData = ({
  labelKey,
  apiKeys,
  connectionResults,
}: {
  labelKey?: string;
  apiKeys?: string[];
  connectionResults: DataRecord;
}): Pick<WidgetListItem['body'], 'labels' | 'dataRecord'> => {
  // api 응답 결과 중, label 용도로 사용할 요청 결과물로 label 배열 생성
  const labels = labelKey
    ? connectionResults[labelKey]?.map((spot) => {
        //label 값이 없을 경우, 시간(time) 값으로 대체
        return spot.label || spot.time;
      })
    : []; // labelKey 가 없으면 label 을 그리지 않는다.

  // api 응답 결과 중, 특정 차트를 그리기 위해 필요한 데이터만 새로운 객체로 복사
  const dataRecord: DataRecord = {};
  apiKeys?.forEach((apiKey) => {
    dataRecord[apiKey] = connectionResults[apiKey];
  });

  return {
    labels,
    dataRecord,
  };
};

export function WidgetList({
  list,
  datum,
  colSpans,
}: WidgetListProps): ReactElement {
  return (
    <FlexibleGridContainer colSpan={colSpans}>
      {list.map(({ header, body, labelKey }, index) => {
        const queryKeys = body.dataConfigs.map(
          ({ apiKey, connectionKey }) => connectionKey || apiKey
        );
        return (
          <Widget
            key={`${index}`}
            header={header}
            body={{
              ...body,
              ...getItemData({
                labelKey,
                apiKeys: queryKeys,
                connectionResults: datum,
              }),
            }}
          />
        );
      })}
    </FlexibleGridContainer>
  );
}
