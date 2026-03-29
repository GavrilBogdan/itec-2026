import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

import { useAuth } from "../../hooks/use-auth.hook";

const SERVER_URL = "https://ana-unfakable-shenita.ngrok-free.dev";

type RootStackParamList = {
  ProfileScreen: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ProfileScreen">;
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { userDetails, logout } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("Digital artist mapping the urban grid.");

  useEffect(() => {
    if (userDetails) {
      setAlias(userDetails.nume || "");
      setEmail(userDetails.email || "");
    }
  }, [userDetails]);

  const handleSaveProfile = async () => {
    if (!userDetails?.sub) {
      Alert.alert("Eroare", "Nu ești logat corect.");
      return;
    }

    setIsLoading(true);

    try {
      await axios.put(`${SERVER_URL}/users/${userDetails.sub}/update`, {
        nume: alias,
      });

      Alert.alert(
        "Identitate Actualizată",
        "Datele au fost salvate în rețea. Sistemul necesită o re-autentificare pentru a aplica noul Alias.",
        [
          {
            text: "REBOOT SYSTEM (Login)",
            onPress: () => {
              logout();
            },
          },
        ],
      );
    } catch (error: any) {
      console.error("Eroare la actualizare profil:", error.message);
      Alert.alert("Eroare", "Nu am putut salva profilul pe server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0A1128", "#030613", "#000000"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Identity</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ALIAS (Nume Vandal)</Text>
              <TextInput
                style={styles.input}
                value={alias}
                onChangeText={setAlias}
                placeholder="Introdu noul alias"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADRESS</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={email}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#0A1128" />
              ) : (
                <Text style={styles.saveBtnText}>Save Configuration</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 40 },
  backBtn: { paddingRight: 15 },
  backText: { color: "#3B82F6", fontSize: 24, fontWeight: "bold" },
  title: { fontSize: 28, fontWeight: "900", color: "#FFF", letterSpacing: 1 },

  formContainer: { flex: 1, gap: 24 },
  inputGroup: { gap: 8 },
  label: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "rgba(10, 15, 36, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    borderRadius: 12,
    padding: 16,
    color: "#FFF",
    fontSize: 16,
  },
  inputDisabled: { opacity: 0.5, backgroundColor: "rgba(0,0,0,0.5)" },
  textArea: { height: 100, textAlignVertical: "top" },

  footer: { marginBottom: 30 },
  saveBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  saveBtnText: {
    color: "#0A1128",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
