/**
 * practice.js
 * Generates resistor-reading quiz questions and tracks score.
 */

const Practice = (() => {

  const DIFFICULTY_BAND_TYPE = { easy: 4, medium: 5, hard: 6 };
  const QUESTIONS_PER_QUIZ = 10;

  function randomColor(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  /** Build one random, valid set of band colors for a given band type. */
  function randomBands(bandType) {
    const roles = ResistorData.BAND_ROLES[bandType];
    return roles.map(role => {
      if (role === 'digit') return randomColor(ResistorData.DIGIT_COLORS);
      if (role === 'multiplier') return randomColor(ResistorData.MULTIPLIER_COLORS);
      if (role === 'tolerance') return randomColor(ResistorData.TOLERANCE_COLORS);
      if (role === 'temp') return randomColor(ResistorData.TEMP_COLORS);
      return null;
    });
  }

  /** Build up to 3 plausible-but-wrong resistance labels (same tolerance). */
  function buildDistractors(result) {
    const value = result.resistance;
    const factors = [10, 0.1, 100, 0.01, 2, 0.5];
    const seen = new Set([result.resistanceLabel]);
    const distractors = [];
    for (const f of factors) {
      if (distractors.length >= 3) break;
      const candidate = value * f;
      if (candidate <= 0) continue;
      const label = ResistorData.formatOhms(candidate);
      if (seen.has(label)) continue;
      seen.add(label);
      distractors.push(`${label} ${result.toleranceLabel}`);
    }
    // Fallback in the rare case we couldn't find enough distinct values
    let bump = 3;
    while (distractors.length < 3) {
      const label = ResistorData.formatOhms(value * bump);
      const full = `${label} ${result.toleranceLabel}`;
      if (!seen.has(label)) {
        seen.add(label);
        distractors.push(full);
      }
      bump += 1;
    }
    return distractors;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function generateQuestion(difficulty) {
    const bandType = DIFFICULTY_BAND_TYPE[difficulty] || 4;
    let colors, result;
    // Guard against (rare) invalid random combinations.
    do {
      colors = randomBands(bandType);
      result = Calculator.calculate(colors);
    } while (!result || result.error);

    const correctLabel = result.finalLabel;
    const options = shuffle([correctLabel, ...buildDistractors(result)]);

    return {
      colors,
      bandType,
      result,
      correctLabel,
      options,
    };
  }

  /** Build a full quiz of QUESTIONS_PER_QUIZ questions. */
  function newQuiz(difficulty) {
    const questions = [];
    for (let i = 0; i < QUESTIONS_PER_QUIZ; i++) {
      questions.push(generateQuestion(difficulty));
    }
    return {
      difficulty,
      questions,
      current: 0,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      finished: false,
    };
  }

  return { newQuiz, QUESTIONS_PER_QUIZ, generateQuestion };
})();
