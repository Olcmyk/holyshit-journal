import FingerprintJS from '@fingerprintjs/fingerprintjs';
import CryptoJS from 'crypto-js';

/**
 * Generate enhanced hardware-based fingerprint
 *
 * Extracts stable hardware characteristics that persist across incognito sessions:
 * - Canvas rendering (GPU characteristics)
 * - WebGL vendor/renderer (graphics card)
 * - Audio fingerprint (audio processing)
 * - Installed fonts
 * - Screen resolution
 * - Hardware concurrency (CPU cores)
 * - Timezone and platform
 *
 * @returns SHA-256 hash of hardware features
 */
export async function generateEnhancedFingerprint(): Promise<string> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();

  // Extract stable hardware components
  const components = result.components as any;

  const stableFeatures = {
    canvas: (components.canvas && 'value' in components.canvas) ? components.canvas.value : '',
    webgl: JSON.stringify({
      vendor: (components.webglVendor && 'value' in components.webglVendor) ? components.webglVendor.value : '',
      renderer: (components.webglRenderer && 'value' in components.webglRenderer) ? components.webglRenderer.value : ''
    }),
    audio: (components.audio && 'value' in components.audio) ? components.audio.value : 0,
    fonts: JSON.stringify((components.fonts && 'value' in components.fonts) ? components.fonts.value : []),
    screenResolution: JSON.stringify((components.screenResolution && 'value' in components.screenResolution) ? components.screenResolution.value : []),
    hardwareConcurrency: (components.hardwareConcurrency && 'value' in components.hardwareConcurrency) ? components.hardwareConcurrency.value : 0,
    timezone: (components.timezone && 'value' in components.timezone) ? components.timezone.value : '',
    platform: (components.platform && 'value' in components.platform) ? components.platform.value : ''
  };

  // Create deterministic hash
  const featuresString = JSON.stringify(stableFeatures);
  const hash = CryptoJS.SHA256(featuresString).toString();

  return hash;
}
