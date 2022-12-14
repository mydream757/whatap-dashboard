import { IconRegistry } from '../constants';

export type IconKey = keyof typeof IconRegistry;

export interface IconButtonProps {
  iconKey: IconKey;
  onClick?: () => void;
}
