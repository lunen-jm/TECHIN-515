// ReCAPTCHA Enterprise service for generating tokens
// This service handles generating ReCAPTCHA tokens for Firebase App Check and form protection

const RECAPTCHA_SITE_KEY = '6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC';

/**
 * Generate a ReCAPTCHA token for a specific action
 * @param action - The action being performed (e.g., 'LOGIN', 'REGISTER', 'FORGOT_PASSWORD')
 * @returns Promise<string> - The ReCAPTCHA token
 */
export const generateRecaptchaToken = async (action: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha?.enterprise) {
      reject(new Error('ReCAPTCHA Enterprise not loaded'));
      return;
    }

    window.grecaptcha.enterprise.ready(async () => {
      try {
        const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, {
          action: action.toUpperCase()
        });
        console.log(`ReCAPTCHA token generated for action: ${action}`);
        resolve(token);
      } catch (error) {
        console.error('Error generating ReCAPTCHA token:', error);
        reject(error);
      }
    });
  });
};

/**
 * Check if ReCAPTCHA is available
 * @returns boolean
 */
export const isRecaptchaAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.grecaptcha?.enterprise;
};

/**
 * Wait for ReCAPTCHA to be ready
 * @returns Promise<void>
 */
export const waitForRecaptcha = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (isRecaptchaAvailable()) {
      resolve();
      return;
    }

    // Wait for load (with timeout)
    const startTime = Date.now();
    const timeout = 10000; // 10 seconds

    const checkInterval = setInterval(() => {
      if (isRecaptchaAvailable()) {
        clearInterval(checkInterval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('ReCAPTCHA failed to load within timeout'));
      }
    }, 100);
  });
};
