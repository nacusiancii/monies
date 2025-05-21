import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// Predefined expense categories
const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Education",
  "Other",
];

export default function AddExpense() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const saveExpense = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Missing Description", "Please enter a description");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Missing Category", "Please select a category");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new expense object
      const newExpense = {
        id: Date.now().toString(),
        amount: parseFloat(amount),
        description,
        category: selectedCategory,
        date: new Date().toISOString().split("T")[0],
      };

      // Get existing expenses
      const storedExpenses = await AsyncStorage.getItem("expenses");
      const expenses = storedExpenses ? JSON.parse(storedExpenses) : [];

      // Add new expense to the beginning of the array
      const updatedExpenses = [newExpense, ...expenses];

      // Save updated expenses
      await AsyncStorage.setItem("expenses", JSON.stringify(updatedExpenses));

      // Update points and check for streaks
      await updateGameState();

      // Show success message
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Expense Added!",
        "You earned 10 points for tracking your spending!",
        [{ text: "OK", onPress: () => router.replace("/") }]
      );
    } catch (error) {
      console.error("Error saving expense:", error);
      Alert.alert("Error", "Could not save expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateGameState = async () => {
    try {
      // Update points
      const storedPoints = await AsyncStorage.getItem("points");
      const currentPoints = storedPoints ? parseInt(storedPoints) : 0;
      const newPoints = currentPoints + 10; // Award 10 points for adding an expense
      await AsyncStorage.setItem("points", newPoints.toString());

      // Check and update level if needed
      const storedLevel = await AsyncStorage.getItem("level");
      const currentLevel = storedLevel ? parseInt(storedLevel) : 1;
      const newLevel = Math.floor(newPoints / 100) + 1;

      if (newLevel > currentLevel) {
        await AsyncStorage.setItem("level", newLevel.toString());
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          Alert.alert(
            "Level Up!",
            `Congratulations! You've reached Level ${newLevel}!`
          );
        }, 500);
      }

      // Update streak
      const today = new Date().toISOString().split("T")[0];
      const lastLogDate = await AsyncStorage.getItem("lastLogDate");

      if (lastLogDate) {
        const lastDate = new Date(lastLogDate);
        const currentDate = new Date(today);

        // Calculate difference in days
        const timeDiff = currentDate.getTime() - lastDate.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

        if (dayDiff === 1) {
          // Consecutive day
          const storedStreak = await AsyncStorage.getItem("streak");
          const currentStreak = storedStreak ? parseInt(storedStreak) : 0;
          const newStreak = currentStreak + 1;
          await AsyncStorage.setItem("streak", newStreak.toString());

          // Extra points for streaks
          if (newStreak > 0 && newStreak % 5 === 0) {
            const bonusPoints = newStreak * 2;
            await AsyncStorage.setItem(
              "points",
              (newPoints + bonusPoints).toString()
            );
            setTimeout(() => {
              Alert.alert(
                "Streak Bonus!",
                `${newStreak} day streak! You earned an extra ${bonusPoints} points!`
              );
            }, 1000);
          }
        } else if (dayDiff > 1) {
          // Streak broken
          await AsyncStorage.setItem("streak", "1");
        }
      } else {
        // First time logging
        await AsyncStorage.setItem("streak", "1");
      }

      // Update last log date
      await AsyncStorage.setItem("lastLogDate", today);
    } catch (error) {
      console.error("Error updating game state:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Add New Expense</Text>

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="What was this expense for?"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <Pressable
                  key={category}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category && styles.selectedCategory,
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            style={styles.submitButton}
            onPress={saveExpense}
            disabled={isSubmitting}
          >
            <Ionicons name="save-outline" size={18} color="white" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Saving..." : "Save Expense"}
            </Text>
          </Pressable>

          <Text style={styles.pointsNote}>
            <Ionicons name="star" size={14} color="#FFC107" /> You'll earn 10
            points for tracking this expense!
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  currencySymbol: {
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 10,
    fontSize: 18,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryItem: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  selectedCategory: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  categoryText: {
    fontSize: 14,
    color: "#555",
  },
  selectedCategoryText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  pointsNote: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    marginTop: 16,
  },
});
