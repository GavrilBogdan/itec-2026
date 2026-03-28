import React from "react";
import { StyleSheet, Pressable, Text, Platform } from "react-native";

interface KButtonProps {
  title: string;
  onPress: () => void;
  variant?: "default" | "glow";
}

export function KButton({ title, onPress, variant = "default" }: KButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed ? styles.pressedState : undefined,
        pressed && variant === "glow" ? styles.pressedGlow : undefined
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",

    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    ...Platform.select({
      android: {
        elevation: 4,
      },
    }),
  },
  pressedState: {
    
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  pressedGlow: {
    
    backgroundColor: "#6366F1",
    shadowColor: "#818CF8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    ...Platform.select({
      android: {
        elevation: 12,
      },
    }),
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});