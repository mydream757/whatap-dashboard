// 필수적인 차트 타입.
import { API_CATEGORIES } from '../../api/constants';
import { ChartTypeRegistry } from 'chart.js';

/* ## informatics chart ##
 *  지표 이름과 값을 단순 텍스트 형식으로 표시
 *  - 특정 지표를 클릭했을 때, 라인 차트 형식 (시계열) 으로 실시간 별도 표시하는 기능 있으면 좋을 듯=
 *  */

export type ApiCategoryKeys = keyof typeof API_CATEGORIES;
export type DataConfig<Category extends ApiCategoryKeys = ApiCategoryKeys> = {
  apiCategory: Category;
  apiUrl: keyof typeof API_CATEGORIES[Category];
  dataType?: 'series' | 'active';
  backgroundColor?: string;
  description?: string;
  title: string;
};

export interface InformaticsDataConfig extends DataConfig {
  type: 'informatics';
}

export interface ChartDataConfig<Widget extends keyof ChartTypeRegistry>
  extends DataConfig {
  type?: Widget;
  options?: ChartTypeRegistry[Widget];
}

export type WidgetDataConfig =
  | ChartDataConfig<'line'>
  | ChartDataConfig<'bar'>
  | InformaticsDataConfig;
