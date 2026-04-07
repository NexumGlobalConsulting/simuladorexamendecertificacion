export function evaluate(questions, answers) {
  let score = 0;

  questions.forEach((q) => {
    if (answers[q.id] === q.correct) {
      score++;
    }
  });

  return {
    score,
    total: questions.length
  };
}