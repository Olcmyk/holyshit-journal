import { calculateHash } from './pow';

/**
 * Solve PoW challenge on client side
 * @param challenge - The challenge string from server
 * @param difficulty - Number of leading zeros required
 * @param onProgress - Optional callback for progress updates
 * @returns The nonce that solves the challenge
 */
export async function solvePoW(
  challenge: string,
  difficulty: number,
  onProgress?: (attempts: number) => void
): Promise<number> {
  const prefix = '0'.repeat(difficulty);
  let nonce = 0;
  let hash = '';

  return new Promise((resolve) => {
    const solve = () => {
      const batchSize = 1000; // Check 1000 hashes per batch
      const startNonce = nonce;

      for (let i = 0; i < batchSize; i++) {
        hash = calculateHash(challenge, nonce);

        if (hash.startsWith(prefix)) {
          resolve(nonce);
          return;
        }

        nonce++;
      }

      // Report progress
      if (onProgress) {
        onProgress(nonce - startNonce);
      }

      // Continue solving in next tick to avoid blocking UI
      setTimeout(solve, 0);
    };

    solve();
  });
}
