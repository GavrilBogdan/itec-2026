import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useSetAtom } from "jotai";
import { tokenAtom } from "../../store";

export const SettingsScreen = ({ navigation }: any) => {
  const setToken = useSetAtom(tokenAtom);

  const handleLogout = async () => {
    Alert.alert(
      "TERMINATE SESSION",
      "Sigur vrei să te deconectezi din rețeaua Surface Siege?",
      [
        { text: "ABORT", style: "cancel" },
        {
          text: "CONFIRM",
          style: "destructive",
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync("userToken");
              setToken(null);
              console.log("✅ Session terminated globally.");
            } catch (error) {
              console.error("Logout error:", error);
            }
          },
        },
      ],
    );
  };

  return (
    <LinearGradient
      colors={["#0A1128", "#030613", "#000000"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>SURFACE_SIEGE</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.subtitle}>SYSTEM PREFERENCES</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {/* ✅ NOU: BUTONUL PENTRU ECHIPE */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("TeamsScreen")} // ASIGURĂ-TE CĂ AI RUTA ASTA ÎN NAVIGATOR
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Syndicates (Teams)</Text>
              <Text style={styles.chevron}>→</Text>
            </View>
            <Text style={styles.cardDesc}>
              Aliante de hackeri. Găsește-ți echipa și cucerește rețeaua.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("ProfileScreen")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Identity</Text>
              <Text style={styles.chevron}>→</Text>
            </View>
            <Text style={styles.cardDesc}>
              Gestionează-ți profilul de vandal digital și alias-ul.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("SecurityScreen")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Security & Privacy</Text>
              <Text style={styles.chevron}>→</Text>
            </View>
            <Text style={styles.cardDesc}>
              Protocoale de criptare și parole.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logOutBtn}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Text style={styles.logOutText}>Disconnect</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>v 1.0.0-beta // ITEC 2026</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 24 },
  header: { marginTop: 40, marginBottom: 40 },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B82F6",
    marginRight: 8,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  subtitle: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  menuContainer: { flex: 1, gap: 16 },
  card: {
    backgroundColor: "rgba(10, 15, 36, 0.6)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.15)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  chevron: { color: "#3B82F6", fontSize: 20 },
  cardDesc: { color: "rgba(255, 255, 255, 0.4)", fontSize: 13, lineHeight: 18 },
  footer: { alignItems: "center", paddingBottom: 20 },
  logOutBtn: {
    width: "100%",
    backgroundColor: "rgba(225, 29, 72, 0.08)",
    borderRadius: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.25)",
    alignItems: "center",
    marginBottom: 16,
  },
  logOutText: { color: "#F43F5E", fontSize: 16, fontWeight: "800" },
  versionText: {
    color: "rgba(255, 255, 255, 0.15)",
    fontSize: 10,
    letterSpacing: 2,
  },
});
