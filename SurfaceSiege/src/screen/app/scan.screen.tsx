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
import Svg, { Path } from "react-native-svg";
import io from "socket.io-client";
import Slider from "@react-native-community/slider";
import axios from "axios";

// --- IMPORTURI VIRO AR (SURSĂ COMUNITATE) ---
import {
  ViroARScene,
  ViroARImageMarker,
  ViroARTrackingTargets,
  ViroARSceneNavigator,
  ViroText,
} from "@viro-community/react-viro";

const { width, height } = Dimensions.get("window");

// 🔗 URL BACKEND (NGROK)
const SERVER_URL = "https://ana-unfakable-shenita.ngrok-free.dev";

// =====================================================================
// 1. CONFIGURARE TARGETS (IMAGINI)
// =====================================================================
ViroARTrackingTargets.createTargets({
  afis1: {
    source: require("../../../assets/afis1.png"),
    orientation: "Up",
    physicalWidth: 0.2,
  },
  afis2: {
    source: require("../../../assets/afis2.png"),
    orientation: "Up",
    physicalWidth: 0.2,
  },
  afis3: {
    source: require("../../../assets/afis3.png"),
    orientation: "Up",
    physicalWidth: 0.2,
  },
  afis4: {
    source: require("../../../assets/afis4.png"),
    orientation: "Up",
    physicalWidth: 0.2,
  },
  afis5: {
    source: require("../../../assets/afis5.png"),
    orientation: "Up",
    physicalWidth: 0.2,
  },
  afis6: {
    source: require("../../../assets/afis6.png"),
    orientation: "Up",
    physicalWidth: 0.2,
  },
  afis7: {
    source: require("../../../assets/afis7.png"),
    orientation: "Up",
    physicalWidth: 0.2,
  },
  afis8: {
    source: require("../../../assets/afis8.png"),
    orientation: "Up",
    physicalWidth: 0.2,
  },
  afis9: {
    source: require("../../../assets/afis9.png"),
    orientation: "Up",
    physicalWidth: 0.2,
  },
  afis10: {
    source: require("../../../assets/afis10.png"),
    orientation: "Up",
    physicalWidth: 0.2,
  },
});

// =====================================================================
// 2. SCENA AR (ELEMENTE 3D)
// =====================================================================
const MarkerSceneAR = (props: any) => {
  const { setLockedTarget } = props.sceneNavigator.viroAppProps;

  return (
    <ViroARScene>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <ViroARImageMarker
          key={`marker${i}`}
          target={`afis${i}`}
          onAnchorFound={() => setLockedTarget(`afis${i}`)}
          onAnchorUpdated={() => setLockedTarget(`afis${i}`)}
        >
          <ViroText
            text="SYSTEM COMPROMISED"
            scale={[0.05, 0.05, 0.05]}
            position={[0, 0, 0.02]}
            style={styles.arTextHologram}
          />
        </ViroARImageMarker>
      ))}
    </ViroARScene>
  );
};

// =====================================================================
// 3. ECRANUL PRINCIPAL (LOGICĂ & UI)
// =====================================================================
export const ScanScreen = () => {
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [activePosterDbId, setActivePosterDbId] = useState<number | null>(null);
  const [drawingsByTarget, setDrawingsByTarget] = useState<
    Record<string, any[]>
  >({});
  const [currentPath, setCurrentPath] = useState<string>("");

  // Ref pentru a preveni re-detectarea instantanee după disconnect
  const lastClosedTarget = useRef({ id: "", time: 0 });

  // UI State
  const [selectedColor, setSelectedColor] = useState("rgb(0, 255, 65)");
  const [brushSize, setBrushSize] = useState(5);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [r, setR] = useState(0);
  const [g, setG] = useState(255);
  const [b, setB] = useState(65);

  const socketRef = useRef<any>(null);

  // --- SOCKETS ---
  useEffect(() => {
    socketRef.current = io(SERVER_URL);
    socketRef.current.on(
      "new_line",
      (data: { posterId: number; line: any }) => {
        if (activePosterDbId && data.posterId === activePosterDbId) {
          setDrawingsByTarget((prev) => ({
            ...prev,
            [activeTarget!]: [...(prev[activeTarget!] || []), data.line],
          }));
        }
      },
    );
    return () => socketRef.current?.disconnect();
  }, [activePosterDbId, activeTarget]);

  // --- LOGICĂ IDENTIFICARE TARGET ---
  const handleSetLockedTarget = async (targetName: string) => {
    if (activeTarget === targetName) return;

    // Protecție: dacă tocmai am închis acest afiș, așteaptă 3 secunde înainte de re-lock
    const now = Date.now();
    if (
      lastClosedTarget.current.id === targetName &&
      now - lastClosedTarget.current.time < 3000
    ) {
      return;
    }

    try {
      console.log("🔍 Identificat:", targetName);
      const postersRes = await axios.get(`${SERVER_URL}/war/posters`);
      const index = targetName.replace("afis", "");
      const dbPoster = postersRes.data.find((p: any) => p.nume.includes(index));

      if (dbPoster) {
        setActivePosterDbId(dbPoster.id);
        setActiveTarget(targetName);

        const drawingsRes = await axios.get(
          `${SERVER_URL}/war/poster/${dbPoster.id}/drawings`,
        );
        const paths = drawingsRes.data.map((d: any) =>
          typeof d.points === "string" ? JSON.parse(d.points) : d.points,
        );
        setDrawingsByTarget((prev) => ({ ...prev, [targetName]: paths }));
      }
    } catch (e) {
      console.error("🚨 Sync Error:", e);
    }
  };

  // --- FIX DISCONNECT ---
  const handleCloseTarget = () => {
    if (activeTarget) {
      // Setăm ref-ul ca să știm că l-am închis manual acum
      lastClosedTarget.current = { id: activeTarget, time: Date.now() };
      setActiveTarget(null);
      setActivePosterDbId(null);
      console.log("⚠️ Deconectat manual de la target.");
    }
  };

  // --- PAN RESPONDER (DRAWING) ---
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
          if (!activeTarget) return;
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath(`M${locationX},${locationY}`);
        },
        onPanResponderMove: (evt) => {
          if (!activeTarget) return;
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
        },
        onPanResponderRelease: () => {
          if (currentPath && activeTarget && activePosterDbId) {
            const newLine = {
              d: currentPath,
              stroke: colorRef.current,
              strokeWidth: sizeRef.current,
            };
            setDrawingsByTarget((prev) => ({
              ...prev,
              [activeTarget]: [...(prev[activeTarget] || []), newLine],
            }));
            socketRef.current.emit("draw_line", {
              posterId: activePosterDbId,
              line: newLine,
            });
            axios
              .post(`${SERVER_URL}/war/save`, {
                points: newLine,
                area: 10,
                userId: 1,
                teamId: 1,
                posterId: activePosterDbId,
              })
              .catch((e) => console.log("DB Save Error:", e.message));
          }
          setCurrentPath("");
        },
      }),
    [activeTarget, activePosterDbId, currentPath],
  );

  const livePreviewColor = `rgb(${r}, ${g}, ${b})`;
  const activePaths = activeTarget ? drawingsByTarget[activeTarget] || [] : [];

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{ scene: MarkerSceneAR as any }}
        style={StyleSheet.absoluteFill}
        viroAppProps={{ setLockedTarget: handleSetLockedTarget }}
      />

      {activeTarget ? (
        <>
          {/* ZONA DE DESEN (Are panHandlers, deci "fură" atingerile pentru desenat) */}
          <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
            <Svg style={StyleSheet.absoluteFill}>
              {activePaths.map((path, index) => (
                <Path
                  key={index}
                  d={path.d}
                  stroke={path.stroke}
                  strokeWidth={path.strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
              {currentPath ? (
                <Path
                  d={currentPath}
                  stroke={selectedColor}
                  strokeWidth={brushSize}
                  fill="none"
                  strokeLinecap="round"
                />
              ) : null}
            </Svg>
          </View>

          {/* BUTON DISCONNECT SCOS ÎN AFARĂ (Ca să meargă apăsat) */}
          <TouchableOpacity
            style={styles.closeTargetBtn}
            onPress={handleCloseTarget}
          >
            <Text style={styles.closeTargetText}>
              [ DISCONNECT {activeTarget.toUpperCase()} ]
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.scanningOverlay} pointerEvents="none">
          <Text style={styles.scanningText}>SEARCHING FOR SIGNAL...</Text>
        </View>
      )}

      {/* --- COLOR PICKER --- */}
      <Modal visible={isColorPickerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.colorPickerContainer}>
            <Text style={styles.modalTitle}>HEX OVERRIDE</Text>
            <View
              style={[
                styles.colorPreviewBox,
                { backgroundColor: livePreviewColor },
              ]}
            />
            {[
              { l: "R", v: r, s: setR, c: "#F33" },
              { l: "G", v: g, s: setG, c: "#3F3" },
              { l: "B", v: b, s: setB, c: "#33F" },
            ].map((item) => (
              <View key={item.l} style={styles.rgbRow}>
                <Text style={[styles.rgbLabel, { color: item.c }]}>
                  {item.l}
                </Text>
                <Slider
                  style={styles.rgbSlider}
                  minimumValue={0}
                  maximumValue={255}
                  value={item.v}
                  onValueChange={item.s}
                  minimumTrackTintColor={item.c}
                />
              </View>
            ))}
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
                <Text style={styles.applyColorText}>CONFIRM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {activeTarget && (
        <View style={styles.bottomWrapper} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.toggleMenuBtn}
            onPress={() => setIsMenuVisible(!isMenuVisible)}
          >
            <Text style={styles.toggleMenuText}>
              {isMenuVisible ? "▼ CLOSE TERMINAL" : "▲ OPEN TERMINAL"}
            </Text>
          </TouchableOpacity>
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
                  <Slider
                    style={{ flex: 1 }}
                    minimumValue={1}
                    maximumValue={30}
                    value={brushSize}
                    onValueChange={setBrushSize}
                    minimumTrackTintColor={selectedColor}
                  />
                </View>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() =>
                    setDrawingsByTarget((prev) => ({
                      ...prev,
                      [activeTarget]: prev[activeTarget].slice(0, -1),
                    }))
                  }
                >
                  <Text style={styles.actionBtnText}>UNDO</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.nukeBtn}
                  onPress={() =>
                    setDrawingsByTarget((prev) => ({
                      ...prev,
                      [activeTarget]: [],
                    }))
                  }
                >
                  <Text style={styles.nukeBtnText}>[ NUKE ]</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  arTextHologram: {
    fontFamily: "monospace",
    fontSize: 20,
    color: "#00e1ff",
    textAlign: "center",
    fontWeight: "bold",
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  scanningText: {
    color: "#00e1ff",
    fontFamily: "monospace",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  closeTargetBtn: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "rgba(255,0,0,0.2)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff0000",
    zIndex: 999,
  }, // Am pus un zIndex ca să fiu sigur că stă deasupra la SVG
  closeTargetText: {
    color: "#ff0000",
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  bottomWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  toggleMenuBtn: {
    backgroundColor: "rgba(10, 10, 10, 0.9)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  toggleMenuText: {
    color: "#00e1ff",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "bold",
  },
  toolsOverlay: {
    width: "100%",
    backgroundColor: "rgba(10, 10, 10, 0.95)",
    padding: 20,
  },
  topToolsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 15,
  },
  colorSelectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 10,
  },
  currentColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  colorSelectorText: { color: "#fff", fontFamily: "monospace" },
  sliderContainer: {
    flex: 1,
    backgroundColor: "#222",
    padding: 5,
    borderRadius: 10,
  },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  actionBtnText: { color: "#fff", fontFamily: "monospace" },
  nukeBtn: {
    flex: 1,
    backgroundColor: "rgba(255,0,0,0.1)",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ff0000",
    alignItems: "center",
  },
  nukeBtnText: {
    color: "#ff0000",
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  colorPickerContainer: {
    width: "85%",
    backgroundColor: "#111",
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTitle: {
    color: "#00e1ff",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "monospace",
  },
  colorPreviewBox: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    marginBottom: 20,
  },
  rgbRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  rgbLabel: { color: "#fff", width: 30, fontFamily: "monospace" },
  rgbSlider: { flex: 1, height: 40 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  closeModalBtn: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 10,
    alignItems: "center",
  },
  closeModalText: { color: "#fff" },
  applyColorBtn: {
    flex: 1,
    backgroundColor: "#00e1ff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  applyColorText: { color: "#000", fontWeight: "bold" },
});
