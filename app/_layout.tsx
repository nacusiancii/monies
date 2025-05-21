import { Ionicons } from "@expo/vector-icons";
import firebase from "@react-native-firebase/app";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { SplashScreen, Tabs, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { firebaseConfig } from "../firebaseConfig";

// Initialize Firebase
// Check if Firebase has already been initialized
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const router = useRouter();
  const segments = useSegments();

  // Handle user state changes
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    if (initializing) return; // Don't redirect until Firebase is initialized

    // Hide the splash screen once we're done loading
    SplashScreen.hideAsync();

    // Type assert segments[0] to string for comparison
    const firstSegment = segments[0] as string;
    const isInAuthGroup = firstSegment === "(auth)";

    if (!isInAuthGroup && !user) {
      // If the user is not signed in and not in the auth group, redirect to the login screen
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.replace("/(auth)/login" as any);
    } else if (isInAuthGroup && user) {
      // If the user is signed in and in the auth group, redirect to the home screen
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.replace("/");
    }
  }, [user, segments, initializing, router]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Type assert segments[0] to string for comparison
  const firstSegment = segments[0] as string;

  // If user is not logged in and we are not in the auth group,
  // router.replace above will handle it. Return null or a loading indicator
  // to prevent rendering the Tabs layout prematurely.
  if (!user && firstSegment !== "(auth)") {
    return (
      // Or return a loading screen
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // If user is logged in and we are in the auth group,
  // router.replace above will handle it. Return null or a loading indicator.
  if (user && firstSegment === "(auth)") {
    return (
      // Or return a loading screen
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#757575",
        headerStyle: {
          backgroundColor: "#4CAF50",
        },
        headerTintColor: "#fff",
        tabBarShowLabel: true,
        tabBarBackground: () => (
          <BlurView
            tint="light"
            intensity={10}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
          tabBarLabel: "Home",
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      <Tabs.Screen
        name="add-expense"
        options={{
          title: "Add Expense",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" color={color} size={size} />
          ),
          tabBarLabel: "Add",
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" color={color} size={size} />
          ),
          tabBarLabel: "History",
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: "Achievements",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" color={color} size={size} />
          ),
          tabBarLabel: "Rewards",
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    elevation: 0,
    height: 60,
  },
});
