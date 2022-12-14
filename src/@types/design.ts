type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

type BasicColor = 'black' | 'grey' | 'mint' | 'red';
type Tone = 10 | 100;

type ColorPalette = {
  [tone in Tone]: Color;
};

export type { BasicColor, Color, ColorPalette };
