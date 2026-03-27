import { StyleSheet, TouchableOpacity, Text } from "react-native";

export function KButton({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24,
  },
});
