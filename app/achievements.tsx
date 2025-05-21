import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  backgroundColor: string;
  condition: string;
  unlocked: boolean;
  progress?: number; // Optional percentage progress for locked badges
}

export default function Achievements() {
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadGameStats();
  }, []);

  const loadGameStats = async () => {
    try {
      // Load points and game data
      const storedPoints = await AsyncStorage.getItem("points");
      if (storedPoints) setPoints(parseInt(storedPoints));

      const storedStreak = await AsyncStorage.getItem("streak");
      if (storedStreak) setStreak(parseInt(storedStreak));

      const storedLevel = await AsyncStorage.getItem("level");
      if (storedLevel) setLevel(parseInt(storedLevel));

      // Calculate level progress
      const nextLevelPoints = level * 100;
      const currentLevelPoints = (level - 1) * 100;
      const pointsInCurrentLevel = points - currentLevelPoints;
      const progressPercent =
        (pointsInCurrentLevel / (nextLevelPoints - currentLevelPoints)) * 100;
      setProgress(progressPercent);

      // Load stored badges (or create them if first launch)
      const storedBadges = await AsyncStorage.getItem("badges");
      if (storedBadges) {
        setBadges(JSON.parse(storedBadges));
      } else {
        // Create default badges
        const defaultBadges = createDefaultBadges();
        // Check which badges are unlocked based on user's stats
        const updatedBadges = checkBadgeUnlocks(defaultBadges, points, streak);
        setBadges(updatedBadges);
        await AsyncStorage.setItem("badges", JSON.stringify(updatedBadges));
      }
    } catch (error) {
      console.error("Error loading game stats:", error);
    }
  };

  const createDefaultBadges = (): Badge[] => {
    return [
      {
        id: "1",
        name: "First Expense",
        description: "Added your first expense",
        icon: "receipt-outline",
        iconColor: "#FF9800",
        backgroundColor: "#FFF3E0",
        condition: "Add 1 expense",
        unlocked: false,
      },
      {
        id: "2",
        name: "Dedicated Tracker",
        description: "Added 10 expenses",
        icon: "list",
        iconColor: "#2196F3",
        backgroundColor: "#E3F2FD",
        condition: "Add 10 expenses",
        unlocked: false,
        progress: 0,
      },
      {
        id: "3",
        name: "Streak Starter",
        description: "Logged expenses 3 days in a row",
        icon: "flame",
        iconColor: "#FF5722",
        backgroundColor: "#FBE9E7",
        condition: "3-day streak",
        unlocked: false,
        progress: 0,
      },
      {
        id: "4",
        name: "Week Warrior",
        description: "Logged expenses 7 days in a row",
        icon: "calendar",
        iconColor: "#9C27B0",
        backgroundColor: "#F3E5F5",
        condition: "7-day streak",
        unlocked: false,
        progress: 0,
      },
      {
        id: "5",
        name: "Category Collector",
        description: "Used 5 different categories",
        icon: "apps",
        iconColor: "#4CAF50",
        backgroundColor: "#E8F5E9",
        condition: "Use 5 categories",
        unlocked: false,
        progress: 0,
      },
      {
        id: "6",
        name: "Budget Master",
        description: "Set up 3 different budgets",
        icon: "wallet",
        iconColor: "#795548",
        backgroundColor: "#EFEBE9",
        condition: "Create 3 budgets",
        unlocked: false,
        progress: 0,
      },
      {
        id: "7",
        name: "Level 5 Achiever",
        description: "Reached Level 5",
        icon: "star",
        iconColor: "#FFC107",
        backgroundColor: "#FFF8E1",
        condition: "Reach Level 5",
        unlocked: false,
        progress: 0,
      },
      {
        id: "8",
        name: "Money Guru",
        description: "Tracked over ₹10,000 in expenses",
        icon: "cash",
        iconColor: "#8BC34A",
        backgroundColor: "#F1F8E9",
        condition: "Track ₹10,000",
        unlocked: false,
        progress: 0,
      },
    ];
  };

  const checkBadgeUnlocks = (
    badges: Badge[],
    points: number,
    streak: number
  ): Badge[] => {
    // We would check actual conditions here and update the unlocked status
    // For now just unlocking based on simple conditions
    return badges.map((badge) => {
      let newBadge = { ...badge };

      // Example conditions
      if (badge.id === "1" && points >= 10) {
        newBadge.unlocked = true;
      }

      if (badge.id === "3" && streak >= 3) {
        newBadge.unlocked = true;
      } else if (badge.id === "3") {
        newBadge.progress = (streak / 3) * 100;
      }

      if (badge.id === "4" && streak >= 7) {
        newBadge.unlocked = true;
      } else if (badge.id === "4") {
        newBadge.progress = (streak / 7) * 100;
      }

      if (badge.id === "7" && level >= 5) {
        newBadge.unlocked = true;
      } else if (badge.id === "7") {
        newBadge.progress = (level / 5) * 100;
      }

      return newBadge;
    });
  };

  const handleBadgePress = (badge: Badge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBadge(badge);

    // Animate fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseDetail = () => {
    // Animate fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedBadge(null);
    });
  };

  return (
    <View style={styles.container}>
      {/* Level and Points Section */}
      <View style={styles.levelCard}>
        <View style={styles.levelIconContainer}>
          <Ionicons name="trophy" size={40} color="#FFC107" />
          <Text style={styles.levelText}>Level {level}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Points</Text>
            <Text style={styles.statValue}>{points}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{streak} days</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {points % 100}/{100} points to next level
        </Text>
      </View>

      {/* Achievements Section */}
      <Text style={styles.sectionTitle}>Achievements</Text>
      <FlatList
        data={badges}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.badgesContainer}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.badgeItem,
              { backgroundColor: item.backgroundColor },
            ]}
            onPress={() => handleBadgePress(item)}
          >
            <View style={styles.badgeContent}>
              <View
                style={[
                  styles.badgeIconContainer,
                  !item.unlocked && styles.lockedBadge,
                ]}
              >
                <Ionicons
                  name={item.unlocked ? (item.icon as any) : "lock-closed"}
                  size={28}
                  color={item.unlocked ? item.iconColor : "#BDBDBD"}
                />
              </View>
              <Text
                style={[styles.badgeName, !item.unlocked && styles.lockedText]}
                numberOfLines={2}
              >
                {item.name}
              </Text>

              {!item.unlocked &&
                item.progress !== undefined &&
                item.progress > 0 && (
                  <View style={styles.badgeProgressContainer}>
                    <View
                      style={[
                        styles.badgeProgressBar,
                        { width: `${item.progress}%` },
                      ]}
                    />
                  </View>
                )}
            </View>
          </Pressable>
        )}
      />

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Pressable style={styles.modalBackground} onPress={handleCloseDetail}>
            <View style={styles.modalContent}>
              <View
                style={[
                  styles.detailBadgeContainer,
                  { backgroundColor: selectedBadge.backgroundColor },
                ]}
              >
                <Ionicons
                  name={
                    selectedBadge.unlocked
                      ? (selectedBadge.icon as any)
                      : "lock-closed"
                  }
                  size={64}
                  color={
                    selectedBadge.unlocked ? selectedBadge.iconColor : "#BDBDBD"
                  }
                />
              </View>

              <Text style={styles.detailBadgeName}>{selectedBadge.name}</Text>

              <Text style={styles.detailBadgeDesc}>
                {selectedBadge.description}
              </Text>

              <Text style={styles.detailBadgeCondition}>
                {selectedBadge.unlocked
                  ? "✓ Unlocked"
                  : `To unlock: ${selectedBadge.condition}`}
              </Text>

              {!selectedBadge.unlocked &&
                selectedBadge.progress !== undefined && (
                  <View style={styles.detailProgressContainer}>
                    <View
                      style={[
                        styles.detailProgressBar,
                        { width: `${selectedBadge.progress}%` },
                      ]}
                    />
                    <Text style={styles.detailProgressText}>
                      {Math.round(selectedBadge.progress)}% Complete
                    </Text>
                  </View>
                )}

              <Pressable style={styles.closeButton} onPress={handleCloseDetail}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  levelCard: {
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
  levelIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  levelText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#757575",
  },
  statValue: {
    fontSize: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    color: "#333",
  },
  badgesContainer: {
    padding: 8,
  },
  badgeItem: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  badgeContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  lockedBadge: {
    backgroundColor: "#F5F5F5",
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  lockedText: {
    color: "#757575",
  },
  badgeProgressContainer: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    width: "100%",
    marginTop: 8,
    overflow: "hidden",
  },
  badgeProgressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  detailBadgeContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  detailBadgeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  detailBadgeDesc: {
    fontSize: 16,
    color: "#555",
    marginBottom: 16,
    textAlign: "center",
  },
  detailBadgeCondition: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
    marginBottom: 16,
  },
  detailProgressContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    width: "100%",
    marginBottom: 8,
    overflow: "hidden",
  },
  detailProgressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  detailProgressText: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 16,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 20,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
