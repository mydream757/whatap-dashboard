type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

export type Color = RGB | RGBA | HEX;

type BasicColor = 'black' | 'grey' | 'mint' | 'red';
type Tone = 10 | 100;

type ColorPalette = {
  [tone in Tone]: Color;
};

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

const DESIGN = {
  COLOR: COLOR_REGISTRY,
} as const;

export default DESIGN;
