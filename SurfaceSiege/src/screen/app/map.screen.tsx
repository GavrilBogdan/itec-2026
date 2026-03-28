import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Platform, 
  Animated, 
  StatusBar,
  Vibration,
  TouchableOpacity
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { KButton } from "../../button/KButton";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.04; 
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const PRIMARY_COLOR = "#4F46E5"; 

interface PosterLocation {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: "active" | "damaged";
}

// 10 LOCAȚII
const MOCK_POSTERS: PosterLocation[] = [
  { id: "1", title: "Afiș Piața Victoriei", description: "Lângă Catedrală. Vizibilitate maximă.", latitude: 45.7537, longitude: 21.2257, status: "active" },
  { id: "2", title: "Afiș Iulius Town", description: "Panoul principal de la intrare. Necesită reparații.", latitude: 45.7663, longitude: 21.2295, status: "damaged" },
  { id: "3", title: "Afiș Cămin 11C", description: "Strada Daliei. Stare excelentă.", latitude: 45.748520, longitude: 21.239540, status: "active" },
  { id: "4", title: "Afiș Stadionul Electrica", description: "Intrarea principală a stadionului. Flux mare în weekend.", latitude: 45.7645, longitude: 21.2612, status: "active" },
  { id: "5", title: "Afiș Parcul Botanic", description: "Aleea principală, vizibilitate pietonală mare.", latitude: 45.7589, longitude: 21.2263, status: "active" },
  { id: "6", title: "Afiș Gara de Nord", description: "Peronul 1. Sistem compromis. Intervenție necesară.", latitude: 45.7489, longitude: 21.2057, status: "damaged" },
  { id: "7", title: "Afiș Shopping City", description: "Zona food court, Calea Șagului.", latitude: 45.7275, longitude: 21.2051, status: "active" },
  { id: "8", title: "Afiș Parcul Copiilor", description: "Aproape de intrarea principală dinspre Michelangelo.", latitude: 45.7523, longitude: 21.2361, status: "active" },
  { id: "9", title: "Afiș Spitalul Județean", description: "Lângă intrarea de urgențe. Senzor deconectat.", latitude: 45.7369, longitude: 21.2398, status: "damaged" },
  { id: "10", title: "Afiș Piața Traian", description: "Pe colț. Suprafață vandalizată.", latitude: 45.7578, longitude: 21.2483, status: "damaged" },
];

const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d1d1d" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#333333" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d5d5d5" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1d1d1d" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e0e" }] }
];

const CustomPulsingMarker = ({ status }: { status: "active" | "damaged" }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const color = status === "active" ? "#10B981" : "#EF4444"; 

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const scale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 3.5] });
  const opacity = pulseAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.8, 0.3, 0] });

  return (
    <View style={styles.markerContainer}>
      <Animated.View style={[styles.pulseCircle, { borderColor: color, transform: [{ scale }], opacity }]} />
      <View style={[styles.centerDot, { backgroundColor: color }]} />
    </View>
  );
};

export const MapScreen = () => {
  const [selectedPoster, setSelectedPoster] = useState<PosterLocation | null>(null);
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation<any>();
  
  // Animații
  const slideAnim = useRef(new Animated.Value(height)).current; 
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;

  const handleMarkerPress = (poster: PosterLocation) => {
    // Resetăm erorile vizuale dacă utilizatorul schimbă afișul
    shakeAnim.setValue(0);
    errorOpacity.setValue(0);
    setSelectedPoster(poster);
    
    mapRef.current?.animateCamera({
      center: { latitude: poster.latitude - 0.003, longitude: poster.longitude },
      pitch: 45, 
      heading: 0,
      altitude: 1000,
      zoom: 16.5,
    }, { duration: 1000 });

    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleMapPress = () => {
    if (selectedPoster) {
      setSelectedPoster(null);
      Animated.timing(slideAnim, { toValue: height, duration: 300, useNativeDriver: true }).start();
      mapRef.current?.animateCamera({ pitch: 0 }, { duration: 500 });
    }
  };

  const handleActionPress = () => {
    if (selectedPoster?.status === "damaged") {
      // 🚨 EFECT DE EROARE (GLITCH + VIBRAȚIE)
      Vibration.vibrate(100); // Scurtă vibrație

      // Tremuratul butonului (Shake)
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
      ]).start();

      // Apariția mesajului de eroare neon
      Animated.sequence([
        Animated.timing(errorOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.delay(2000), // Stă afișat 2 secunde
        Animated.timing(errorOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start();
      
    } else {
      // Totul e ok, mergem la scanare
      navigation.navigate("ScanScreen");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        customMapStyle={mapStyle} 
        initialRegion={{
          latitude: MOCK_POSTERS[0].latitude,
          longitude: MOCK_POSTERS[0].longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        onPress={handleMapPress}
        showsCompass={false}
      >
        {MOCK_POSTERS.map((poster) => (
          <Marker
            key={poster.id}
            coordinate={{ latitude: poster.latitude, longitude: poster.longitude }}
            onPress={(e) => {
              e.stopPropagation();
              handleMarkerPress(poster);
            }}
            anchor={{ x: 0.5, y: 0.5 }} 
          >
            <CustomPulsingMarker status={poster.status} />
          </Marker>
        ))}
      </MapView>

      <View style={styles.header}>
        <View style={styles.headerDot} />
        <Text style={styles.headerTitle}>POSTER<Text style={{color: PRIMARY_COLOR}}>RADAR</Text></Text>
      </View>

      <Animated.View 
        style={[
          styles.sheetContainer, 
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        {selectedPoster && (
          <View style={styles.card}>
            <View style={styles.handle} /> 
            
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{selectedPoster.title}</Text>
                <Text style={styles.cardSubtitle}>Timișoara, RO</Text>
              </View>
              <View style={[styles.statusBadge, { borderColor: selectedPoster.status === "active" ? "#10B981" : "#EF4444" }]}>
                <Text style={[styles.statusText, { color: selectedPoster.status === "active" ? "#10B981" : "#EF4444" }]}>
                  {selectedPoster.status === "active" ? "ACTIV" : "AVARIAT"}
                </Text>
              </View>
            </View>
            
            <Text style={styles.cardDescription}>{selectedPoster.description}</Text>
            
            {/* 🚀 ZONA DE BUTON (ANIMATĂ PENTRU EROARE) */}
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              {selectedPoster.status === "active" ? (
                <KButton 
                  title={`Scanează Afiș #${selectedPoster.id}`} 
                  onPress={handleActionPress} 
                  variant="glow" 
                />
              ) : (
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={styles.errorButton} 
                  onPress={handleActionPress}
                >
                  <Text style={styles.errorButtonText}>⚠ ECHIPAMENT OFFLINE</Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* MESAJUL DE EROARE HOLOGRAFIC */}
            <Animated.Text style={[styles.errorMessage, { opacity: errorOpacity }]}>
              [ EROARE ] CONEXIUNE RESPINSĂ. SCANAREA NU ESTE POSIBILĂ. AFIȘ AVARIAT.
            </Animated.Text>

          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  map: { ...StyleSheet.absoluteFillObject },
  markerContainer: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  pulseCircle: { position: 'absolute', width: 24, height: 24, borderRadius: 12, borderWidth: 3, backgroundColor: 'transparent' },
  centerDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#fff', shadowColor: "#fff", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 8 },
  header: { position: "absolute", top: Platform.OS === 'ios' ? 60 : 40, left: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: "rgba(30, 30, 30, 0.85)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
  headerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: PRIMARY_COLOR, marginRight: 10 },
  headerTitle: { fontSize: 16, fontWeight: "900", color: "#fff", letterSpacing: 2 },
  sheetContainer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: 'transparent' },
  card: { backgroundColor: "#1e1e1e", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingTop: 15, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.05)", shadowColor: PRIMARY_COLOR, shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 20 },
  handle: { width: 40, height: 4, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 },
  cardTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  cardSubtitle: { fontSize: 14, color: "#8a8a8a", marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: "bold", letterSpacing: 1 },
  cardDescription: { fontSize: 15, color: "#d5d5d5", lineHeight: 22, marginBottom: 25 },
  
  // Stiluri Noi pentru Eroare
  errorButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  errorButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  errorMessage: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 12,
    letterSpacing: 0.5,
    textShadowColor: "rgba(239, 68, 68, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  }
});