import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type RootStackParamList = { NotificationsScreen: undefined };
type Props = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "NotificationsScreen"
  >;
};

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  // Aceste stări se pot salva ușor în baza de date ca booleene pentru fiecare utilizator
  const [notifyNewArt, setNotifyNewArt] = useState(true);
  const [notifyCollab, setNotifyCollab] = useState(true);
  const [notifySystem, setNotifySystem] = useState(false);

  return (
    <LinearGradient
      colors={["#0A1128", "#030613", "#000000"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>System Alerts</Text>
        </View>

        <View style={styles.list}>
          <View style={styles.alertCard}>
            <View style={styles.textContainer}>
              <Text style={styles.alertTitle}>New Canvas Detected</Text>
              <Text style={styles.alertDesc}>
                Notificare când te apropii de un afiș-ancoră necunoscut.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, notifyNewArt && styles.toggleActive]}
              onPress={() => setNotifyNewArt(!notifyNewArt)}
            >
              <View
                style={[styles.toggleKnob, notifyNewArt && styles.knobActive]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.alertCard}>
            <View style={styles.textContainer}>
              <Text style={styles.alertTitle}>Collaboration Ping</Text>
              <Text style={styles.alertDesc}>
                Te anunță când cineva desenează pe același canvas cu tine.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, notifyCollab && styles.toggleActive]}
              onPress={() => setNotifyCollab(!notifyCollab)}
            >
              <View
                style={[styles.toggleKnob, notifyCollab && styles.knobActive]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.alertCard}>
            <View style={styles.textContainer}>
              <Text style={styles.alertTitle}>System Updates</Text>
              <Text style={styles.alertDesc}>
                Mesaje administrative despre servere și patch-uri.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, notifySystem && styles.toggleActive]}
              onPress={() => setNotifySystem(!notifySystem)}
            >
              <View
                style={[styles.toggleKnob, notifySystem && styles.knobActive]}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.infoText}>
            Modificările sunt salvate automat pe server.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  backBtn: { paddingRight: 15 },
  backText: { color: "#3B82F6", fontSize: 24, fontWeight: "bold" },
  title: { fontSize: 28, fontWeight: "900", color: "#FFF", letterSpacing: 1 },

  list: { flex: 1, gap: 16 },
  alertCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(10, 15, 36, 0.6)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  textContainer: { flex: 1, paddingRight: 15 },
  alertTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  alertDesc: { color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 16 },

  toggleBtn: {
    width: 50,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    justifyContent: "center",
    padding: 2,
  },
  toggleActive: { backgroundColor: "#3B82F6" },
  toggleKnob: {
    width: 24,
    height: 24,
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  knobActive: { transform: [{ translateX: 22 }] },

  footer: { alignItems: "center", marginBottom: 30 },
  infoText: {
    color: "rgba(59, 130, 246, 0.5)",
    fontSize: 12,
    fontStyle: "italic",
  },
});
