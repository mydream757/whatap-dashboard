/** Design
 * @description : 전역적으로 참조할 디자인 요소 정의
 */
import { BasicColor, ColorPalette } from '../@types';

const COLOR_REGISTRY: { [color in BasicColor]: ColorPalette } = {
  black: {
    10: 'rgb(31, 31, 31)',
    100: 'rgb(1, 1, 1)',
  } as const,
  mint: {
    10: 'rgb(79, 252, 239)',
    100: 'rgb(34, 185, 177)',
  },
  grey: {
    10: 'rgba(131, 147, 147, 0.69)',
    100: 'rgba(107, 119, 119, 0.69)',
  },
  red: {
    10: 'rgba(246, 34, 34, 0.96)',
    100: 'rgba(176, 21, 21, 0.96)',
  },
} as const;

export const DESIGN = {
  COLOR: COLOR_REGISTRY,
} as const;
