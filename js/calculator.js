/**
 * calculator.js
 * Converts a set of selected band colors into a resistance value,
 * tolerance, temperature coefficient and a step-by-step explanation.
 */

const Calculator = (() => {

  /**
   * @param {string[]} colors - array of color keys, length 4, 5 or 6
   * @returns {object|null} result object, or null if input incomplete
   */
  function calculate(colors) {
    const bandType = colors.length;
    const roles = ResistorData.BAND_ROLES[bandType];
    if (!roles) return null;
    if (colors.some(c => !c)) return null;

    const bands = colors.map((key, i) => ({
      key,
      role: roles[i],
      data: ResistorData.get(key),
    }));

    if (bands.some(b => !b.data)) return null;

    const digitBands = bands.filter(b => b.role === 'digit');
    const multiplierBand = bands.find(b => b.role === 'multiplier');
    const toleranceBand = bands.find(b => b.role === 'tolerance');
    const tempBand = bands.find(b => b.role === 'temp');

    // Validate each band can legally play its role
    if (digitBands.some(b => b.data.digit === null)) return { error: 'invalid-digit' };
    if (!multiplierBand || multiplierBand.data.multiplier === null) return { error: 'invalid-multiplier' };
    if (!toleranceBand || toleranceBand.data.tolerance === null) return { error: 'invalid-tolerance' };
    if (tempBand && tempBand.data.temp === null) return { error: 'invalid-temp' };

    const significant = parseInt(digitBands.map(b => b.data.digit).join(''), 10);
    const resistance = significant * multiplierBand.data.multiplier;
    const tolerance = toleranceBand.data.tolerance;
    const temp = tempBand ? tempBand.data.temp : null;

    const steps = digitBands.map((b, i) => ({
      index: i + 1,
      label: `${ordinalLabel(i)} DIGIT`,
      text: `${b.data.name} = ${b.data.digit}`,
    }));

    steps.push({
      index: steps.length + 1,
      label: 'MULTIPLIER',
      text: `${multiplierBand.data.name} = ×${formatMultiplier(multiplierBand.data.multiplier)}`,
    });

    steps.push({
      index: steps.length + 1,
      label: 'TOLERANCE',
      text: `${toleranceBand.data.name} = ${ResistorData.formatTolerance(tolerance)}`,
    });

    if (tempBand) {
      steps.push({
        index: steps.length + 1,
        label: 'TEMP. COEFFICIENT',
        text: `${tempBand.data.name} = ${ResistorData.formatTemp(temp)}`,
      });
    }

    const calcLine = `${significant} × ${formatMultiplier(multiplierBand.data.multiplier)} = ${resistance.toLocaleString('en-US', { maximumFractionDigits: 3 })} Ω`;

    return {
      bandType,
      colors,
      significant,
      resistance,
      tolerance,
      temp,
      steps,
      calcLine,
      resistanceLabel: ResistorData.formatOhms(resistance),
      toleranceLabel: ResistorData.formatTolerance(tolerance),
      tempLabel: temp !== null ? ResistorData.formatTemp(temp) : null,
      finalLabel: `${ResistorData.formatOhms(resistance)} ${ResistorData.formatTolerance(tolerance)}`,
    };
  }

  function ordinalLabel(i) {
    const words = ['FIRST', 'SECOND', 'THIRD'];
    return words[i] || `${i + 1}TH`;
  }

  function formatMultiplier(m) {
    if (m >= 1) return m.toLocaleString('en-US');
    return m.toString();
  }

  return { calculate };
})();
