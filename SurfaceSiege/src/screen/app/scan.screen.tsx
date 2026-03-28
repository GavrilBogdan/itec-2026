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

// --- IMPORTURI VIRO AR ---
import {
  ViroARScene,
  ViroARImageMarker,
  ViroARTrackingTargets,
  ViroARSceneNavigator,
  ViroText,
} from "@viro-community/react-viro";

const { width, height } = Dimensions.get("window");

// 🚨 SCHIMBĂ CU IP-UL SAU NGROK-UL COLEGULUI
const SERVER_URL = "https://ana-unfakable-shenita.ngrok-free.dev";

// =====================================================================
// 1. CONFIGURARE IMAGINI LOCALE (Trebuie să fie în /assets/)
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
// 2. SCENA AR (Holograma care apare pe afiș)
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
          {/* Textul 3D lipit de poster */}
          <ViroText
            text="HACKED"
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
// 3. ECRANUL PRINCIPAL
// =====================================================================
export const ScanScreen = () => {
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [activePosterDbId, setActivePosterDbId] = useState<number | null>(null);
  const [drawingsByTarget, setDrawingsByTarget] = useState<
    Record<string, any[]>
  >({});
  const [currentPath, setCurrentPath] = useState<string>("");
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

  // --- LOGICĂ SOCKETS ---
  useEffect(() => {
    socketRef.current = io(SERVER_URL);
    socketRef.current.on(
      "new_line",
      (data: { posterId: number; line: any }) => {
        // Verificăm dacă linia aparține posterului deschis acum
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

  // --- LOGICĂ IDENTIFICARE & SYNC DB ---
  const handleSetLockedTarget = async (targetName: string) => {
    if (activeTarget === targetName) return;

    const now = Date.now();
    if (
      lastClosedTarget.current.id === targetName &&
      now - lastClosedTarget.current.time < 3000
    )
      return;

    try {
      console.log("🔍 Scanat:", targetName);
      const postersRes = await axios.get(`${SERVER_URL}/war/posters`);

      // Extragem doar numărul (ex: din "afis1" luăm "1")
      const index = targetName.replace("afis", "");

      // Căutăm în JSON-ul colegului (ex: unde nume este "Afiș 1")
      const dbPoster = postersRes.data.find((p: any) => p.nume.includes(index));

      if (dbPoster) {
        console.log("✅ Match DB:", dbPoster.nume, "ID:", dbPoster.id);
        setActivePosterDbId(dbPoster.id);
        setActiveTarget(targetName);

        // Luăm desenele salvate anterior
        const drawingsRes = await axios.get(
          `${SERVER_URL}/war/poster/${dbPoster.id}/drawings`,
        );

        // Parsăm datele din Prisma (points e obiectul nostru de linie)
        const paths = drawingsRes.data.map((d: any) => {
          return typeof d.points === "string" ? JSON.parse(d.points) : d.points;
        });

        setDrawingsByTarget((prev) => ({ ...prev, [targetName]: paths }));
      }
    } catch (e) {
      console.error("🚨 Eroare legătură backend:", e);
    }
  };

  const handleCloseTarget = () => {
    lastClosedTarget.current = { id: activeTarget || "", time: Date.now() };
    setActiveTarget(null);
    setActivePosterDbId(null);
  };

  // --- PAN RESPONDER (DESEN) ---
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
          setCurrentPath((finalPath) => {
            if (finalPath && activeTarget && activePosterDbId) {
              const newLine = {
                d: finalPath,
                stroke: colorRef.current,
                strokeWidth: sizeRef.current,
              };

              // 1. Salvare locală instantă
              setDrawingsByTarget((prev) => ({
                ...prev,
                [activeTarget]: [...(prev[activeTarget] || []), newLine],
              }));

              // 2. Trimitere prin SOCKET
              socketRef.current.emit("draw_line", {
                posterId: activePosterDbId,
                line: newLine,
              });

              // 3. Salvare în DB prin REST (POST /war/save)
              axios
                .post(`${SERVER_URL}/war/save`, {
                  points: newLine,
                  area: 10,
                  userId: 1, // Înlocuiește cu id-ul din login
                  teamId: 1, // Înlocuiește cu echipa userului
                  posterId: activePosterDbId,
                })
                .catch((e) => console.log("Eroare persistenta:", e.message));
            }
            return "";
          });
        },
      }),
    [activeTarget, activePosterDbId],
  );

  const handleNuke = () => {
    if (!activeTarget) return;
    setDrawingsByTarget((prev) => ({ ...prev, [activeTarget]: [] }));
  };

  const handleUndo = () => {
    if (!activeTarget) return;
    setDrawingsByTarget((prev) => {
      const current = [...(prev[activeTarget] || [])];
      current.pop();
      return { ...prev, [activeTarget]: current };
    });
  };

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
        <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
          <TouchableOpacity
            style={styles.closeTargetBtn}
            onPress={handleCloseTarget}
          >
            <Text style={styles.closeTargetText}>
              [ INCHIDE {activeTarget.toUpperCase()} ]
            </Text>
          </TouchableOpacity>
          <Svg style={StyleSheet.absoluteFill}>
            {activePaths.map((path, index) => (
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
      ) : (
        <View style={styles.scanningOverlay} pointerEvents="none">
          <Text style={styles.scanningText}>CAUTA UN AFIS...</Text>
        </View>
      )}

      {/* --- UI TOOLS (Color Picker) --- */}
      <Modal visible={isColorPickerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.colorPickerContainer}>
            <Text style={styles.modalTitle}>COLOR OVERRIDE</Text>
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
                  step={1}
                  value={item.v}
                  onValueChange={item.s}
                  minimumTrackTintColor={item.c}
                  thumbTintColor="#FFF"
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
                <Text style={styles.applyColorText}>APPLY</Text>
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
              {isMenuVisible ? "▼ ASCUNDE ▼" : "▲ MENIU ▲"}
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
                  <Text style={styles.colorSelectorText}>CULOARE</Text>
                </TouchableOpacity>
                <View style={styles.sliderContainer}>
                  <Text style={styles.toolLabel}>
                    GROSIME: {Math.round(brushSize)}
                  </Text>
                  <Slider
                    style={{ flex: 1, height: 40 }}
                    minimumValue={1}
                    maximumValue={30}
                    value={brushSize}
                    onValueChange={setBrushSize}
                    minimumTrackTintColor={selectedColor}
                    thumbTintColor="#FFF"
                  />
                </View>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleUndo}>
                  <Text style={styles.actionBtnText}>UNDO</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nukeBtn} onPress={handleNuke}>
                  <Text style={styles.nukeBtnText}>[ STERGE ]</Text>
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
    color: "#FF003C",
    textAlignVertical: "center",
    textAlign: "center",
    fontWeight: "bold",
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  scanningText: {
    color: "rgba(0, 255, 65, 0.8)",
    fontFamily: "monospace",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 3,
  },
  closeTargetBtn: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "rgba(255,0,0,0.8)",
    padding: 12,
    borderRadius: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  closeTargetText: {
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  bottomWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  toggleMenuBtn: {
    backgroundColor: "rgba(10, 10, 10, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  toggleMenuText: {
    color: "#0040ff",
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: 12,
  },
  toolsOverlay: {
    width: "100%",
    backgroundColor: "rgba(10, 10, 10, 0.9)",
    padding: 20,
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
    padding: 10,
    borderRadius: 12,
  },
  currentColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  colorSelectorText: { color: "#FFF", fontFamily: "monospace", fontSize: 14 },
  sliderContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 5,
    borderRadius: 12,
  },
  toolLabel: {
    color: "#FFF",
    fontFamily: "monospace",
    width: 85,
    fontSize: 11,
  },
  actionRow: { flexDirection: "row", justifyContent: "space-between", gap: 15 },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    alignItems: "center",
  },
  actionBtnText: { color: "#FFF", fontFamily: "monospace", fontSize: 16 },
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
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "monospace",
    marginBottom: 20,
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
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#555",
  },
  closeModalText: { color: "#FFF", fontFamily: "monospace" },
  applyColorBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 255, 65, 0.2)",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00F",
  },
  applyColorText: { color: "#00F", fontFamily: "monospace", fontWeight: "900" },
});
