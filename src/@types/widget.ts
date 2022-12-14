import { IconButtonProps } from './icon';
import { HeaderProps } from '../components/complex/widget/WidgetHeader';
import { WidgetBodyProps } from '../components/complex/widget/WidgetBody';
import { DataRecord } from './connection';

export interface WidgetProps {
  header?: HeaderProps;
  body: WidgetBodyProps;
}

export interface WidgetListProps {
  datum: DataRecord;
  list: WidgetListItem[];
  colSpans: number[];
}

export interface WidgetListItem extends WidgetProps {
  labelKey?: string;
}

export type WidgetListItemRegistry = {
  [key: string]: WidgetListItem;
};

export type WidgetFeatureProps =
  | ({ type: 'iconButton' } & IconButtonProps)
  | { type: 'toggle' };
