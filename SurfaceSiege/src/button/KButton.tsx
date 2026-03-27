import { StyleSheet, TouchableOpacity, Text } from "react-native";

interface KButtonProps {
  title: string;
  onPress: () => void;
}

export function KButton({ title, onPress }: KButtonProps) {
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
