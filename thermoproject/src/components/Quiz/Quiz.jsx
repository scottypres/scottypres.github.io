import { useEffect, useMemo, useState } from 'react';
import { generateQuiz } from '../../engine/quiz/quizGenerator.js';
import { getAllCycles } from '../../engine/cycles/cycleRegistry.js';

const QUESTION_COUNT = 10;

export default function Quiz() {
  const cycles = useMemo(() => getAllCycles(), []);
  const [selectedCycle, setSelectedCycle] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [quiz, setQuiz] = useState(() => generateQuiz({ count: QUESTION_COUNT }));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());

  const current = quiz[index];
  const elapsedSeconds = Math.floor((now - startedAt) / 1000);

  useEffect(() => {
    if (!timerEnabled) return undefined;
    const handle = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(handle);
  }, [timerEnabled]);

  function startQuiz() {
    const nextQuiz = generateQuiz({
      cycle: selectedCycle,
      type: selectedType,
      count: QUESTION_COUNT,
    });
    setQuiz(nextQuiz);
    setIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer('');
    setShowSummary(false);
    setStartedAt(Date.now());
    setNow(Date.now());
  }

  function chooseAnswer(option) {
    if (answered || !current) return;
    setAnswered(true);
    setSelectedAnswer(option);
    if (option === current.answer) {
      setScore((s) => s + 1);
    }
  }

  function nextQuestion() {
    if (index >= quiz.length - 1) {
      setShowSummary(true);
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(false);
    setSelectedAnswer('');
  }

  if (!current && !showSummary) {
    return (
      <div className="panel quiz-panel">
        <div className="panel-title">Quiz</div>
        <p className="quiz-empty">No questions found for this filter.</p>
      </div>
    );
  }

  return (
    <div className="panel quiz-panel">
      <div className="panel-title">Quiz Mode</div>

      <div className="quiz-controls">
        <select className="select-control" value={selectedCycle} onChange={(e) => setSelectedCycle(e.target.value)}>
          <option value="all">All cycles</option>
          {cycles.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
          ))}
        </select>
        <select className="select-control" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="all">All question types</option>
          <option value="A">Type A - Diagram ID</option>
          <option value="B">Type B - Predict effect</option>
          <option value="C">Type C - Property math</option>
          <option value="D">Type D - Find error</option>
        </select>
        <button className="btn btn-primary" onClick={startQuiz}>Start / Restart</button>
      </div>

      <div className="quiz-meta">
        <span>Score: {score}/{quiz.length}</span>
        <span>Question: {Math.min(index + 1, quiz.length)}/{quiz.length}</span>
        <label className="quiz-timer-toggle">
          <input
            type="checkbox"
            checked={timerEnabled}
            onChange={(e) => setTimerEnabled(e.target.checked)}
          />
          Timer
        </label>
        {timerEnabled && <span>Time: {elapsedSeconds}s</span>}
      </div>

      {!showSummary && current && (
        <>
          <div className="quiz-question">{current.question}</div>
          <div className="quiz-options">
            {current.options.map((option) => {
              let className = 'quiz-option';
              if (answered && option === current.answer) className += ' correct';
              if (answered && option === selectedAnswer && option !== current.answer) className += ' incorrect';
              return (
                <button key={option} className={className} onClick={() => chooseAnswer(option)}>
                  {option}
                </button>
              );
            })}
          </div>
          {answered && (
            <div className="quiz-explanation">
              <strong>Explanation:</strong> {current.explanation}
            </div>
          )}
          <div className="quiz-actions">
            <button className="btn" onClick={nextQuestion} disabled={!answered}>
              {index >= quiz.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </>
      )}

      {showSummary && (
        <div className="quiz-summary">
          <h3>Results</h3>
          <p>{((score / Math.max(1, quiz.length)) * 100).toFixed(1)}% correct</p>
          <p>{score} out of {quiz.length} correct</p>
          {timerEnabled && <p>Elapsed: {elapsedSeconds} seconds</p>}
          <button className="btn btn-primary" onClick={startQuiz}>Try Another Quiz</button>
        </div>
      )}
    </div>
  );
}
