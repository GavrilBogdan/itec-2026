import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type RootStackParamList = { SecurityScreen: undefined };
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "SecurityScreen">;
};

export const SecurityScreen: React.FC<Props> = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPrivate, setIsPrivate] = useState(false); // Switch vizibilitate cont

  const handleUpdateSecurity = () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Eroare", "Completează ambele câmpuri pentru parolă.");
      return;
    }
    // Funcția ta pentru baza de date aici
    Alert.alert("Securitate", "Credențiale actualizate (Simulat).");
    setCurrentPassword("");
    setNewPassword("");
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
          <Text style={styles.title}>Security</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>SCHIMBĂ PAROLA</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Parola Curentă"
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              placeholder="Noua Parolă"
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleUpdateSecurity}
          >
            <Text style={styles.actionBtnText}>Update Credentials</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 40 }]}>PRIVACY</Text>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardTitle}>Mod Stealth</Text>
              <Text style={styles.cardDesc}>
                Ascunde desenele tale din profilul public.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, isPrivate && styles.toggleActive]}
              onPress={() => setIsPrivate(!isPrivate)}
            >
              <View
                style={[styles.toggleKnob, isPrivate && styles.knobActive]}
              />
            </TouchableOpacity>
          </View>
        </View>
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

  content: { flex: 1 },
  sectionTitle: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "rgba(10, 15, 36, 0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
    paddingVertical: 5,
    marginBottom: 15,
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    color: "#FFF",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    marginHorizontal: 20,
  },

  actionBtn: {
    alignSelf: "flex-end",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  actionBtnText: { color: "#3B82F6", fontWeight: "700" },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(10, 15, 36, 0.6)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  cardTitle: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  cardDesc: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 4,
    maxWidth: "80%",
  },

  toggleBtn: {
    width: 50,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    justifyContent: "center",
    padding: 2,
  },
  toggleActive: { backgroundColor: "#3B82F6" },
  toggleKnob: {
    width: 24,
    height: 24,
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  knobActive: { transform: [{ translateX: 22 }] },
});
