import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useAuth } from "../../hooks/use-auth.hook"; // Verifică path-ul

const SERVER_URL = "https://ana-unfakable-shenita.ngrok-free.dev";

export const TeamsScreen = ({ navigation }: any) => {
  const { userDetails } = useAuth();

  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  // Fallback safe pentru ID-ul userului curent
  const currentUserId = userDetails?.sub || 1;

  const fetchTeams = async () => {
    try {
      // ⚠️ Presupunem că rutele colegului sunt puse pe /teams în app.js
      const res = await axios.get(`${SERVER_URL}/teams`);
      setTeams(res.data);
    } catch (error) {
      console.log("Eroare fetching echipe:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleJoinTeam = async (teamId: number, teamName: string) => {
    setJoiningId(teamId);
    try {
      // ✅ Apelează ruta colegului tău
      await axios.post(`${SERVER_URL}/teams/add-member/${teamId}`, {
        userId: currentUserId,
      });

      Alert.alert(
        "ACCES AUTORIZAT",
        `Ai fost asimilat cu succes în sindicatul [ ${teamName.toUpperCase()} ]. Reboot necesar pentru sincronizare profil.`,
        [{ text: "OK", onPress: () => fetchTeams() }],
      );
    } catch (error) {
      Alert.alert("Eroare", "Rețeaua a respins conexiunea. Încearcă din nou.");
      console.log(error);
    } finally {
      setJoiningId(null);
    }
  };

  const renderTeamCard = ({ item }: { item: any }) => {
    // Calculăm datele pentru demo: Câți membri are din backend
    const memberCount = item.members ? item.members.length : 0;

    // Verificăm dacă eu sunt deja în echipa asta (vizual)
    const isMyTeam =
      item.members?.some((m: any) => m.id === currentUserId) ||
      userDetails?.teamId === item.id;

    // Hackathon trick: Generăm un număr "cool" de afișe pe baza id-ului și a membrilor
    const hackedPosters = memberCount * 3 + (item.id % 5);

    return (
      <View style={[styles.teamCard, isMyTeam && styles.myTeamCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.teamName}>{item.nume}</Text>
          {isMyTeam && <Text style={styles.myTeamBadge}>ACTIVE</Text>}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{memberCount}</Text>
            <Text style={styles.statLabel}>OPERATORI</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{hackedPosters}</Text>
            <Text style={styles.statLabel}>ZONE COMPROMISE</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.joinBtn, isMyTeam && styles.joinedBtn]}
          disabled={isMyTeam || joiningId === item.id}
          onPress={() => handleJoinTeam(item.id, item.nume)}
        >
          {joiningId === item.id ? (
            <ActivityIndicator color="#0A1128" />
          ) : (
            <Text
              style={[styles.joinBtnText, isMyTeam && styles.joinedBtnText]}
            >
              {isMyTeam ? "CURRENT SYNDICATE" : "JOIN SYNDICATE"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#0A1128", "#030613", "#000000"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Factions</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#3B82F6"
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={teams}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTeamCard}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>
                Nu există facțiuni în rețea. Fii primul care inițiază una.
              </Text>
            )}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  backBtn: { paddingRight: 15 },
  backText: { color: "#3B82F6", fontSize: 24, fontWeight: "bold" },
  title: { fontSize: 28, fontWeight: "900", color: "#FFF", letterSpacing: 1 },

  listContainer: { paddingBottom: 50, gap: 20 },

  teamCard: {
    backgroundColor: "rgba(10, 15, 36, 0.6)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.15)",
  },
  myTeamCard: {
    borderColor: "#00e1ff",
    backgroundColor: "rgba(0, 225, 255, 0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  teamName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },
  myTeamBadge: {
    backgroundColor: "rgba(0, 225, 255, 0.2)",
    color: "#00e1ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: "bold",
    overflow: "hidden",
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statValue: { color: "#3B82F6", fontSize: 24, fontWeight: "900" },
  statLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "700",
    letterSpacing: 1,
  },

  joinBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  joinedBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  joinBtnText: {
    color: "#0A1128",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  joinedBtnText: { color: "rgba(255,255,255,0.3)" },

  emptyText: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});
