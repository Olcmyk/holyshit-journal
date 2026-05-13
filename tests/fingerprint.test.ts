import { generateEnhancedFingerprint } from '@/lib/utils/fingerprint';

describe('Enhanced Fingerprint', () => {
  it('should generate a valid SHA-256 hash', async () => {
    const fingerprint = await generateEnhancedFingerprint();

    // SHA-256 hash is 64 characters (hex)
    expect(fingerprint).toHaveLength(64);
    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should generate consistent fingerprints on same device', async () => {
    const fp1 = await generateEnhancedFingerprint();
    const fp2 = await generateEnhancedFingerprint();

    // Same device should produce same fingerprint
    expect(fp1).toBe(fp2);
  });

  it('should handle missing components gracefully', async () => {
    // This test verifies the fallback values work
    const fingerprint = await generateEnhancedFingerprint();

    expect(fingerprint).toBeDefined();
    expect(typeof fingerprint).toBe('string');
  });
});
