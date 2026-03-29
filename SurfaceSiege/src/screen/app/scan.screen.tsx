import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Modal,
  Image, // ✅ Adăugat pentru Logo
  Pressable,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import io from "socket.io-client";
import Slider from "@react-native-community/slider";
import axios from "axios";

// ✅ IMPORTĂM HOOK-UL VOSTRU REAL DE AUTH
import { useAuth } from "../../hooks/use-auth.hook";

// --- IMPORTURI VIRO AR ---
import {
  ViroARScene,
  ViroARImageMarker,
  ViroARTrackingTargets,
  ViroARSceneNavigator,
  ViroText,
} from "@viro-community/react-viro";

const { width, height } = Dimensions.get("window");

const SERVER_URL = "https://ana-unfakable-shenita.ngrok-free.dev";

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

export const ScanScreen = () => {
  const { userDetails } = useAuth();

  const loggedUser = useMemo(() => {
    const safeUser = userDetails || {};
    return {
      id: safeUser.sub || 1,
      nume: safeUser.nume || safeUser.email?.split("@")[0] || "Operator",
      teamId: safeUser.teamId || 1,
    };
  }, [userDetails]);

  // ✅ STATE-URI PENTRU EASTER EGG
  const [easterEggCount, setEasterEggCount] = useState(0);
  const [showHaufeLogo, setShowHaufeLogo] = useState(false);
  const lastClickTime = useRef(0);

  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [activePosterDbId, setActivePosterDbId] = useState<number | null>(null);
  const [drawingsByTarget, setDrawingsByTarget] = useState<
    Record<string, any[]>
  >({});
  const [currentPath, setCurrentPath] = useState<string>("");
  const [tagUser, setTagUser] = useState<string | null>(null);

  const lastClosedTarget = useRef({ id: "", time: 0 });
  const [selectedColor, setSelectedColor] = useState("rgb(0, 255, 65)");
  const [brushSize, setBrushSize] = useState(5);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [r, setR] = useState(0);
  const [g, setG] = useState(255);
  const [b, setB] = useState(65);

  const socketRef = useRef<any>(null);

  // ✅ FUNCȚIA DE TRIGGER EASTER EGG
  const handleEasterEggClick = () => {
    const now = Date.now();
    if (now - lastClickTime.current < 400) {
      setEasterEggCount((prev) => {
        if (prev + 1 >= 5) {
          setShowHaufeLogo(true);
          setTimeout(() => setShowHaufeLogo(false), 3000); // Dispăre după 3 secunde
          return 0;
        }
        return prev + 1;
      });
    } else {
      setEasterEggCount(1);
    }
    lastClickTime.current = now;
  };

  useEffect(() => {
    socketRef.current = io(SERVER_URL);
    socketRef.current.on(
      "new_line",
      (data: { posterId: number; line: any; userName?: string }) => {
        if (activePosterDbId && data.posterId === activePosterDbId) {
          setDrawingsByTarget((prev) => ({
            ...prev,
            [activeTarget!]: [...(prev[activeTarget!] || []), data.line],
          }));
          if (data.userName) setTagUser(data.userName);
        }
      },
    );
    return () => socketRef.current?.disconnect();
  }, [activePosterDbId, activeTarget]);

  const handleSetLockedTarget = async (targetName: string) => {
    if (activeTarget === targetName) return;
    const now = Date.now();
    if (
      lastClosedTarget.current.id === targetName &&
      now - lastClosedTarget.current.time < 3000
    )
      return;

    try {
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

        if (drawingsRes.data.length > 0) {
          const lastDrawing = drawingsRes.data[drawingsRes.data.length - 1];
          const artistName =
            lastDrawing.userName || lastDrawing.user?.nume || "Anonim";
          setTagUser(artistName);
        } else {
          setTagUser("Fără modificări");
        }
      }
    } catch (e) {
      console.error("🚨 Sync Error:", e);
    }
  };

  const handleCloseTarget = () => {
    if (activeTarget) {
      lastClosedTarget.current = { id: activeTarget, time: Date.now() };
      setActiveTarget(null);
      setActivePosterDbId(null);
      setTagUser(null);
    }
  };

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
          handleEasterEggClick(); // ✅ Detecție Easter Egg și în timpul desenului!
          if (!activeTarget || !loggedUser) return;
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath(`M${locationX},${locationY}`);
        },
        onPanResponderMove: (evt) => {
          if (!activeTarget || !loggedUser) return;
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
        },
        onPanResponderRelease: () => {
          if (currentPath && activeTarget && activePosterDbId && loggedUser) {
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
              points: newLine,
              area: 10,
              userId: loggedUser.id,
              teamId: loggedUser.teamId,
              userName: loggedUser.nume,
            });
            axios
              .post(`${SERVER_URL}/war/save`, {
                points: newLine,
                area: 10,
                userId: loggedUser.id,
                teamId: loggedUser.teamId,
                posterId: activePosterDbId,
                userName: loggedUser.nume,
              })
              .catch((e) => console.log("DB Save Error:", e.message));
            setTagUser(`${loggedUser.nume} (Tu)`);
          }
          setCurrentPath("");
        },
      }),
    [activeTarget, activePosterDbId, currentPath, loggedUser],
  );

  const livePreviewColor = `rgb(${r}, ${g}, ${b})`;
  const activePaths = activeTarget ? drawingsByTarget[activeTarget] || [] : [];

  return (
    <View style={styles.container}>
      {/* ✅ Pressable invizibil pentru Easter Egg (când nu desenezi) */}
      {!activeTarget && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleEasterEggClick}
        />
      )}

      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{ scene: MarkerSceneAR as any }}
        style={StyleSheet.absoluteFill}
        viroAppProps={{ setLockedTarget: handleSetLockedTarget }}
      />

      {activeTarget ? (
        <>
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

          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>
              <Text style={{ color: "#fff" }}>MODIFIED BY: </Text>
              {tagUser}
            </Text>
          </View>

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

      <Modal visible={showHaufeLogo} transparent animationType="fade">
        <View style={styles.haufeOverlay}>
          <View style={styles.haufeContainer}>
            <Text style={styles.haufeAlert}>
              [ EXTERNAL SYNDICATE DETECTED ]
            </Text>

            <Image
              source={require("../../../assets/haufe_logo.png")}
              style={styles.haufeLogoImage}
              resizeMode="contain"
            />

            <Text style={styles.haufeSubtitle}>
              GROUP // PARTNER_AUTH_GRANTED
            </Text>
          </View>
        </View>
      </Modal>

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
                  onPress={() => {
                    setDrawingsByTarget((prev) => ({
                      ...prev,
                      [activeTarget]: [],
                    }));
                    axios
                      .delete(
                        `${SERVER_URL}/war/poster/${activePosterDbId}/clear`,
                      )
                      .catch((e) => console.log("🚨 EROARE CLEAR:", e.message));
                    setTagUser("Curățat de Sistem");
                  }}
                >
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
  tagBadge: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "rgba(0, 225, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#00e1ff",
    zIndex: 999,
  },
  tagText: {
    color: "#00e1ff",
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: 14,
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
  },
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

  // ✅ STILURI EASTER EGG
  haufeOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },

  haufeAlert: {
    color: "#44f63b",
    fontFamily: "monospace",
    fontSize: 12,
    marginBottom: 20,
    letterSpacing: 2,
  },
  haufeLogoText: {
    color: "#2fff00",
    fontSize: 50,
    fontWeight: "900",
    letterSpacing: 5,
  },
  haufeSubtitle: {
    color: "rgba(38, 255, 0, 0.4)",
    fontFamily: "monospace",
    fontSize: 10,
    marginTop: 10,
  },
  // ✅ STILUL AJUSTAT SĂ BATĂ CU TEXTUL DE DINAINTE
  haufeLogoImage: {
    width: 180, // Redus de la 250 la 180 pentru un look mai discret
    height: 55, // Redus de la 80 la 55 (aproximativ mărimea textului de 50px)
    marginVertical: 10, // Puțin spațiu sus-jos
  },

  haufeContainer: {
    alignItems: "center",
    padding: 30,
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderRadius: 20,
    backgroundColor: "#050505",
    minWidth: 260, // Am redus și lățimea minimă a containerului să fie mai compact
  },
});
