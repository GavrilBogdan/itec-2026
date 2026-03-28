import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../hooks/use-auth.hook";

export const SettingsScreen = () => {
  const { logout } = useAuth();

  const floatA = useRef(new Animated.Value(0)).current;
  const floatB = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(floatA, {
          toValue: 1,
          duration: 4500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatA, {
          toValue: 0,
          duration: 4500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const loopB = Animated.loop(
      Animated.sequence([
        Animated.timing(floatB, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatB, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loopA.start();
    loopB.start();

    return () => {
      loopA.stop();
      loopB.stop();
    };
  }, [floatA, floatB]);

  const orbATranslateY = floatA.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const orbBTranslateY = floatB.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <LinearGradient
      colors={["#021129", "#062349", "#0A2E5C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb,
          styles.orbTop,
          {
            transform: [{ translateY: orbATranslateY }],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb,
          styles.orbBottom,
          {
            transform: [{ translateY: orbBTranslateY }],
          },
        ]}
      />

      <View style={styles.card}>
        <Text style={styles.title}>Setări</Text>
        <Text style={styles.subtitle}>Gestionează contul și preferințele tale</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(88, 155, 255, 0.18)",
  },
  orbTop: {
    width: 220,
    height: 220,
    top: 70,
    left: -40,
  },
  orbBottom: {
    width: 260,
    height: 260,
    bottom: 40,
    right: -70,
    backgroundColor: "rgba(117, 187, 255, 0.15)",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(6, 22, 45, 0.7)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#EAF2FF",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 15,
    color: "#B6CBEC",
    textAlign: "center",
    marginBottom: 26,
  },
  logoutButton: {
    backgroundColor: "#1E4F8E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5B8ED0",
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});