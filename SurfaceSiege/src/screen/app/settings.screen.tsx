import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type RootStackParamList = {
  SettingsScreen: undefined;
  ProfileScreen: undefined;
  SecurityScreen: undefined;
  NotificationsScreen: undefined;
  LoginScreen: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "SettingsScreen">;
};

const { width } = Dimensions.get("window");

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <LinearGradient
      // Gradient subtil de la un Navy Blue foarte profund spre Black
      colors={["#0A1128", "#030613", "#000000"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>SURFACE_SIEGE </Text>
          <View style={styles.badgeContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.subtitle}>SYSTEM PREFERENCES</Text>
          </View>
        </View>

        {/* MENIU PRINCIPAL */}
        <View style={styles.menuContainer}>
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
              Protocoale de criptare, parole și vizibilitate cont.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("NotificationsScreen")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>System Alerts</Text>
              <Text style={styles.chevron}>→</Text>
            </View>
            <Text style={styles.cardDesc}>
              Configurează ping-urile când apare un canvas nou.
            </Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER / LOGOUT */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logOutBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("LoginScreen")}
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },

  // -- HEADER --
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
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
    backgroundColor: "rgba(59, 130, 246, 0.15)", // Fundal albastru translucid
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
    backgroundColor: "#3B82F6", // Electric Blue
    marginRight: 8,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  subtitle: {
    color: "#60A5FA", // Light Blue
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },

  // -- MENIU (CARDS) --
  menuContainer: {
    flex: 1,
    gap: 16,
  },
  card: {
    backgroundColor: "rgba(10, 15, 36, 0.6)", // Navy transparent
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)", // Contur subtil albastru
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  chevron: {
    color: "#3B82F6",
    fontSize: 20,
    fontWeight: "300",
  },
  cardDesc: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
    lineHeight: 18,
  },

  // -- FOOTER --
  footer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logOutBtn: {
    width: "100%",
    backgroundColor: "rgba(225, 29, 72, 0.1)", // Roșu/Crimson transparent
    borderRadius: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.3)",
    alignItems: "center",
    marginBottom: 20,
  },
  logOutText: {
    color: "#F43F5E",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  versionText: {
    color: "rgba(255, 255, 255, 0.2)",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
  },
});
