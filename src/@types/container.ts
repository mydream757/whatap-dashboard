import { ReactNode } from 'react';

export interface FlexibleGridContainerProps {
  colSpan?: number | (number | undefined)[];
  children?: ReactNode;
}
