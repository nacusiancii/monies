import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

/**
 * Logs authentication events and errors
 */
const logAuthEvent = (event: string, details?: any) => {
  console.log(`[Auth] ${event}`, details || "");
};

const logAuthError = (error: any, context: string) => {
  console.error(`[Auth Error] ${context}:`, {
    message: error.message,
    code: error.code,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send OTP to the provided phone number
 * @param phoneNumber Phone number in E.164 format (e.g., +16505553434)
 */
export const sendOTP = async (
  phoneNumber: string
): Promise<FirebaseAuthTypes.ConfirmationResult> => {
  logAuthEvent("Sending OTP", { phoneNumber });

  try {
    // Ensure phone number is in E.164 format
    const formattedPhoneNumber = phoneNumber.startsWith("+")
      ? phoneNumber
      : `+${phoneNumber}`;

    logAuthEvent("Formatted phone number", { formattedPhoneNumber });

    const confirmation = await auth().signInWithPhoneNumber(
      formattedPhoneNumber
    );
    logAuthEvent("OTP sent successfully", {
      phoneNumber: formattedPhoneNumber,
    });

    return confirmation;
  } catch (error: any) {
    logAuthError(error, "sendOTP");
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

/**
 * Confirm the OTP code
 * @param confirmationResult The confirmation result from sendOTP
 * @param code The OTP code received via SMS
 */
export const confirmOTP = async (
  confirmationResult: FirebaseAuthTypes.ConfirmationResult,
  code: string
): Promise<FirebaseAuthTypes.UserCredential> => {
  logAuthEvent("Confirming OTP", { codeLength: code.length });

  try {
    const result = await confirmationResult.confirm(code);

    if (!result) {
      const error = new Error("OTP confirmation returned null result");
      logAuthError(error, "confirmOTP");
      throw error;
    }

    logAuthEvent("OTP confirmed successfully", {
      userId: result.user.uid,
      phoneNumber: result.user.phoneNumber,
    });

    return result;
  } catch (error: any) {
    logAuthError(error, "confirmOTP");
    throw new Error(`OTP confirmation failed: ${error.message}`);
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  const user = auth().currentUser;
  logAuthEvent("Attempting sign out", {
    userId: user?.uid,
    email: user?.email,
    phoneNumber: user?.phoneNumber,
  });

  try {
    await auth().signOut();
    logAuthEvent("Sign out successful");
  } catch (error: any) {
    logAuthError(error, "signOut");
    throw new Error(`Sign out failed: ${error.message}`);
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  const user = auth().currentUser;
  logAuthEvent("Current user check", {
    userId: user?.uid,
    isLoggedIn: !!user,
  });
  return user;
};

/**
 * Listen for auth state changes
 * @param callback Function to call when auth state changes
 */
export const onAuthStateChanged = (
  callback: (user: FirebaseAuthTypes.User | null) => void
): (() => void) => {
  logAuthEvent("Setting up auth state listener");

  const unsubscribe = auth().onAuthStateChanged((user) => {
    logAuthEvent("Auth state changed", {
      userId: user?.uid,
      isLoggedIn: !!user,
    });
    callback(user);
  });

  return () => {
    logAuthEvent("Removing auth state listener");
    unsubscribe();
  };
};
