/**
 * visualization.js
 * Renders an interactive, realistically-proportioned SVG resistor
 * with metallic leads, a body, and color bands.
 */

const Visualization = (() => {

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const VIEW_W = 440;
  const VIEW_H = 140;
  const BODY_X = 80;
  const BODY_Y = 34;
  const BODY_W = 280;
  const BODY_H = 72;
  const BAND_W = 16;
  const LEAD_Y = VIEW_H / 2;

  /**
   * Compute x-centers for each band, leaving a wider gap before the
   * tolerance band (and, for 6-band, keeping the temp-coefficient
   * band close beside it) — mirroring how resistors are printed.
   */
  function bandPositions(count) {
    const hasTemp = count === 6;
    const toleranceIdx = hasTemp ? count - 2 : count - 1;
    const margin = 26;
    const usable = BODY_W - margin * 2;

    // Build a list of "slots": normal bands get weight 1, the gap
    // before the tolerance band gets an extra weight.
    const gapWeight = 1.6;
    let totalWeight = count - 1 + gapWeight; // (count-1) gaps between bands
    const step = usable / totalWeight;

    const positions = [];
    let x = BODY_X + margin;
    for (let i = 0; i < count; i++) {
      positions.push(x);
      const isGapBeforeTolerance = i === toleranceIdx - 1;
      x += isGapBeforeTolerance ? step * gapWeight : step;
    }
    return positions;
  }

  function el(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  }

  /**
   * Build (or rebuild) the resistor SVG inside containerEl for the
   * given band type, then apply the given colors.
   */
  function render(containerEl, colors) {
    const count = colors.length;
    containerEl.innerHTML = '';

    const svg = el('svg', {
      viewBox: `0 0 ${VIEW_W} ${VIEW_H}`,
      class: 'resistor-svg',
      role: 'img',
      'aria-label': `Resistor with ${count} color bands: ${colors.map(labelFor).join(', ')}`,
    });

    const defs = el('defs', {});
    defs.innerHTML = `
      <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#DDE3EA"/>
        <stop offset="50%" stop-color="#8B93A1"/>
        <stop offset="100%" stop-color="#DDE3EA"/>
      </linearGradient>
      <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#E8D9B8"/>
        <stop offset="45%" stop-color="#D8C298"/>
        <stop offset="100%" stop-color="#C4A96E"/>
      </linearGradient>
      <linearGradient id="bodySheen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.25"/>
        <stop offset="15%" stop-color="#FFFFFF" stop-opacity="0"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
    `;
    svg.appendChild(defs);

    // Leads
    svg.appendChild(el('line', { x1: 0, y1: LEAD_Y, x2: BODY_X + 6, y2: LEAD_Y, stroke: 'url(#leadGrad)', 'stroke-width': 6, 'stroke-linecap': 'round' }));
    svg.appendChild(el('line', { x1: BODY_X + BODY_W - 6, y1: LEAD_Y, x2: VIEW_W, y2: LEAD_Y, stroke: 'url(#leadGrad)', 'stroke-width': 6, 'stroke-linecap': 'round' }));

    // Body
    svg.appendChild(el('rect', {
      x: BODY_X, y: BODY_Y, width: BODY_W, height: BODY_H, rx: BODY_H / 2,
      fill: 'url(#bodyGrad)', stroke: '#00000022', 'stroke-width': 1,
    }));
    svg.appendChild(el('rect', {
      x: BODY_X, y: BODY_Y, width: BODY_W, height: BODY_H, rx: BODY_H / 2,
      fill: 'url(#bodySheen)',
    }));

    // Bands
    const positions = bandPositions(count);
    positions.forEach((x, i) => {
      const band = el('rect', {
        class: `band band-${i}`,
        x: x - BAND_W / 2, y: BODY_Y - 2, width: BAND_W, height: BODY_H + 4,
        rx: 2, fill: colorHex(colors[i]),
      });
      svg.appendChild(band);
    });

    containerEl.appendChild(svg);
  }

  /** Update band colors on an already-rendered SVG (smooth transition). */
  function update(containerEl, colors) {
    const svg = containerEl.querySelector('svg');
    if (!svg || svg.querySelectorAll('.band').length !== colors.length) {
      render(containerEl, colors);
      return;
    }
    colors.forEach((c, i) => {
      const band = svg.querySelector(`.band-${i}`);
      if (band) band.setAttribute('fill', colorHex(c));
    });
    svg.setAttribute('aria-label', `Resistor with ${colors.length} color bands: ${colors.map(labelFor).join(', ')}`);
  }

  function colorHex(key) {
    const c = ResistorData.get(key);
    return c ? c.hex : '#333333';
  }
  function labelFor(key) {
    const c = ResistorData.get(key);
    return c ? c.name : 'unset';
  }

  return { render, update, bandPositions };
})();
