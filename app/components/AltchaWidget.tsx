'use client';

import { useEffect, useRef, useState } from 'react';

// Declare custom element types for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'altcha-widget': {
        ref?: React.Ref<AltchaWidgetElement>;
        challenge?: string;
        hidefooter?: string;
        hidelogo?: string;
      };
    }
  }
}

interface AltchaWidgetElement extends HTMLElement {
  configure: (config: object) => Promise<void>;
  verify: () => Promise<{ payload: string } | null>;
  reset: () => void;
  getState: () => string;
}

interface AltchaWidgetProps {
  onVerified: (payload: string) => void;
  onStateChange?: (state: string) => void;
}

export default function AltchaWidget({ onVerified, onStateChange }: AltchaWidgetProps) {
  const widgetRef = useRef<AltchaWidgetElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Load altcha script on client side only
  useEffect(() => {
    setIsClient(true);

    // Dynamically import altcha on client side
    import('altcha').catch(err => {
      console.error('Failed to load altcha:', err);
    });
  }, []);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    const handleVerified = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.payload) {
        onVerified(customEvent.detail.payload);
      }
    };

    const handleStateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (onStateChange && customEvent.detail?.state) {
        onStateChange(customEvent.detail.state);
      }
    };

    widget.addEventListener('verified', handleVerified);
    widget.addEventListener('statechange', handleStateChange);

    return () => {
      widget.removeEventListener('verified', handleVerified);
      widget.removeEventListener('statechange', handleStateChange);
    };
  }, [isClient, onVerified, onStateChange]);

  if (!isClient) {
    return (
      <div className="border-2 border-gray-300 p-4 text-center text-gray-500">
        加载验证组件...
      </div>
    );
  }

  return (
    <altcha-widget
      ref={widgetRef}
      challenge="/api/altcha/challenge"
      hidefooter="true"
      hidelogo="true"
    />
  );
}
