import { verifySolution, pbkdf2 } from 'altcha/lib';

const HMAC_SECRET = process.env.ALTCHA_HMAC_KEY || 'your-secret-key-change-in-production';

export async function verifyAltchaPayload(payload: string): Promise<boolean> {
  try {
    // Parse the base64 payload - it contains challenge and solution objects
    const { challenge, solution } = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    );

    // Verify the solution
    const result = await verifySolution({
      challenge,
      solution,
      deriveKey: pbkdf2.deriveKey,
      hmacSignatureSecret: HMAC_SECRET,
    });

    // Return the verified status from the result object
    return result.verified;
  } catch (error) {
    console.error('ALTCHA verification error:', error);
    return false;
  }
}
