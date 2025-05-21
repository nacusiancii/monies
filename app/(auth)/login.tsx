import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { confirmOTP, sendOTP } from "../../utils/auth";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter a phone number.");
      return;
    }
    setLoading(true);
    try {
      const confirmation = await sendOTP(phoneNumber);
      setConfirm(confirmation);
      Alert.alert("OTP Sent", "Please check your messages for the OTP.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message ||
          "Failed to send OTP. Ensure the phone number is correct and try again."
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Phone Auth Error:", error);
    }
    setLoading(false);
  };

  const handleConfirmOTP = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }
    if (!confirm) {
      Alert.alert("Error", "Please request an OTP first.");
      return;
    }
    setLoading(true);
    try {
      await confirmOTP(confirm, code);
      // User signed in successfully. The onAuthStateChanged listener in _layout.tsx will handle redirection.
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Invalid code. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login with Phone</Text>
      {!confirm ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Phone Number (e.g., +16505553434)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <Button title="Send OTP" onPress={handleSendOTP} disabled={loading} />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />
          <Button
            title="Verify OTP"
            onPress={handleConfirmOTP}
            disabled={loading}
          />
          <Button
            title="Resend OTP?"
            onPress={() => {
              setConfirm(null);
              setPhoneNumber("");
              setCode("");
              handleSendOTP();
            }}
            disabled={loading}
          />
        </>
      )}
      {loading && (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
});
