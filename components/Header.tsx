import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <TouchableOpacity
        style={styles.logoContainer}
        onPress={() => router.push("/")}
      >
        <Ionicons name="rocket-outline" size={24} />
        <Text style={styles.logoText}>OrbitBook</Text>
      </TouchableOpacity>

      {/* Botão Menu */}
      <TouchableOpacity
        onPress={() => setMenuOpen(!menuOpen)}
      >
        <Ionicons
          name={menuOpen ? "close" : "menu"}
          size={28}
        />
      </TouchableOpacity>

      {/* Menu */}
      {menuOpen && (
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              router.push("/");
              setMenuOpen(false);
            }}
          >
            <Text>Início</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              router.push("/destinations");
              setMenuOpen(false);
            }}
          >
            <Text>Catálogo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              router.push("/ai");
              setMenuOpen(false);
            }}
          >
            <Text>Assistente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.accountButton}
            onPress={() => {
              router.push("/profile");
              setMenuOpen(false);
            }}
          >
            <Ionicons
              name="person-outline"
              size={18}
            />
            <Text>Minha Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reserveButton}
            onPress={() => {
              router.push("/destinations");
              setMenuOpen(false);
            }}
          >
            <Text style={styles.reserveText}>
              Reservar Agora
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#0B1020",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logoText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  menuContainer: {
    marginTop: 16,
    gap: 12,
  },

  menuItem: {
    paddingVertical: 12,
  },

  accountButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },

  reserveButton: {
    marginTop: 10,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  reserveText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});