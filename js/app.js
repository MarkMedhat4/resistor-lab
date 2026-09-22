/**
 * app.js
 * Wires together navigation, the calculator, reverse calculator,
 * reference table, lessons and practice quiz.
 */

(() => {
  'use strict';

  /* ======================================================
     NAVIGATION (single-page sections)
     ====================================================== */

  const pages = document.querySelectorAll('[data-page]');
  const navLinks = document.querySelectorAll('[data-nav]');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mainNav = document.getElementById('mainNav');

  function showPage(id) {
    let found = false;
    pages.forEach(p => {
      const match = p.id === id;
      p.classList.toggle('active', match);
      if (match) found = true;
    });
    if (!found) {
      document.getElementById('home').classList.add('active');
      id = 'home';
    }
    navLinks.forEach(a => {
      const target = a.getAttribute('href').replace('#', '');
      a.classList.toggle('nav-active', target === id);
    });
    closeMobileNav();
  }

  function idFromHash() {
    return (window.location.hash || '#home').replace('#', '').split('?')[0];
  }

  window.addEventListener('hashchange', () => showPage(idFromHash()));

  function closeMobileNav() {
    mainNav.classList.remove('open');
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }

  hamburgerBtn.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    hamburgerBtn.classList.toggle('open', open);
    hamburgerBtn.setAttribute('aria-expanded', String(open));
  });

  /* ======================================================
     HERO RESISTOR (static demo)
     ====================================================== */
  Visualization.render(document.getElementById('heroResistor'), ['brown', 'red', 'orange', 'gold']);
  Visualization.render(document.getElementById('lessonResistor'), ['brown', 'red', 'orange', 'gold']);

  /* ======================================================
     CALCULATOR
     ====================================================== */

  const calcResistorEl = document.getElementById('calcResistor');
  const bandLabelsEl = document.getElementById('bandLabels');
  const bandTabsEl = document.getElementById('bandTabs');
  const colorPaletteEl = document.getElementById('colorPalette');
  const explainStepsEl = document.getElementById('explainSteps');
  const calcLineEl = document.getElementById('calcLine');
  const resultResistanceEl = document.getElementById('resultResistance');
  const resultToleranceEl = document.getElementById('resultTolerance');
  const resultTempEl = document.getElementById('resultTemp');
  const resultTempBlock = document.getElementById('resultTempBlock');
  const copyFeedback = document.getElementById('copyFeedback');

  const calcState = {
    bandType: 4,
    colors: [...ResistorData.DEFAULTS[4]],
    activeBand: 0,
  };

  function roleForBand(index) {
    return ResistorData.BAND_ROLES[calcState.bandType][index];
  }

  function isValidForRole(colorData, role) {
    if (role === 'digit') return colorData.digit !== null;
    if (role === 'multiplier') return colorData.multiplier !== null;
    if (role === 'tolerance') return colorData.tolerance !== null;
    if (role === 'temp') return colorData.temp !== null;
    return false;
  }

  function valueLabelForRole(colorData, role) {
    if (role === 'digit') return String(colorData.digit);
    if (role === 'multiplier') return '×' + (colorData.multiplier >= 1 ? colorData.multiplier.toLocaleString('en-US') : colorData.multiplier);
    if (role === 'tolerance') return ResistorData.formatTolerance(colorData.tolerance);
    if (role === 'temp') return colorData.temp + ' ppm/K';
    return '';
  }

  function renderBandTabs() {
    bandTabsEl.innerHTML = '';
    const roles = ResistorData.BAND_ROLES[calcState.bandType];
    roles.forEach((role, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'band-tab' + (i === calcState.activeBand ? ' active' : '');
      btn.textContent = `Band ${i + 1}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(i === calcState.activeBand));
      btn.title = ResistorData.ROLE_LABELS[role];
      btn.addEventListener('click', () => {
        calcState.activeBand = i;
        renderBandTabs();
        renderColorPalette();
      });
      bandTabsEl.appendChild(btn);
    });
  }

  function renderColorPalette() {
    colorPaletteEl.innerHTML = '';
    const role = roleForBand(calcState.activeBand);
    ResistorData.RESISTOR_COLORS.forEach(c => {
      const valid = isValidForRole(c, role);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'color-btn' + (!valid ? ' disabled' : '') + (calcState.colors[calcState.activeBand] === c.key ? ' selected' : '');
      btn.disabled = !valid;
      btn.setAttribute('aria-pressed', String(calcState.colors[calcState.activeBand] === c.key));
      btn.setAttribute('aria-label', `${c.name}${valid ? ', ' + valueLabelForRole(c, role) : ', not valid for this band'}`);

      const swatch = document.createElement('span');
      swatch.className = 'swatch';
      swatch.style.background = c.hex;

      const textWrap = document.createElement('span');
      textWrap.className = 'color-btn-text';
      const nameEl = document.createElement('span');
      nameEl.className = 'color-btn-name';
      nameEl.textContent = c.name;
      const valEl = document.createElement('span');
      valEl.className = 'color-btn-val';
      valEl.textContent = valid ? valueLabelForRole(c, role) : '—';
      textWrap.appendChild(nameEl);
      textWrap.appendChild(valEl);

      btn.appendChild(swatch);
      btn.appendChild(textWrap);

      if (valid) {
        btn.addEventListener('click', () => {
          calcState.colors[calcState.activeBand] = c.key;
          updateCalculator();
          renderColorPalette();
        });
      }
      colorPaletteEl.appendChild(btn);
    });
  }

  function renderBandLabels(result) {
    bandLabelsEl.innerHTML = '';
    const roles = ResistorData.BAND_ROLES[calcState.bandType];
    roles.forEach((role, i) => {
      const colorData = ResistorData.get(calcState.colors[i]);
      const item = document.createElement('div');
      item.className = 'band-label-item';
      const roleEl = document.createElement('div');
      roleEl.className = 'bl-role';
      roleEl.textContent = `Band ${i + 1} · ${ResistorData.ROLE_LABELS[role]}`;
      const valEl = document.createElement('div');
      valEl.className = 'bl-value';
      const swatch = document.createElement('span');
      swatch.className = 'bl-swatch';
      swatch.style.background = colorData ? colorData.hex : '#333';
      valEl.appendChild(swatch);
      valEl.appendChild(document.createTextNode(colorData ? `${colorData.name} — ${valueLabelForRole(colorData, role)}` : '—'));
      item.appendChild(roleEl);
      item.appendChild(valEl);
      bandLabelsEl.appendChild(item);
    });
  }

  function renderExplain(result) {
    explainStepsEl.innerHTML = '';
    if (!result || result.error) {
      calcLineEl.textContent = 'Select a valid color for every band.';
      return;
    }
    result.steps.forEach(step => {
      const li = document.createElement('li');
      const idx = document.createElement('span');
      idx.className = 'step-index';
      idx.textContent = String(step.index).padStart(2, '0');
      const body = document.createElement('div');
      const label = document.createElement('div');
      label.className = 'step-label';
      label.textContent = step.label;
      const text = document.createElement('div');
      text.className = 'step-text';
      text.textContent = step.text;
      body.appendChild(label);
      body.appendChild(text);
      li.appendChild(idx);
      li.appendChild(body);
      explainStepsEl.appendChild(li);
    });
    calcLineEl.textContent = `${result.calcLine} → Final answer: ${result.finalLabel}`;
  }

  function updateCalculator() {
    const result = Calculator.calculate(calcState.colors);
    Visualization.update(calcResistorEl, calcState.colors);
    renderBandLabels(result);
    renderExplain(result);

    if (result && !result.error) {
      resultResistanceEl.textContent = result.resistanceLabel;
      resultToleranceEl.textContent = result.toleranceLabel;
      if (result.tempLabel) {
        resultTempBlock.hidden = false;
        resultTempEl.textContent = result.tempLabel;
      } else {
        resultTempBlock.hidden = true;
      }
    } else {
      resultResistanceEl.textContent = '—';
      resultToleranceEl.textContent = '—';
      resultTempBlock.hidden = true;
    }
    copyFeedback.textContent = '';
    syncCalcUrl();
  }

  function setBandType(type) {
    calcState.bandType = type;
    calcState.colors = [...ResistorData.DEFAULTS[type]];
    calcState.activeBand = 0;
    document.querySelectorAll('#calculator .mode-btn').forEach(b => {
      const active = Number(b.dataset.bandType) === type;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    renderBandTabs();
    renderColorPalette();
    updateCalculator();
  }

  document.querySelectorAll('#calculator .mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setBandType(Number(btn.dataset.bandType)));
  });

  document.getElementById('resetBtn').addEventListener('click', () => setBandType(calcState.bandType));

  document.getElementById('copyResultBtn').addEventListener('click', async () => {
    const result = Calculator.calculate(calcState.colors);
    if (!result || result.error) return;
    try {
      await navigator.clipboard.writeText(result.finalLabel);
      copyFeedback.textContent = 'Copied!';
    } catch (e) {
      copyFeedback.textContent = result.finalLabel;
    }
  });

  document.getElementById('shareResultBtn').addEventListener('click', async () => {
    const result = Calculator.calculate(calcState.colors);
    if (!result || result.error) return;
    const shareText = `Resistor Lab result: ${result.finalLabel}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Resistor Lab', text: shareText, url: window.location.href });
      } catch (e) { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        copyFeedback.textContent = 'Link copied — share it anywhere!';
      } catch (e) {
        copyFeedback.textContent = shareText;
      }
    }
  });

  function syncCalcUrl() {
    const params = new URLSearchParams();
    params.set('type', `${calcState.bandType}band`);
    calcState.colors.forEach((c, i) => params.set(`b${i + 1}`, c));
    const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState(null, '', newUrl);
  }

  function restoreCalcFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const bandType = type ? parseInt(type.replace('band', ''), 10) : null;
    if (!bandType || !ResistorData.BAND_ROLES[bandType]) return false;

    const colors = [];
    for (let i = 1; i <= bandType; i++) {
      const c = params.get(`b${i}`);
      if (!c || !ResistorData.get(c)) return false;
      colors.push(c);
    }
    const roles = ResistorData.BAND_ROLES[bandType];
    for (let i = 0; i < bandType; i++) {
      if (!isValidForRole(ResistorData.get(colors[i]), roles[i])) return false;
    }
    calcState.bandType = bandType;
    calcState.colors = colors;
    calcState.activeBand = 0;
    return true;
  }

  /* ======================================================
     REVERSE CALCULATOR
     ====================================================== */

  const reverseToleranceSelect = document.getElementById('reverseTolerance');
  ResistorData.RESISTOR_COLORS
    .filter(c => c.tolerance !== null)
    .sort((a, b) => a.tolerance - b.tolerance)
    .forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.tolerance;
      opt.textContent = `${ResistorData.formatTolerance(c.tolerance)} (${c.name})`;
      if (c.key === 'gold') opt.selected = true;
      reverseToleranceSelect.appendChild(opt);
    });

  const reverseForm = document.getElementById('reverseForm');
  const reverseError = document.getElementById('reverseError');
  const reverseOutput = document.getElementById('reverseOutput');
  const reverseResistorEl = document.getElementById('reverseResistor');

  reverseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    reverseError.textContent = '';

    const rawValue = parseFloat(document.getElementById('reverseValue').value);
    const unit = parseFloat(document.getElementById('reverseUnit').value);
    const tolerance = parseFloat(reverseToleranceSelect.value);
    const bandType = parseInt(reverseForm.querySelector('input[name="reverseBandType"]:checked').value, 10);

    if (isNaN(rawValue) || rawValue <= 0) {
      reverseError.textContent = 'Enter a resistance value greater than zero.';
      return;
    }

    const ohms = rawValue * unit;
    const result = ReverseCalculator.convert(ohms, tolerance, bandType);

    if (result.error) {
      const messages = {
        'invalid-value': 'Enter a resistance value greater than zero.',
        'invalid-band-type': 'Choose a 4-band or 5-band resistor.',
        'invalid-tolerance': 'Choose a supported tolerance value.',
        'out-of-range': `That value can't be represented with a ${bandType}-band resistor in the supported range (0.01 Ω – 999 MΩ).`,
      };
      reverseError.textContent = messages[result.error] || 'Unable to calculate a color code for that value.';
      reverseOutput.innerHTML = '<p class="placeholder-text">Enter a value to see the matching resistor.</p>';
      Visualization.render(reverseResistorEl, ResistorData.DEFAULTS[bandType]);
      return;
    }

    Visualization.update(reverseResistorEl, result.colors);
    reverseOutput.innerHTML = '';

    const valueLine = document.createElement('div');
    valueLine.className = 'reverse-result-label';
    valueLine.textContent = result.finalLabel;
    reverseOutput.appendChild(valueLine);

    const bandsList = document.createElement('div');
    bandsList.className = 'reverse-bands-list';
    result.colors.forEach(key => {
      const span = document.createElement('span');
      span.textContent = ResistorData.get(key).name;
      bandsList.appendChild(span);
    });
    reverseOutput.appendChild(bandsList);
  });

  Visualization.render(reverseResistorEl, ResistorData.DEFAULTS[4]);

  /* ======================================================
     REFERENCE TABLE
     ====================================================== */

  const referenceTableBody = document.getElementById('referenceTableBody');
  const referenceFilters = document.getElementById('referenceFilters');

  function renderReferenceTable(filter = 'all') {
    referenceTableBody.innerHTML = '';
    ResistorData.RESISTOR_COLORS.forEach(c => {
      if (filter === 'digit' && c.digit === null) return;
      if (filter === 'multiplier' && c.multiplier === null) return;
      if (filter === 'tolerance' && c.tolerance === null) return;
      if (filter === 'temp' && c.temp === null) return;

      const tr = document.createElement('tr');

      const colorTd = document.createElement('td');
      colorTd.innerHTML = `<span class="ref-color-cell"><span class="ref-swatch" style="background:${c.hex}"></span>${c.name}</span>`;

      const digitTd = document.createElement('td');
      digitTd.className = 'mono';
      digitTd.textContent = c.digit !== null ? c.digit : '—';

      const multTd = document.createElement('td');
      multTd.className = 'mono';
      multTd.textContent = c.multiplier !== null ? '×' + (c.multiplier >= 1 ? c.multiplier.toLocaleString('en-US') : c.multiplier) : '—';

      const tolTd = document.createElement('td');
      tolTd.className = 'mono';
      tolTd.textContent = ResistorData.formatTolerance(c.tolerance);

      const tempTd = document.createElement('td');
      tempTd.className = 'mono';
      tempTd.textContent = c.temp !== null ? c.temp + ' ppm/K' : '—';

      tr.append(colorTd, digitTd, multTd, tolTd, tempTd);
      referenceTableBody.appendChild(tr);
    });
  }

  referenceFilters.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    referenceFilters.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    renderReferenceTable(chip.dataset.filter);
  });

  renderReferenceTable();

  /* ======================================================
     PRACTICE / QUIZ
     ====================================================== */

  const practiceIntro = document.getElementById('practiceIntro');
  const quizArea = document.getElementById('quizArea');
  const quizComplete = document.getElementById('quizComplete');
  const quizResistorEl = document.getElementById('quizResistor');
  const quizOptionsEl = document.getElementById('quizOptions');
  const quizFeedback = document.getElementById('quizFeedback');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');
  const quizProgress = document.getElementById('quizProgress');
  const quizScore = document.getElementById('quizScore');
  const progressFill = document.getElementById('progressFill');

  let currentQuiz = null;

  document.querySelectorAll('#practiceIntro .mode-btn').forEach(btn => {
    btn.addEventListener('click', () => startQuiz(btn.dataset.difficulty));
  });

  function startQuiz(difficulty) {
    currentQuiz = Practice.newQuiz(difficulty);
    practiceIntro.hidden = true;
    quizComplete.hidden = true;
    quizArea.hidden = false;
    renderQuestion();
  }

  function renderQuestion() {
    const q = currentQuiz.questions[currentQuiz.current];
    Visualization.update(quizResistorEl, q.colors);
    if (!quizResistorEl.querySelector('svg')) Visualization.render(quizResistorEl, q.colors);

    quizProgress.textContent = `Question ${currentQuiz.current + 1} / ${Practice.QUESTIONS_PER_QUIZ}`;
    quizScore.textContent = `Score: ${currentQuiz.score} / ${Practice.QUESTIONS_PER_QUIZ}`;
    progressFill.style.width = `${((currentQuiz.current) / Practice.QUESTIONS_PER_QUIZ) * 100}%`;

    quizOptionsEl.innerHTML = '';
    quizFeedback.textContent = '';
    nextQuestionBtn.hidden = true;

    q.options.forEach(optionLabel => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.textContent = optionLabel;
      btn.addEventListener('click', () => selectAnswer(btn, optionLabel, q));
      quizOptionsEl.appendChild(btn);
    });
  }

  function selectAnswer(btn, chosenLabel, q) {
    const allOptionButtons = quizOptionsEl.querySelectorAll('.quiz-option');
    allOptionButtons.forEach(b => (b.disabled = true));

    const isCorrect = chosenLabel === q.correctLabel;
    btn.classList.add(isCorrect ? 'correct' : 'incorrect');

    if (!isCorrect) {
      allOptionButtons.forEach(b => {
        if (b.textContent === q.correctLabel) b.classList.add('correct');
      });
    }

    if (isCorrect) {
      currentQuiz.score += 1;
      currentQuiz.correctCount += 1;
      quizFeedback.textContent = 'Correct!';
    } else {
      currentQuiz.incorrectCount += 1;
      quizFeedback.textContent = `Incorrect. Correct answer: ${q.correctLabel}`;
    }

    quizScore.textContent = `Score: ${currentQuiz.score} / ${Practice.QUESTIONS_PER_QUIZ}`;
    nextQuestionBtn.hidden = false;
  }

  nextQuestionBtn.addEventListener('click', () => {
    currentQuiz.current += 1;
    if (currentQuiz.current >= currentQuiz.questions.length) {
      finishQuiz();
    } else {
      renderQuestion();
    }
  });

  function finishQuiz() {
    quizArea.hidden = true;
    quizComplete.hidden = false;
    progressFill.style.width = '100%';

    const total = Practice.QUESTIONS_PER_QUIZ;
    document.getElementById('statScore').textContent = `${currentQuiz.score}/${total}`;
    document.getElementById('statCorrect').textContent = currentQuiz.correctCount;
    document.getElementById('statIncorrect').textContent = currentQuiz.incorrectCount;
    document.getElementById('statAccuracy').textContent = `${Math.round((currentQuiz.correctCount / total) * 100)}%`;
  }

  document.getElementById('restartQuizBtn').addEventListener('click', () => {
    quizComplete.hidden = true;
    practiceIntro.hidden = false;
  });

  /* ======================================================
     INIT
     ====================================================== */

  const restored = restoreCalcFromUrl();
  document.querySelectorAll('#calculator .mode-btn').forEach(b => {
    const active = Number(b.dataset.bandType) === calcState.bandType;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', String(active));
  });
  renderBandTabs();
  renderColorPalette();
  Visualization.render(calcResistorEl, calcState.colors);
  updateCalculator();

  showPage(idFromHash());
})();
