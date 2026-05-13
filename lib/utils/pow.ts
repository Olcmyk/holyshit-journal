import CryptoJS from 'crypto-js';

/**
 * Generate a random challenge string
 */
export function generateChallenge(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

/**
 * Calculate hash of challenge + nonce
 */
export function calculateHash(challenge: string, nonce: number): string {
  const data = challenge + nonce.toString();
  return CryptoJS.SHA256(data).toString();
}

/**
 * Verify PoW solution
 * @param challenge - The challenge string
 * @param nonce - The nonce found by the client
 * @param difficulty - Number of leading zeros required
 */
export function verifyPoW(
  challenge: string,
  nonce: number,
  difficulty: number
): boolean {
  const hash = calculateHash(challenge, nonce);
  const prefix = '0'.repeat(difficulty);
  return hash.startsWith(prefix);
}

/**
 * Get difficulty level based on action type
 */
export function getDifficulty(action: 'submit' | 'vote'): number {
  // Difficulty = number of leading zeros required in hash
  // Higher number = more computation required
  return action === 'submit' ? 4 : 3; // Submit is harder than vote
}
