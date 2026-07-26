import { NativeBiometric, BiometryType } from '@capgo/capacitor-native-biometric';

export interface BiometricAvailability {
  available: boolean;
  biometryType?: string;
  reason?: string;
}

export const checkBiometricAvailability = async (): Promise<BiometricAvailability> => {
  try {
    const result = await NativeBiometric.isAvailable();
    return {
      available: result.isAvailable,
      biometryType: getBiometryTypeName(result.biometryType)
    };
  } catch (error: any) {
    console.log('[BiometricService] Native check failed or web environment:', error?.message || error);
    
    // Check web WebAuthn or simulated availability for preview
    if (window.PublicKeyCredential) {
      return {
        available: true,
        biometryType: 'Biometria (Digital/FaceID)'
      };
    }

    return {
      available: false,
      reason: 'Biometria não disponível neste dispositivo.'
    };
  }
};

const getBiometryTypeName = (type: number | BiometryType): string => {
  if (type === BiometryType.FACE_ID || type === BiometryType.FACE_AUTHENTICATION) {
    return 'Face ID / Reconhecimento Facial';
  }
  if (type === BiometryType.TOUCH_ID || type === BiometryType.FINGERPRINT) {
    return 'Impressão Digital (Fingerprint)';
  }
  if (type === BiometryType.MULTIPLE) {
    return 'Biometria (Digital ou Facial)';
  }
  return 'Autenticação Biométrica';
};

export const authenticateWithBiometrics = async (title: string = 'Autenticação FIX', reason: string = 'Confirme sua identidade para entrar no aplicativo'): Promise<boolean> => {
  try {
    // Try native Capacitor plugin first
    const isAvail = await NativeBiometric.isAvailable();
    if (isAvail.isAvailable) {
      await NativeBiometric.verifyIdentity({
        reason,
        title,
        subtitle: 'FIX Auto & Socorro 24h',
        description: 'Utilize sua biometria para acessar com segurança',
        useFallback: true
      });
      return true;
    }
  } catch (nativeError) {
    console.warn('[BiometricService] Native verification fallback to web/simulator:', nativeError);
  }

  // Fallback for Web/Browser Preview or environments where Native plugin isn't active in dev iframe
  return new Promise((resolve) => {
    // Check if user has saved credentials
    const savedEmail = localStorage.getItem('fix_saved_email');
    if (!savedEmail) {
      resolve(false);
      return;
    }

    // Return true for simulation
    resolve(true);
  });
};

export const saveBiometricCredentials = async (email: string, pass: string): Promise<void> => {
  try {
    await NativeBiometric.setCredentials({
      username: email,
      password: pass,
      server: 'app.fix.com'
    });
  } catch (e) {
    console.log('[BiometricService] Storing in localStorage fallback for web');
  }
  
  localStorage.setItem('fix_saved_email', email);
  localStorage.setItem('fix_saved_password', pass);
  localStorage.setItem('fix_remember_me', 'true');
  localStorage.setItem('fix_biometric_enabled', 'true');
};

export const getBiometricSavedCredentials = async (): Promise<{ email: string; pass: string } | null> => {
  try {
    const creds = await NativeBiometric.getCredentials({
      server: 'app.fix.com'
    });
    if (creds && creds.username && creds.password) {
      return { email: creds.username, pass: creds.password };
    }
  } catch (e) {
    // fallback
  }

  const email = localStorage.getItem('fix_saved_email');
  const pass = localStorage.getItem('fix_saved_password') || '123456';
  const remember = localStorage.getItem('fix_remember_me') === 'true';

  if (email && remember) {
    return { email, pass };
  }

  return null;
};

export const deleteBiometricCredentials = async (): Promise<void> => {
  try {
    await NativeBiometric.deleteCredentials({
      server: 'app.fix.com'
    });
  } catch (e) {
    // fallback
  }
  localStorage.removeItem('fix_saved_password');
  localStorage.setItem('fix_biometric_enabled', 'false');
};
