/**
 * resistor-data.js
 * RESISTOR LAB — core color-code reference data.
 * Single source of truth for digit, multiplier, tolerance and
 * temperature-coefficient values used across the whole app.
 */

const RESISTOR_COLORS = [
  { key: 'black',  name: 'Black',  hex: '#1C1C1C', digit: 0, multiplier: 1,          tolerance: null, temp: 250, text: '#F8FAFC' },
  { key: 'brown',  name: 'Brown',  hex: '#7B4A2D', digit: 1, multiplier: 10,         tolerance: 1,    temp: 100, text: '#F8FAFC' },
  { key: 'red',    name: 'Red',    hex: '#E11D2E', digit: 2, multiplier: 100,        tolerance: 2,    temp: 50,  text: '#F8FAFC' },
  { key: 'orange', name: 'Orange', hex: '#F26A1B', digit: 3, multiplier: 1000,       tolerance: null, temp: 15,  text: '#0B1120' },
  { key: 'yellow', name: 'Yellow', hex: '#F4D925', digit: 4, multiplier: 10000,      tolerance: null, temp: 25,  text: '#0B1120' },
  { key: 'green',  name: 'Green',  hex: '#1E9E4C', digit: 5, multiplier: 100000,     tolerance: 0.5,  temp: 20,  text: '#F8FAFC' },
  { key: 'blue',   name: 'Blue',   hex: '#2563EB', digit: 6, multiplier: 1000000,    tolerance: 0.25, temp: 10,  text: '#F8FAFC' },
  { key: 'violet', name: 'Violet', hex: '#7C3AED', digit: 7, multiplier: 10000000,   tolerance: 0.1,  temp: 5,   text: '#F8FAFC' },
  { key: 'gray',   name: 'Gray',   hex: '#8B93A1', digit: 8, multiplier: null,       tolerance: 0.05, temp: 1,   text: '#0B1120' },
  { key: 'white',  name: 'White',  hex: '#F8FAFC', digit: 9, multiplier: null,       tolerance: null, temp: null, text: '#0B1120' },
  { key: 'gold',   name: 'Gold',   hex: '#C9A227', digit: null, multiplier: 0.1,     tolerance: 5,    temp: null, text: '#0B1120' },
  { key: 'silver', name: 'Silver', hex: '#B8C0CC', digit: null, multiplier: 0.01,    tolerance: 10,   temp: null, text: '#0B1120' },
];

const ResistorData = (() => {
  const byKey = Object.fromEntries(RESISTOR_COLORS.map(c => [c.key, c]));

  /** Colors that can be used as a normal significant-digit band. */
  const DIGIT_COLORS = RESISTOR_COLORS.filter(c => c.digit !== null).map(c => c.key);
  /** Colors that can be used as a multiplier band. */
  const MULTIPLIER_COLORS = RESISTOR_COLORS.filter(c => c.multiplier !== null).map(c => c.key);
  /** Colors that can be used as a tolerance band. */
  const TOLERANCE_COLORS = RESISTOR_COLORS.filter(c => c.tolerance !== null).map(c => c.key);
  /** Colors that can be used as a temperature-coefficient band (6-band only). */
  const TEMP_COLORS = RESISTOR_COLORS.filter(c => c.temp !== null).map(c => c.key);

  function get(key) {
    return byKey[key] || null;
  }

  /** Roles a band index plays for a given resistor type. */
  const BAND_ROLES = {
    4: ['digit', 'digit', 'multiplier', 'tolerance'],
    5: ['digit', 'digit', 'digit', 'multiplier', 'tolerance'],
    6: ['digit', 'digit', 'digit', 'multiplier', 'tolerance', 'temp'],
  };

  const ROLE_LABELS = {
    digit: 'Digit',
    multiplier: 'Multiplier',
    tolerance: 'Tolerance',
    temp: 'Temp. Coefficient',
  };

  /** Sensible default color selections per resistor type. */
  const DEFAULTS = {
    4: ['brown', 'black', 'red', 'gold'],
    5: ['brown', 'black', 'black', 'red', 'brown'],
    6: ['red', 'violet', 'yellow', 'black', 'red', 'black'],
  };

  /** Format an ohm value into an engineering-friendly string (Ω / kΩ / MΩ). */
  function formatOhms(value) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    const abs = Math.abs(value);
    let out;
    if (abs >= 1e6) {
      out = trimNum(value / 1e6) + ' MΩ';
    } else if (abs >= 1e3) {
      out = trimNum(value / 1e3) + ' kΩ';
    } else {
      out = trimNum(value) + ' Ω';
    }
    return out;
  }

  /** Trim a float to at most 3 decimal places, no trailing zeros. */
  function trimNum(n) {
    const rounded = Math.round(n * 1000) / 1000;
    return rounded.toString();
  }

  function formatTolerance(t) {
    if (t === null || t === undefined) return '—';
    return '±' + trimNum(t) + '%';
  }

  function formatTemp(t) {
    if (t === null || t === undefined) return '—';
    return t + ' ppm/K';
  }

  return {
    RESISTOR_COLORS,
    DIGIT_COLORS,
    MULTIPLIER_COLORS,
    TOLERANCE_COLORS,
    TEMP_COLORS,
    BAND_ROLES,
    ROLE_LABELS,
    DEFAULTS,
    get,
    formatOhms,
    formatTolerance,
    formatTemp,
  };
})();
