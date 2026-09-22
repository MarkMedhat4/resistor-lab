/**
 * reverse-calculator.js
 * Converts a resistance value + tolerance + band type back into
 * the resistor color code that produces it.
 */

const ReverseCalculator = (() => {

  const DIGIT_BY_VALUE = Object.fromEntries(
    ResistorData.RESISTOR_COLORS
      .filter(c => c.digit !== null)
      .map(c => [c.digit, c.key])
  );

  const MULTIPLIER_BY_VALUE = Object.fromEntries(
    ResistorData.RESISTOR_COLORS
      .filter(c => c.multiplier !== null)
      .map(c => [c.multiplier, c.key])
  );

  const TOLERANCE_BY_VALUE = Object.fromEntries(
    ResistorData.RESISTOR_COLORS
      .filter(c => c.tolerance !== null)
      .map(c => [c.tolerance, c.key])
  );

  const ALLOWED_EXPONENTS = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7];

  /**
   * @param {number} ohms - target resistance in ohms, must be > 0
   * @param {number} tolerance - tolerance percent, must be a supported value
   * @param {number} bandType - 4 or 5
   * @returns {object} { error } or { colors, resistance, ... }
   */
  function convert(ohms, tolerance, bandType) {
    if (!isFinite(ohms) || ohms <= 0) return { error: 'invalid-value' };
    if (bandType !== 4 && bandType !== 5) return { error: 'invalid-band-type' };
    if (!(tolerance in TOLERANCE_BY_VALUE)) return { error: 'invalid-tolerance' };

    const digitsCount = bandType === 4 ? 2 : 3;
    const maxSig = Math.pow(10, digitsCount) - 1;
    const minSig = Math.pow(10, digitsCount - 1);

    let exponent = Math.floor(Math.log10(ohms)) - (digitsCount - 1);
    let significant = Math.round(ohms / Math.pow(10, exponent));

    if (significant > maxSig) {
      exponent += 1;
      significant = Math.round(ohms / Math.pow(10, exponent));
    }
    if (significant < minSig && exponent > -2) {
      exponent -= 1;
      significant = Math.round(ohms / Math.pow(10, exponent));
    }

    if (!ALLOWED_EXPONENTS.includes(exponent)) {
      return { error: 'out-of-range' };
    }

    const multiplier = Math.pow(10, exponent);
    if (!(multiplier in MULTIPLIER_BY_VALUE)) return { error: 'out-of-range' };

    const digitsStr = significant.toString().padStart(digitsCount, '0');
    if (digitsStr.length !== digitsCount) return { error: 'out-of-range' };

    const digitColors = digitsStr.split('').map(d => DIGIT_BY_VALUE[parseInt(d, 10)]);
    if (digitColors.some(c => !c)) return { error: 'out-of-range' };

    const multiplierColor = MULTIPLIER_BY_VALUE[multiplier];
    const toleranceColor = TOLERANCE_BY_VALUE[tolerance];

    const colors = [...digitColors, multiplierColor, toleranceColor];
    const resultOhms = significant * multiplier;

    return {
      colors,
      bandType,
      significant,
      multiplier,
      resistance: resultOhms,
      tolerance,
      resistanceLabel: ResistorData.formatOhms(resultOhms),
      toleranceLabel: ResistorData.formatTolerance(tolerance),
      finalLabel: `${ResistorData.formatOhms(resultOhms)} ${ResistorData.formatTolerance(tolerance)}`,
    };
  }

  return { convert };
})();
