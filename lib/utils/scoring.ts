/**
 * Calculate final score for a submission
 * Formula: (scientific/100) × (humor/100) × (morality/100) × (votes + 1)
 */
export function calculateFinalScore(
  scientific: number,
  humor: number,
  morality: number,
  votes: number
): number {
  const normalizedScientific = scientific / 100;
  const normalizedHumor = humor / 100;
  const normalizedMorality = morality / 100;

  const finalScore =
    normalizedScientific * normalizedHumor * normalizedMorality * (votes + 1);

  return parseFloat(finalScore.toFixed(4));
}
