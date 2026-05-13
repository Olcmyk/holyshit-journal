import { NextResponse } from 'next/server';
import { createChallenge, pbkdf2 } from 'altcha/lib';

// HMAC secret - in production, move to environment variables
const HMAC_SECRET = process.env.ALTCHA_HMAC_KEY || 'your-secret-key-change-in-production';

export async function GET() {
  // Validate secret in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.ALTCHA_HMAC_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: ALTCHA secret not configured' },
        { status: 500 }
      );
    }
  }

  try {
    const challenge = await createChallenge({
      algorithm: 'PBKDF2/SHA-256',
      cost: 5000, // Adjust difficulty as needed
      deriveKey: pbkdf2.deriveKey,
      hmacSignatureSecret: HMAC_SECRET,
      expiresAt: new Date(Date.now() + 300_000), // 5 minutes expiration
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Failed to create ALTCHA challenge:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}
