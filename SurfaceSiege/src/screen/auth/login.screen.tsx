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
import { useNavigation } from "@react-navigation/native";
import { KButton } from "../../button/KButton";
import { useAuth } from "../../hooks/use-auth.hook";
import axios from "axios";

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

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
      Alert.alert("Succes", "Te-ai autentificat cu succes!");
      // navigation.navigate("ActivityScreen");
    } catch (err) {
      Alert.alert("Eșec", "Credențiale incorecte sau server oprit.");
      console.log("Eroare login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Autentificare</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Parolă"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#666"
      />

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Logare</Text>
        )}
      </TouchableOpacity>

      <View style={styles.separator} />

      <KButton
        title="Înregistrare"
        onPress={() => navigation.navigate("RegisterScreen")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#72b9f4",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 20,
  },
});
