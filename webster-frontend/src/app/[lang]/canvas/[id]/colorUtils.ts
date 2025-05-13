// Helper to check if two colors match
export const colorsMatch = (color1: number[], color2: number[]) => {
    return (
        color1[0] === color2[0] &&
        color1[1] === color2[1] &&
        color1[2] === color2[2] &&
        color1[3] === color2[3]
    );
};

// Helper to check if color matches with tolerance
export const colorMatchesWithTolerance = (
    color1: number[],
    color2: number[],
    tolerance: number,
) => {
    return (
        Math.abs(color1[0] - color2[0]) <= tolerance &&
        Math.abs(color1[1] - color2[1]) <= tolerance &&
        Math.abs(color1[2] - color2[2]) <= tolerance &&
        Math.abs(color1[3] - color2[3]) <= tolerance
    );
};

// Helper to convert hex color to RGB
export const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
};

// Common colors palette
export const commonColors = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#FF8C00',
    '#FFFF00',
    '#008000',
    '#0000FF',
    '#4B0082',
    '#800080',
    '#FFC0CB',
];
