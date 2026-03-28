import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

export function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validatePassword = (value: string) => value.length >= 2;

  const handleRegister = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      Alert.alert("Eroare", "Completează toate câmpurile.");
      return;
    }

    if (cleanName.length < 2) {
      Alert.alert("Eroare", "Numele trebuie să aibă minim 2 caractere.");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      Alert.alert("Eroare", "Email invalid.");
      return;
    }

    if (!validatePassword(cleanPassword)) {
      Alert.alert("Eroare", "Parola prea scurtă.");
      return;
    }

    setLoading(true);

    try {
      await axios.post("/users/register", {
        nume: cleanName,
        email: cleanEmail,
        parola: cleanPassword,
      });

      Alert.alert("Succes", "Cont creat cu succes!");
      setName("");
      setEmail("");
      setPassword("");
      navigation.navigate("LoginScreen");
    } catch (err: unknown) {
      const axiosError = axios.isAxiosError<{ error?: string; message?: string }>(err)
        ? err
        : undefined;
      const responseData = axiosError?.response?.data;
      const status = axiosError?.response?.status;

      if (status && status >= 500) {
        Alert.alert("Eșec", "Eroare de server.");
        return;
      }

      const writeErrorMessage =
        responseData?.error ||
        responseData?.message ||
        (status && status >= 400 && status < 500 ? "Eroare de scris/date." : undefined) ||
        "Nu s-a putut crea contul. Verifică datele sau conexiunea la server.";

      Alert.alert("Eșec", writeErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#020617", "#0f172a", "#1e3a8a"]}
      style={styles.container}
    >
      {/* CARD */}
      <BlurView intensity={60} tint="dark" style={styles.card}>
        <Text style={styles.title}>Create Account</Text>

        {/* INPUTS */}
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#7aa2ff"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#7aa2ff"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#7aa2ff"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* BUTTON */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          <LinearGradient
            colors={["#2563eb", "#3b82f6"]}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>REGISTER</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },

  // 🔥 GLASS CARD
  card: {
    width: "85%",
    borderRadius: 25,
    padding: 24,
    backgroundColor: "rgba(15,23,42,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  title: {
    fontSize: 28,
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",

    // glow
    textShadowColor: "#3b82f6",
    textShadowRadius: 12,
  },

  input: {
    backgroundColor: "rgba(30,41,59,0.8)",
    borderRadius: 14,
    padding: 14,
    color: "#fff",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  button: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
  },

  buttonGradient: {
    padding: 16,
    alignItems: "center",
    borderRadius: 14,

    // glow
    shadowColor: "#2563eb",
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 1,
  },
});
