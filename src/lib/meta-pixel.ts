export const FB_PIXEL_ID = '1663703951762584';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const pageview = () => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
};

export const event = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', name, options);
  }
};
