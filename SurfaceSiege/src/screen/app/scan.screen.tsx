import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Svg, { Path } from "react-native-svg";
import io from "socket.io-client";

const { width, height } = Dimensions.get("window");

// ATENȚIE: Înlocuiește cu IP-ul real al calculatorului tău din rețeaua locală (ex: 192.168.1.5)
const SERVER_URL = "http://192.168.1.100:3000";

export const ScanScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [paths, setPaths] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();

    // 1. Inițializare WebSocket
    socketRef.current = io(SERVER_URL);

    socketRef.current.on("init_canvas", (existingPaths: any) => {
      setPaths(existingPaths);
    });

    socketRef.current.on("new_line", (newLine: any) => {
      setPaths((prev) => [...prev, newLine]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [permission]);

  // 2. Logica de desenare (Gesturi)
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(`M${locationX},${locationY}`);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
    },
    onPanResponderRelease: () => {
      if (currentPath) {
        const newLine = { d: currentPath, stroke: "#00FF41", strokeWidth: 5 };
        // Adăugăm linia local
        setPaths((prev) => [...prev, newLine]);
        // Trimitem linia la server pentru a fi văzută de toți
        socketRef.current.emit("draw_line", newLine);
        setCurrentPath("");
      }
    },
  });

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.glitchText}>VANDALISM REQUIRES CAMERA</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>GRANT ACCESS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 3. Feed-ul Camerei */}
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      {/* 4. Canvas-ul de Desen (Peste Cameră) */}
      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
        <Svg style={StyleSheet.absoluteFill}>
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path.d}
              stroke={path.stroke}
              strokeWidth={path.strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* Linia care se desenează în acest moment */}
          {currentPath ? (
            <Path
              d={currentPath}
              stroke="#00FF41"
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>
      </View>

      {/* 5. Interfața (UI) */}
      <View style={styles.uiContainer} pointerEvents="box-none">
        <Text style={styles.title}>iTEC: OVERRIDE</Text>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => socketRef.current.emit("clear_canvas")}
        >
          <Text style={styles.btnText}>NUKE CANVAS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#050505",
  },
  glitchText: {
    color: "#FF003C",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 20,
  },
  btn: { backgroundColor: "#FF003C", padding: 15 },
  btnText: { color: "#FFF", fontWeight: "bold" },
  uiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
    textShadowColor: "#FF003C",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  clearBtn: {
    backgroundColor: "rgba(255, 0, 60, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FFF",
  },
});
