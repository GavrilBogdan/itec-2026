import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export const ScanScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>Se verifică permisiunea camerei...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>Nu ai acordat acces la cameră.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Permite camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isActive ? (
        <CameraView style={StyleSheet.absoluteFill} facing={facing} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.pausedLayer]}>
          <Text style={styles.pausedText}>Camera este oprită</Text>
        </View>
      )}

      <View style={styles.overlay}>
        <Text style={styles.title}>Ecranul de Scanare</Text>

        <View style={styles.scanFrame} />

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() =>
              setFacing((prev) => (prev === "back" ? "front" : "back"))
            }
          >
            <Text style={styles.controlText}>Flip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setIsActive((prev) => !prev)}
          >
            <Text style={styles.controlText}>{isActive ? "Pause" : "Start"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 24,
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  pausedLayer: {
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  pausedText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  overlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 8,
  },

  scanFrame: {
    alignSelf: "center",
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    backgroundColor: "transparent",
  },

  controls: {
    flexDirection: "row",
    gap: 12,
  },
  controlBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  controlText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});