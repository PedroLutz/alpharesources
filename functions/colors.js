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

/**
 * Clareia uma cor hexadecimal.
 * @param hex - A cor em formato '#RRGGBB' ou 'RRGGBB'
 * @param percent - De 0 a 100 (quanto maior, mais clara)
 */
export const lightenHex = (hex, percent) => {
    // Remove o '#' se existir
    hex = hex.replace(/^#/, '');

    // Converte para RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Calcula a nova cor, limitando em 255
    r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

    // Converte de volta para HEX
    const toHex = (c) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Exemplo de uso:
// lightenHex('#3b82f6', 20) -> retorna uma versão 20% mais clara

export {hexToRgb, getTextColor, generateColorGradient}