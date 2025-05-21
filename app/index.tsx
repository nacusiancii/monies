import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { signOut } from "../utils/auth";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load expenses
      const storedExpenses = await AsyncStorage.getItem("expenses");
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        setExpenses(parsedExpenses);

        // Calculate total spent
        const total = parsedExpenses.reduce(
          (sum: number, expense: Expense) => sum + expense.amount,
          0
        );
        setTotalSpent(total);
      }

      // Load game data
      const storedPoints = await AsyncStorage.getItem("points");
      if (storedPoints) setPoints(parseInt(storedPoints));

      const storedStreak = await AsyncStorage.getItem("streak");
      if (storedStreak) setStreak(parseInt(storedStreak));

      const storedLevel = await AsyncStorage.getItem("level");
      if (storedLevel) setLevel(parseInt(storedLevel));
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const calculateProgress = () => {
    // Calculate level progress (100 points per level)
    const nextLevelPoints = level * 100;
    const currentLevelPoints = (level - 1) * 100;
    const pointsInCurrentLevel = points - currentLevelPoints;
    const progress =
      (pointsInCurrentLevel / (nextLevelPoints - currentLevelPoints)) * 100;
    return progress;
  };

  const navigateToAddExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/add-expense");
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signOut();
      // Navigation will be handled by the auth listener in _layout.tsx
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello Money Tracker!</Text>
        <View style={styles.headerRight}>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {level}</Text>
          </View>
          <Pressable
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            <Ionicons name="log-out-outline" size={24} color="#4CAF50" />
          </Pressable>
        </View>
      </View>

      {/* Points and Level Progress */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsRow}>
          <View>
            <Text style={styles.pointsLabel}>Points</Text>
            <Text style={styles.pointsValue}>{points}</Text>
          </View>
          <View>
            <Text style={styles.pointsLabel}>Streak</Text>
            <Text style={styles.pointsValue}>{streak} days</Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { width: `${calculateProgress()}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {points % 100}/{100} points to next level
        </Text>
      </View>

      {/* Spending Overview */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spending Overview</Text>
        <View style={styles.spendingRow}>
          <Text style={styles.totalLabel}>Total Spent</Text>
          <Text style={styles.totalValue}>₹{totalSpent.toFixed(2)}</Text>
        </View>
      </View>

      {/* Recent Expenses */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Expenses</Text>
        {expenses.length > 0 ? (
          expenses.slice(0, 3).map((expense) => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseLeft}>
                <Text style={styles.expenseCategory}>{expense.category}</Text>
                <Text style={styles.expenseDesc}>{expense.description}</Text>
                <Text style={styles.expenseDate}>{expense.date}</Text>
              </View>
              <Text style={styles.expenseAmount}>
                ₹{expense.amount.toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            No expenses yet! Add your first expense to earn points.
          </Text>
        )}
      </View>

      {/* Quick Add Button */}
      <Pressable style={styles.quickAddButton} onPress={navigateToAddExpense}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.quickAddText}>Quick Add Expense</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelContainer: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
  },
  levelText: {
    color: "white",
    fontWeight: "bold",
  },
  pointsCard: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  pointsLabel: {
    fontSize: 14,
    color: "#757575",
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  progressContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  progressText: {
    fontSize: 12,
    color: "#757575",
    marginTop: 8,
    textAlign: "right",
  },
  card: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  spendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    color: "#757575",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  expenseLeft: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  expenseDesc: {
    fontSize: 16,
    color: "#333",
  },
  expenseDate: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  emptyText: {
    color: "#757575",
    textAlign: "center",
    paddingVertical: 16,
  },
  quickAddButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  quickAddText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  signOutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
});
