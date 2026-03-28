import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
// 1. Am importat hook-ul de navigare
import { useNavigation } from "@react-navigation/native"; 
import { KButton } from "../../button/KButton";

interface PosterLocation {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: "active" | "damaged"; 
}

const MOCK_POSTERS: PosterLocation[] = [
  {
    id: "1",
    title: "Afiș Piața Victoriei",
    description: "Lângă Catedrală. Vizibilitate maximă.",
    latitude: 45.7537,
    longitude: 21.2257,
    status: "active",
  },
  {
    id: "2",
    title: "Afiș Iulius Town",
    description: "Panoul principal de la intrare. Stare foarte bună.",
    latitude: 45.7663,
    longitude: 21.2295,
    status: "active",
  },
  {
    id: "3",
    title: "Afiș Complex Studențesc",
    description: "Strada Daliei, Căminul C11. Stare excelentă.",
    latitude: 45.749730,
    longitude: 21.2426,
    status: "active",
  },
];

const INITIAL_REGION = {
  latitude: 45.7537,
  longitude: 21.2257,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const MapScreen = () => {
  const [selectedPoster, setSelectedPoster] = useState<PosterLocation | null>(null);
  
  // 2. Am inițializat navigatorul
  const navigation = useNavigation<any>(); 

  const handleScanPress = () => {
    console.log("Navighează spre scanare pentru:", selectedPoster?.title);
    
    // 3. AICI E MAGIA: Te trimite automat pe tab-ul de Scanare!
    navigation.navigate("ScanScreen"); 
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true} 
        onPress={() => setSelectedPoster(null)} 
      >
        {MOCK_POSTERS.map((poster) => (
          <Marker
            key={poster.id}
            coordinate={{ latitude: poster.latitude, longitude: poster.longitude }}
            pinColor={poster.status === "active" ? "#10B981" : "#EF4444"} 
            onPress={(e) => {
              e.stopPropagation(); 
              setSelectedPoster(poster);
            }}
          />
        ))}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Harta Afișelor 🗺️</Text>
      </View>

      {selectedPoster && (
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{selectedPoster.title}</Text>
              <View 
                style={[
                  styles.statusBadge, 
                  { backgroundColor: selectedPoster.status === "active" ? "#D1FAE5" : "#FEE2E2" }
                ]}
              >
                <Text 
                  style={[
                    styles.statusText,
                    { color: selectedPoster.status === "active" ? "#059669" : "#DC2626" }
                  ]}
                >
                  {selectedPoster.status === "active" ? "Activ" : "Deteriorat"}
                </Text>
              </View>
            </View>
            
            <Text style={styles.cardDescription}>{selectedPoster.description}</Text>
            
            <View style={styles.buttonWrapper}>
              <KButton 
                title="Scanează Locația" 
                onPress={handleScanPress} 
                variant="glow" 
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  header: {
    position: "absolute",
    top: 50, 
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    ...Platform.select({ android: { elevation: 5 } }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    letterSpacing: 0.5,
  },
  cardContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    ...Platform.select({ android: { elevation: 10 } }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});