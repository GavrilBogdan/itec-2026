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

// --- IMPORTURI VIRO AR ---
import {
  ViroARScene,
  ViroARImageMarker,
  ViroARTrackingTargets,
  ViroARSceneNavigator,
  ViroText,
} from "@viro-community/react-viro";

const { width, height } = Dimensions.get("window");

// ATENȚIE: Schimbă cu IP-ul tău local
const SERVER_URL = "http://192.168.1.100:3000";

// =====================================================================
// 1. BAZA DE DATE DE AFIȘE (Imagini Locale)
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
// 2. SCENA AR CARE SCANEAZĂ CONTINUU
// =====================================================================
const MarkerSceneAR = (props: any) => {
  const { setLockedTarget } = props.sceneNavigator.viroAppProps;

  // Această funcție randează holograma 3D direct pe afișul din lumea reală
  const renderHologram = () => (
    <ViroText
      text="HACKED"
      scale={[0.05, 0.05, 0.05]}
      position={[0, 0, 0.02]} // Iese 2 centimetri din afiș spre tine
      style={styles.arTextHologram}
    />
  );

  return (
    <ViroARScene>
      {/* Folosim atât onAnchorFound cât și onAnchorUpdated. 
        Asta forțează sistemul să re-scaneze afișul chiar și dacă a fost închis anterior.
      */}
      <ViroARImageMarker
        target={"afis1"}
        onAnchorFound={() => setLockedTarget("afis1")}
        onAnchorUpdated={() => setLockedTarget("afis1")}
      >
        {renderHologram()}
      </ViroARImageMarker>

      <ViroARImageMarker
        target={"afis2"}
        onAnchorFound={() => setLockedTarget("afis2")}
        onAnchorUpdated={() => setLockedTarget("afis2")}
      >
        {renderHologram()}
      </ViroARImageMarker>

      <ViroARImageMarker
        target={"afis3"}
        onAnchorFound={() => setLockedTarget("afis3")}
        onAnchorUpdated={() => setLockedTarget("afis3")}
      >
        {renderHologram()}
      </ViroARImageMarker>

      <ViroARImageMarker
        target={"afis4"}
        onAnchorFound={() => setLockedTarget("afis4")}
        onAnchorUpdated={() => setLockedTarget("afis4")}
      >
        {renderHologram()}
      </ViroARImageMarker>

      <ViroARImageMarker
        target={"afis5"}
        onAnchorFound={() => setLockedTarget("afis5")}
        onAnchorUpdated={() => setLockedTarget("afis5")}
      >
        {renderHologram()}
      </ViroARImageMarker>

      <ViroARImageMarker
        target={"afis6"}
        onAnchorFound={() => setLockedTarget("afis6")}
        onAnchorUpdated={() => setLockedTarget("afis6")}
      >
        {renderHologram()}
      </ViroARImageMarker>

      <ViroARImageMarker
        target={"afis7"}
        onAnchorFound={() => setLockedTarget("afis7")}
        onAnchorUpdated={() => setLockedTarget("afis7")}
      >
        {renderHologram()}
      </ViroARImageMarker>

      <ViroARImageMarker
        target={"afis8"}
        onAnchorFound={() => setLockedTarget("afis8")}
        onAnchorUpdated={() => setLockedTarget("afis8")}
      >
        {renderHologram()}
      </ViroARImageMarker>

      <ViroARImageMarker
        target={"afis9"}
        onAnchorFound={() => setLockedTarget("afis9")}
        onAnchorUpdated={() => setLockedTarget("afis9")}
      >
        {renderHologram()}
      </ViroARImageMarker>

      <ViroARImageMarker
        target={"afis10"}
        onAnchorFound={() => setLockedTarget("afis10")}
        onAnchorUpdated={() => setLockedTarget("afis10")}
      >
        {renderHologram()}
      </ViroARImageMarker>
    </ViroARScene>
  );
};

// =====================================================================
// 3. ECRANUL PRINCIPAL
// =====================================================================
export const ScanScreen = () => {
  const [activeTarget, setActiveTarget] = useState<string | null>(null);

  // Ref pentru a ști când am închis ultima oară (Cooldown de 3 secunde)
  const lastClosedTarget = useRef({ id: "", time: 0 });

  const [drawingsByTarget, setDrawingsByTarget] = useState<
    Record<string, any[]>
  >({});
  const [currentPath, setCurrentPath] = useState<string>("");

  const [selectedColor, setSelectedColor] = useState("rgb(0, 255, 65)");
  const [brushSize, setBrushSize] = useState(5);

  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);

  const [r, setR] = useState(0);
  const [g, setG] = useState(255);
  const [b, setB] = useState(65);

  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io(SERVER_URL);

    socketRef.current.on("init_canvas", (existingDrawingsByTarget: any) => {
      if (existingDrawingsByTarget) {
        setDrawingsByTarget(existingDrawingsByTarget);
      }
    });

    socketRef.current.on(
      "new_line",
      (data: { targetId: string; line: any }) => {
        setDrawingsByTarget((prev) => ({
          ...prev,
          [data.targetId]: [...(prev[data.targetId] || []), data.line],
        }));
      },
    );

    socketRef.current.on("canvas_cleared", (targetId: string) => {
      setDrawingsByTarget((prev) => ({ ...prev, [targetId]: [] }));
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

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
            if (finalPath && activeTarget) {
              const newLine = {
                d: finalPath,
                stroke: colorRef.current,
                strokeWidth: sizeRef.current,
              };

              setDrawingsByTarget((prev) => ({
                ...prev,
                [activeTarget]: [...(prev[activeTarget] || []), newLine],
              }));

              if (socketRef.current) {
                socketRef.current.emit("draw_line", {
                  targetId: activeTarget,
                  line: newLine,
                });
              }
            }
            return "";
          });
        },
      }),
    [activeTarget],
  );

  const handleNuke = () => {
    if (!activeTarget) return;
    setDrawingsByTarget((prev) => ({ ...prev, [activeTarget]: [] }));
    if (socketRef.current) {
      socketRef.current.emit("clear_canvas", activeTarget);
    }
  };

  const handleUndo = () => {
    if (!activeTarget) return;
    setDrawingsByTarget((prev) => {
      const currentTargetDrawings = [...(prev[activeTarget] || [])];
      currentTargetDrawings.pop();
      return { ...prev, [activeTarget]: currentTargetDrawings };
    });
  };

  // Funcție Inteligentă de Setare Target (cu Cooldown)
  const handleSetLockedTarget = (targetName: string) => {
    // Dacă e deja deschis, nu facem nimic
    if (activeTarget === targetName) return;

    // Dacă l-am închis în ultimele 3 secunde, îl ignorăm (ne dă timp să luăm camera de pe el)
    const now = Date.now();
    if (
      lastClosedTarget.current.id === targetName &&
      now - lastClosedTarget.current.time < 3000
    ) {
      return;
    }

    // Deschidem afișul
    setActiveTarget(targetName);
  };

  // Funcție de Închidere
  const handleCloseTarget = () => {
    // Salvăm momentul închiderii ca să declanșăm cooldown-ul
    lastClosedTarget.current = { id: activeTarget || "", time: Date.now() };
    setActiveTarget(null);
  };

  const livePreviewColor = `rgb(${r}, ${g}, ${b})`;
  const activePaths = activeTarget ? drawingsByTarget[activeTarget] || [] : [];

  return (
    <View style={styles.container}>
      {/* 1. MOTORUL AR */}
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{ scene: MarkerSceneAR }}
        style={StyleSheet.absoluteFill}
        viroAppProps={{
          setLockedTarget: handleSetLockedTarget,
        }}
      />

      {/* 2. CANVAS-UL DE DESEN */}
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

      {/* 3. MODALUL DE CULORI */}
      <Modal
        visible={isColorPickerVisible}
        transparent={true}
        animationType="fade"
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

      {/* 4. INTERFAȚA DE JOS */}
      {activeTarget && (
        <View style={styles.bottomWrapper} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.toggleMenuBtn}
            onPress={() => setIsMenuVisible(!isMenuVisible)}
          >
            <Text style={styles.toggleMenuText}>
              {isMenuVisible ? "▼  ASCUNDE  ▼" : "▲  MENIU  ▲"}
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  // Stilul textului 3D din AR
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  closeTargetText: {
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "monospace",
    fontSize: 14,
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
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: -1,
  },
  toggleMenuText: {
    color: "#0040ff",
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 1,
  },
  toolsOverlay: {
    width: "100%",
    backgroundColor: "rgba(10, 10, 10, 0.9)",
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
