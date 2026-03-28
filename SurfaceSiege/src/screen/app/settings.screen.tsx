import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

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

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <LinearGradient
      colors={["#1e3a8a", "#1f0590", "#070051"]}
      style={styles.container}
    >
      <Text style={styles.title}>Setări ⚙️</Text>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ProfileScreen")}
        >
          <Text style={styles.menuText}>Profil 📝</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("SecurityScreen")}
        >
          <Text style={styles.menuText}>Securitate 🔒</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("NotificationsScreen")}
        >
          <Text style={styles.menuText}>Notificări 🔔</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
        <LinearGradient
          colors={["#f43f5e", "#f97316"]}
          style={styles.logOutBtn}
        >
          <Text style={styles.logOutText}>Log out</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#e0e7ff",
    textShadowColor: "#8b5cf6",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  menuContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 30,
    padding: 25,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    gap: 15,
    alignItems: "center",
  },
  menuItem: {
    backgroundColor: "rgba(142, 148, 255, 0.2)",
    borderWidth: 1,
    borderColor: "#8b5cf6",
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 20,
    minWidth: 250,
    textAlign: "center",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  menuText: {
    color: "#f0f0ff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  logOutBtn: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 35,
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  logOutText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});
