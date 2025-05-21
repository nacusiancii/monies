import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

// Predefined expense categories (same as in add-expense.tsx)
const CATEGORIES = [
  "All",
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Education",
  "Other",
];

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, selectedCategory, sortOrder, searchQuery]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const storedExpenses = await AsyncStorage.getItem("expenses");

      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        setExpenses(parsedExpenses);
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = [...expenses];

    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (expense) => expense.category === selectedCategory
      );
    }

    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (expense) =>
          expense.description.toLowerCase().includes(query) ||
          expense.category.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortOrder) {
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case "highest":
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case "lowest":
        filtered.sort((a, b) => a.amount - b.amount);
        break;
    }

    setFilteredExpenses(filtered);
  };

  const handleCategorySelect = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  };

  const toggleSortOrder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const orders: Array<"newest" | "oldest" | "highest" | "lowest"> = [
      "newest",
      "oldest",
      "highest",
      "lowest",
    ];
    const currentIndex = orders.indexOf(sortOrder);
    const nextIndex = (currentIndex + 1) % orders.length;
    setSortOrder(orders[nextIndex]);
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case "newest":
        return "Newest First";
      case "oldest":
        return "Oldest First";
      case "highest":
        return "Highest First";
      case "lowest":
        return "Lowest First";
    }
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseTop}>
        <View style={styles.expenseLeft}>
          <Text style={styles.expenseCategory}>{item.category}</Text>
          <Text style={styles.expenseDesc}>{item.description}</Text>
        </View>
        <Text style={styles.expenseAmount}>₹{item.amount.toFixed(2)}</Text>
      </View>
      <View style={styles.expenseBottom}>
        <Text style={styles.expenseDate}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#757575" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search expenses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#757575" />
          </Pressable>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {/* Category Pills */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.categoryPill,
                selectedCategory === item && styles.selectedCategoryPill,
              ]}
              onPress={() => handleCategorySelect(item)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === item && styles.selectedCategoryPillText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />

        {/* Sort Button */}
        <Pressable style={styles.sortButton} onPress={toggleSortOrder}>
          <Ionicons
            name={
              sortOrder.includes("highest") || sortOrder.includes("newest")
                ? "arrow-down"
                : "arrow-up"
            }
            size={16}
            color="#555"
          />
          <Text style={styles.sortButtonText}>{getSortLabel()}</Text>
        </Pressable>
      </View>

      {/* Expenses List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : filteredExpenses.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="receipt-outline" size={64} color="#BDBDBD" />
          <Text style={styles.emptyText}>
            {expenses.length === 0
              ? "No expenses yet! Add your first expense to start tracking."
              : "No expenses match your filters."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpenseItem}
          contentContainerStyle={styles.expensesList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filtersContainer: {
    paddingBottom: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "white",
    marginRight: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedCategoryPill: {
    backgroundColor: "#4CAF50",
  },
  categoryPillText: {
    color: "#757575",
    fontWeight: "500",
  },
  selectedCategoryPillText: {
    color: "white",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 16,
    marginTop: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sortButtonText: {
    color: "#555",
    marginLeft: 4,
    fontSize: 14,
  },
  expensesList: {
    padding: 16,
  },
  expenseItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  expenseTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  expenseLeft: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
  },
  expenseDesc: {
    fontSize: 16,
    color: "#333",
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  expenseBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expenseDate: {
    fontSize: 12,
    color: "#757575",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
  },
});
