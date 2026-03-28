import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Modal,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Svg, { Path } from "react-native-svg";
import io from "socket.io-client";
import Slider from "@react-native-community/slider";

const { width, height } = Dimensions.get("window");

// ATENȚIE: Schimbă cu IP-ul tău local
const SERVER_URL = "http://192.168.1.100:3000";

export const ScanScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [paths, setPaths] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");

  // Setări pentru Tool-uri
  const [selectedColor, setSelectedColor] = useState("rgb(0, 255, 65)");
  const [brushSize, setBrushSize] = useState(5);

  // Stare Modal & Meniu vizibil
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true); // <-- Starea nouă pentru meniu

  // Stări pentru RGB Picker Custom
  const [r, setR] = useState(0);
  const [g, setG] = useState(255);
  const [b, setB] = useState(65);

  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

    socketRef.current = io(SERVER_URL);

    socketRef.current.on("connect", () =>
      console.log("✅ SOCKET CONNECTED", socketRef.current.id),
    );
    socketRef.current.on("init_canvas", (existingPaths: any) =>
      setPaths(existingPaths),
    );
    socketRef.current.on("new_line", (newLine: any) =>
      setPaths((prev) => [...prev, newLine]),
    );

    socketRef.current.on("canvas_cleared", () => setPaths([]));

    return () => socketRef.current.disconnect();
  }, [permission]);

  const colorRef = useRef(selectedColor);
  const sizeRef = useRef(brushSize);

  useEffect(() => {
    colorRef.current = selectedColor;
  }, [selectedColor]);
  useEffect(() => {
    sizeRef.current = brushSize;
  }, [brushSize]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
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
          setCurrentPath((finalPath) => {
            if (finalPath) {
              const newLine = {
                d: finalPath,
                stroke: colorRef.current,
                strokeWidth: sizeRef.current,
              };
              setPaths((prev) => [...prev, newLine]);
              socketRef.current.emit("draw_line", newLine);
            }
            return "";
          });
        },
      }),
    [],
  );

  const handleNuke = () => {
    setPaths([]);
    socketRef.current.emit("clear_canvas");
  };

  const handleUndo = () => {
    setPaths((prev) => {
      const newPaths = [...prev];
      newPaths.pop();
      return newPaths;
    });
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.glitchText}>VANDALISM REQUIRES CAMERA</Text>
        <TouchableOpacity style={styles.nukeBtn} onPress={requestPermission}>
          <Text style={styles.btnText}>GRANT ACCESS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const livePreviewColor = `rgb(${r}, ${g}, ${b})`;

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      {/* CANVAS */}
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
          {currentPath ? (
            <Path
              d={currentPath}
              stroke={selectedColor}
              strokeWidth={brushSize}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>
      </View>

      {/* MODAL RGB */}
      <Modal
        visible={isColorPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsColorPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.colorPickerContainer}>
            <Text style={styles.modalTitle}>OVERRIDE COLOR</Text>
            <View
              style={[
                styles.colorPreviewBox,
                { backgroundColor: livePreviewColor },
              ]}
            />
            <View style={styles.rgbRow}>
              <Text style={[styles.rgbLabel, { color: "#FF3333" }]}>R</Text>
              <Slider
                style={styles.rgbSlider}
                minimumValue={0}
                maximumValue={255}
                step={1}
                value={r}
                onValueChange={setR}
                minimumTrackTintColor="#FF3333"
                thumbTintColor="#FFF"
              />
            </View>
            <View style={styles.rgbRow}>
              <Text style={[styles.rgbLabel, { color: "#33FF33" }]}>G</Text>
              <Slider
                style={styles.rgbSlider}
                minimumValue={0}
                maximumValue={255}
                step={1}
                value={g}
                onValueChange={setG}
                minimumTrackTintColor="#3a33ff"
                thumbTintColor="#FFF"
              />
            </View>
            <View style={styles.rgbRow}>
              <Text style={[styles.rgbLabel, { color: "#3333FF" }]}>B</Text>
              <Slider
                style={styles.rgbSlider}
                minimumValue={0}
                maximumValue={255}
                step={1}
                value={b}
                onValueChange={setB}
                minimumTrackTintColor="#3333FF"
                thumbTintColor="#FFF"
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setIsColorPickerVisible(false)}
              >
                <Text style={styles.closeModalText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyColorBtn}
                onPress={() => {
                  setSelectedColor(livePreviewColor);
                  setIsColorPickerVisible(false);
                }}
              >
                <Text style={styles.applyColorText}>APPLY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* INTERFAȚA DE JOS (TOOLS) */}
      <View style={styles.bottomWrapper} pointerEvents="box-none">
        {/* Butonul de Ascundere/Afișare */}
        <TouchableOpacity
          style={styles.toggleMenuBtn}
          onPress={() => setIsMenuVisible(!isMenuVisible)}
          activeOpacity={0.8}
        >
          <Text style={styles.toggleMenuText}>
            {isMenuVisible ? "▼  ASCUNDE  ▼" : "▲  MENIU  ▲"}
          </Text>
        </TouchableOpacity>

        {/* Conținutul meniului care dispare/apare */}
        {isMenuVisible && (
          <View style={styles.toolsOverlay}>
            <View style={styles.topToolsRow}>
              <TouchableOpacity
                style={styles.colorSelectorBtn}
                onPress={() => setIsColorPickerVisible(true)}
              >
                <View
                  style={[
                    styles.currentColorIndicator,
                    { backgroundColor: selectedColor },
                  ]}
                />
                <Text style={styles.colorSelectorText}>COLOR</Text>
              </TouchableOpacity>

              <View style={styles.sliderContainer}>
                <Text style={styles.toolLabel}>
                  SIZE: {Math.round(brushSize)}
                </Text>
                <Slider
                  style={{ flex: 1, height: 40 }}
                  minimumValue={1}
                  maximumValue={30}
                  value={brushSize}
                  onValueChange={setBrushSize}
                  minimumTrackTintColor={selectedColor}
                  maximumTrackTintColor="rgba(255,255,255,0.2)"
                  thumbTintColor="#FFF"
                />
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleUndo}>
                <Text style={styles.actionBtnText}>UNDO</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.nukeBtn} onPress={handleNuke}>
                <Text style={styles.nukeBtnText}>[ STERGE TOT ]</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  btnText: { color: "#FFF", fontWeight: "bold" },

  // Wrapper-ul de jos care ține și butonul și meniul
  bottomWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center", // Centrează tab-ul de sus
  },

  // Tab-ul de Ascunde/Afișează
  toggleMenuBtn: {
    backgroundColor: "rgba(10, 10, 10, 0.85)",
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: -1, // Se suprapune puțin pentru a părea o piesă continuă
  },
  toggleMenuText: {
    color: "#0040ff",
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 1,
  },

  toolsOverlay: {
    width: "100%", // Revine la lățimea completă
    backgroundColor: "rgba(10, 10, 10, 0.85)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 15,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },

  topToolsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 15,
  },

  colorSelectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  currentColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  colorSelectorText: {
    color: "#FFF",
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: 14,
  },

  sliderContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  toolLabel: {
    color: "#FFF",
    fontFamily: "monospace",
    fontWeight: "bold",
    width: 70,
    fontSize: 12,
  },

  actionRow: { flexDirection: "row", justifyContent: "space-between", gap: 15 },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#555",
    alignItems: "center",
  },
  actionBtnText: {
    color: "#FFF",
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: 16,
  },
  nukeBtn: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: "rgba(255, 0, 60, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF003C",
    alignItems: "center",
  },
  nukeBtnText: {
    color: "#FF003C",
    fontFamily: "monospace",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 2,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  colorPickerContainer: {
    width: width * 0.85,
    backgroundColor: "#111",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "monospace",
    fontWeight: "bold",
    marginBottom: 20,
    letterSpacing: 2,
  },
  colorPreviewBox: {
    width: "100%",
    height: 60,
    borderRadius: 10,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  rgbRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  rgbLabel: {
    fontFamily: "monospace",
    fontWeight: "900",
    fontSize: 18,
    width: 30,
  },
  rgbSlider: { flex: 1, height: 40 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    gap: 15,
  },
  closeModalBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    alignItems: "center",
  },
  closeModalText: {
    color: "#FFF",
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  applyColorBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 255, 65, 0.2)",
    borderWidth: 1,
    borderColor: "#0051ff",
    borderRadius: 8,
    alignItems: "center",
  },
  applyColorText: {
    color: "#2600ff",
    fontFamily: "monospace",
    fontWeight: "900",
  },
});
