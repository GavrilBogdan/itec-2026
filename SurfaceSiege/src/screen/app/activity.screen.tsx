import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  RefreshControl,
  Animated,
  Vibration,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

import { useAuth } from "../../hooks/use-auth.hook";

const SERVER_URL = "https://ana-unfakable-shenita.ngrok-free.dev";

const PRIMARY_COLOR = "#4F46E5";
const TECH_CYAN = "#00e1ff";

interface ScanActivity {
  id: string;
  userName: string;
  posterTitle: string;
  location: string;
  timestamp: string;
}

const getRelativeTime = (timestamp: string) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "chiar acum";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `acum ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `acum ${diffInHours} ore`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `acum ${diffInDays} zile`;
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ActivityCard = React.memo(
  ({
    item,
    index,
    onPress,
  }: {
    item: ScanActivity;
    index: number;
    onPress: (id: string) => void;
  }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, [index, fadeAnim, slideAnim, scaleAnim]);

    return (
      <AnimatedTouchable
        activeOpacity={0.7}
        onPress={() => onPress(item.id)}
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.userContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{item.userName}</Text>
          </View>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>
              {getRelativeTime(item.timestamp)}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.posterTitle}>{item.posterTitle}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="scan-outline" size={14} color={TECH_CYAN} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
      </AnimatedTouchable>
    );
  },
);

export const ActivityScreen = () => {
  const { userDetails } = useAuth();

  const loggedUser = useMemo(() => {
    const safeUser = userDetails || {};
    return {
      id: safeUser.sub || 1, 
      nume: safeUser.nume || safeUser.email?.split("@")[0] || "Operator",
    };
  }, [userDetails]);

  const [activities, setActivities] = useState<ScanActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  
  const fetchMyPosters = async () => {
    try {
      
      const response = await axios.get(`${SERVER_URL}/war/posters`);
      const allPosters = response.data;
      const myActivities: ScanActivity[] = [];

      await Promise.all(
        allPosters.map(async (poster: any) => {
          try {
            const drawRes = await axios.get(
              `${SERVER_URL}/war/poster/${poster.id}/drawings`,
            );
            const drawings = drawRes.data;
            const myDrawings = drawings.filter(
              (d: any) => d.userId === loggedUser.id,
            );

            if (myDrawings.length > 0) {
              const lastDrawing = myDrawings[myDrawings.length - 1];

              myActivities.push({
                id: poster.id.toString(),
                userName: loggedUser.nume,
                posterTitle: poster.nume,
                location: "Zonă compromisă de tine",
                timestamp: lastDrawing.createdAt || new Date().toISOString(),
              });
            }
          } catch (err) {
          }
        }),
      );

      myActivities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setActivities(myActivities);
    } catch (error) {
      console.error("Eroare la aducerea posterelor tale din DB:", error);
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchMyPosters();
  }, [loggedUser.id]); 

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(40);
    await fetchMyPosters();
    Vibration.vibrate(20);
    setRefreshing(false);
  }, []);

  const handleCardPress = useCallback(async (id: string) => {
    Vibration.vibrate(20);
    await fetchMyPosters();
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: ScanActivity; index: number }) => (
      <ActivityCard item={item} index={index} onPress={handleCardPress} />
    ),
    [handleCardPress],
  );

  const renderEmptyState = () => {
    if (initialLoad) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="planet-outline"
          size={64}
          color="rgba(0, 225, 255, 0.2)"
        />
        <Text style={styles.emptyTitle}>Nicio activitate</Text>
        <Text style={styles.emptyText}>
          Încă nu ai revendicat niciun afiș. Intră în modul Scanner și începe să
          lași o urmă în rețea!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="pulse" size={26} color={TECH_CYAN} />
            <View style={styles.iconGlow} />
          </View>
          <View>
            <Text style={styles.title}>
              ISTORIC <Text style={{ color: PRIMARY_COLOR }}>PROPRIU</Text>
            </Text>
            <Text style={styles.subtitle}>Logat ca {loggedUser.nume}</Text>
          </View>
        </View>

        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContainer,
            activities.length === 0 && { flex: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={TECH_CYAN}
              title="Sincronizare cu serverul..."
              titleColor={TECH_CYAN}
              colors={[TECH_CYAN, PRIMARY_COLOR]}
              progressBackgroundColor="#2A2A35"
              progressViewOffset={10}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  container: { flex: 1, backgroundColor: "#050505" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(0, 225, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 225, 255, 0.2)",
    position: "relative",
  },
  iconGlow: {
    position: "absolute",
    width: 20,
    height: 20,
    backgroundColor: TECH_CYAN,
    borderRadius: 10,
    opacity: 0.2,
    shadowColor: TECH_CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(0, 225, 255, 0.7)",
    marginTop: 4,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  listContainer: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#111111",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_COLOR,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  userContainer: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(79, 70, 229, 0.15)",
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: PRIMARY_COLOR,
    fontWeight: "900",
    fontSize: 17,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f4f4f5",
    letterSpacing: 0.3,
  },
  timeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  timeText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  cardBody: { marginTop: 0 },
  posterTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 225, 255, 0.05)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  locationText: {
    fontSize: 13,
    color: TECH_CYAN,
    marginLeft: 6,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    lineHeight: 22,
  },
});
