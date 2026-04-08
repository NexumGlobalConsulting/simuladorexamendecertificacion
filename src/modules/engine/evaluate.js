export function evaluateSession(questions, answers) {
  let correctCount = 0;
  let totalScoreEarned = 0;
  let maxPossibleScore = 0;

  const results = questions.map((q, index) => {
    // answers[index] ahora será "A", "B", "C", "D" o null
    const selected = (answers && answers[index] !== undefined) ? answers[index] : null;
    const isCorrect = selected === q.respuesta_correcta;

    maxPossibleScore += q.peso;

    if (isCorrect) {
      correctCount++;
      totalScoreEarned += q.peso;
    }

    return {
      id: q.id,
      competencia: q.competencia,
      tema: q.tema,
      isCorrect,
      selectedAnswer: selected,
      correctAnswer: q.respuesta_correcta, // Revelado post-examen
      explicacion: q.explicacion,
      sustento: q.sustento_normativo,
      puntos_obtenidos: isCorrect ? q.peso : 0,
      peso_pregunta: q.peso
    };
  });

  return {
    score_obtenido: totalScoreEarned,
    score_maximo: maxPossibleScore,
    respuestas_correctas: correctCount,
    total_preguntas: questions.length,
    porcentaje: ((totalScoreEarned / maxPossibleScore) * 100).toFixed(2) + "%",
    detalle: results
  };
}