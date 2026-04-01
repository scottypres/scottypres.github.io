import { questionBank } from './questionBank.js';

function shuffleInPlace(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getQuestionPool({ cycle, type } = {}) {
  return questionBank.filter((question) => {
    const cycleMatch = !cycle || cycle === 'all' || question.cycle === cycle;
    const typeMatch = !type || type === 'all' || question.type === type;
    return cycleMatch && typeMatch;
  });
}

export function generateQuiz(options = {}) {
  const {
    cycle = 'all',
    type = 'all',
    count = 10,
    shuffle = true,
  } = options;

  const pool = getQuestionPool({ cycle, type });
  const prepared = shuffle ? shuffleInPlace(pool) : pool;
  return prepared.slice(0, Math.min(count, prepared.length));
}

