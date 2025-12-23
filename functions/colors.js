/**
 * Converts hex value to RGB object
 * @param {string} hex - The hex color code.
 * @returns {{r: number, g: number, b: number}} An object with RGB values (0 - 255).
 */
function hexToRgb(hex){
    hex = hex.replace(/^#/, '');

    //convert from format #RGB to #RRGGBB
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return { r, g, b };
}

/**
 * Determines if the text color should be black or white (for contrast).
 * @param {string} hexColor - The hex color code.
 * @returns {string} 'white' or 'black'.
 */
function getTextColor(hexColor) {
    if(!hexColor) return 'white';

    const { r, g, b } = hexToRgb(hexColor);

    const luminosidade = (r * 0.299) + (g * 0.587) + (b * 0.114);
    
    if (luminosidade > 128) {
        return 'black';
    } else {
        return 'white';
    }
}

function generateColorGradient(startHex, endHex, n) {
  // converte RGB -> HEX
  const rgbToHex = (r, g, b) => {
    const toHex = (c) => c.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  const start = hexToRgb(startHex)
  const end = hexToRgb(endHex)
  const colors = []

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const r = Math.round(start.r + (end.r - start.r) * t)
    const g = Math.round(start.g + (end.g - start.g) * t)
    const b = Math.round(start.b + (end.b - start.b) * t)
    colors.push(rgbToHex(r, g, b))
  }

  return colors
}

export {hexToRgb, getTextColor, generateColorGradient}