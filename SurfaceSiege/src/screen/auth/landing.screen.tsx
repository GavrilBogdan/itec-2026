import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/use-auth.hook";
import axios from "axios";

export const LandingScreen = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [fontsLoaded] = useFonts({ Poppins_600SemiBold });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validatePassword = (value: string) => value.length >= 2;

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert("Eroare", "Introduceți adresa de email și parola.");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      Alert.alert("Eroare", "Adresa de email nu este validă.");
      return;
    }

    if (!validatePassword(cleanPassword)) {
      Alert.alert("Eroare", "Parola trebuie să aibă minim 2 caractere.");
      return;
    }

    setLoading(true);

    try {
      const BASE_URL = "https://ana-unfakable-shenita.ngrok-free.dev";

      const response = await axios.post(`${BASE_URL}/users/login`, {
        email: cleanEmail,
        password: cleanPassword,
      });

      const token = response?.data?.token;
      const rawToken =
        typeof token === "string" ? token.replace("Bearer ", "") : "";

      if (!rawToken) {
        Alert.alert("Eroare", "Token invalid primit de la server.");
        return;
      }

      login(rawToken);
      Alert.alert("Succes", "Autentificare reușită!");
    } catch (err) {
      Alert.alert("Eșec", "Credențiale incorecte sau server oprit.");
      console.log("Eroare login:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#002A54", "#001630"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.mainTitle}>Surface Siege</Text>

        <View style={styles.card}>
          <Text style={styles.header}>Autentificare</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#9CB6DA"
          />

          <TextInput
            style={styles.input}
            placeholder="Parolă"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#9CB6DA"
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Logare</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("RegisterScreen")}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Înregistrare</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  mainTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 34,
    color: "#F8F9FA",
    textAlign: "center",
    marginBottom: 52,
    letterSpacing: 1.2,
    textShadowColor: "rgba(130, 176, 255, 0.65)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(10, 47, 97, 0.82)",
    borderRadius: 24,
    padding: 26,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    color: "#FFFFFF",
  },
  input: {
    height: 52,
    borderColor: "#2C5D99",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 16,
    fontSize: 16,
    color: "#FFFFFF",
    backgroundColor: "#0C2340",
  },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#2962FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2C5D99",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryButtonText: {
    color: "#D9E7FF",
    fontSize: 17,
    fontWeight: "700",
  },
});