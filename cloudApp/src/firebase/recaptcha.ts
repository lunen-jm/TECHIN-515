// Utility functions for reCAPTCHA Enterprise integration
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Get a reCAPTCHA Enterprise token for a given action
 * @param action The action name to associate with the token
 * @returns A Promise that resolves to the reCAPTCHA token
 */
export const getReCaptchaToken = async (action: string): Promise<string | null> => {
  try {
    // Check if reCAPTCHA Enterprise is available
    if (typeof window === 'undefined' || 
        !window.grecaptcha || 
        !window.grecaptcha.enterprise) {
      console.warn('reCAPTCHA Enterprise not available');
      return null;
    }
    
    // Wait for reCAPTCHA to be ready
    return new Promise<string>((resolve, reject) => {
      window.grecaptcha.enterprise.ready(async () => {
        try {
          // Get the reCAPTCHA site key from .env or use hardcoded one for now
          const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY || 
                         '6LdWfFMrAAAAACoFAe5VudMsTLi8zV0zuQqJS6XC';
          
          const token = await window.grecaptcha.enterprise.execute(siteKey, { action });
          resolve(token);
        } catch (error) {
          console.error('Error generating reCAPTCHA token:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error with reCAPTCHA:', error);
    return null;
  }
};

/**
 * Verify a reCAPTCHA token on the server
 * @param token The reCAPTCHA token to verify 
 * @param action The expected action
 * @returns The verification result from the server
 */
export const verifyReCaptchaToken = async (token: string, action: string) => {
  try {
    const functions = getFunctions();
    const verifyReCaptcha = httpsCallable(functions, 'verifyReCaptcha');
    const result = await verifyReCaptcha({ token, action });
    return result.data;
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    throw error;
  }
};
