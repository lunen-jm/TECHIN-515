// Type definitions for Google reCAPTCHA Enterprise
// This adds TypeScript support for the globally available grecaptcha object

interface Window {
  grecaptcha: ReCaptchaEnterprise;
}

interface ReCaptchaEnterprise {
  enterprise: {
    /**
     * Ensures reCAPTCHA Enterprise has loaded and is ready to use
     * @param callback Function to execute when reCAPTCHA is ready
     */
    ready(callback: () => void): void;
    
    /**
     * Executes the reCAPTCHA Enterprise check and returns a token
     * @param siteKey The site key for your reCAPTCHA Enterprise project
     * @param options Options for the reCAPTCHA Enterprise execution
     * @returns Promise that resolves to a reCAPTCHA token string
     */
    execute(siteKey: string, options: ReCaptchaExecuteOptions): Promise<string>;
    
    /**
     * Renders a reCAPTCHA Enterprise widget
     * @param container The ID of container element or the container element
     * @param parameters Parameters for the reCAPTCHA widget
     * @returns The ID of the reCAPTCHA widget
     */
    render(container: string | HTMLElement, parameters: ReCaptchaRenderParameters): number;
  };
}

interface ReCaptchaExecuteOptions {
  action: string;
  [key: string]: any;
}

interface ReCaptchaRenderParameters {
  sitekey: string;
  theme?: 'dark' | 'light';
  size?: 'invisible' | 'normal' | 'compact';
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: (error: Error) => void;
  isolated?: boolean;
  badge?: 'bottomright' | 'bottomleft' | 'inline';
  [key: string]: any;
}
