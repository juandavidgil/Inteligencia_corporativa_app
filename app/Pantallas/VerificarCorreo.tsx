import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { URL } from "../config/URL";

type Errores = {
  correo?: string;
};

const VerificarCorreo: React.FC = () => {
  const navigation = useNavigation<any>();
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const [correo, setCorreo] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [loading, setLoading] = useState(false);

  /* ===== MODAL ===== */
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const validarCorreo = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const mostrarModal = (usuario: any) => {
    setModalVisible(true);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
        navigation.navigate("CambiarContrasena", {
          usuarioId: usuario.id,
        });
      });
    }, 1500);
  };

  const verificarCorreo = async () => {
    const nuevosErrores: Errores = {};

    if (!correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio";
    } else if (!validarCorreo(correo)) {
      nuevosErrores.correo =
        "Ingrese un correo válido, ejemplo usuario@datatools.com.co";
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    try {
      setLoading(true);

      const response = await fetch(`${URL}/verificarCorreo/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrores({ correo: "Correo no registrado" });
        return;
      }

      await AsyncStorage.setItem("usuario", JSON.stringify(data.usuario));
      setErrores({});
      mostrarModal(data.usuario);
    } catch {
      setErrores({
        correo: "No se pudo conectar con el servidor",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalSuccess,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={styles.modalText}>
              Correo verificado correctamente
            </Text>
          </Animated.View>
        </View>
      )}

      <View
        style={[
          styles.contenedor,
          { backgroundColor: dark ? "#0d0f1a" : "#e9e9e9" },
        ]}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: dark ? "#020617" : "#ffffff" },
          ]}
        >
          <Text
            style={[
              styles.titulo,
              { color: dark ? "#f8fafc" : "#020617" },
            ]}
          >
            Verificar correo
          </Text>

          <Text
            style={[
              styles.label,
              { color: dark ? "#cbd5f5" : "#020617" },
            ]}
          >
            Correo electrónico
          </Text>

          <TextInput
            placeholder="usuario@datatools.com.co"
            placeholderTextColor={dark ? "#94a3b8" : "#6b7280"}
            value={correo}
            onChangeText={(text) => {
              setCorreo(text);
              setErrores({});
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[
              styles.input,
              {
                backgroundColor: dark ? "#020617" : "#e5e7eb",
                color: dark ? "#f8fafc" : "#020617",
                borderColor: dark ? "#334155" : "transparent",
                borderWidth: dark ? 1 : 0,
              },
              errores.correo && styles.inputError,
            ]}
          />

          {errores.correo && (
            <Text style={styles.errorText}>{errores.correo}</Text>
          )}

          <TouchableOpacity
            style={styles.boton}
            onPress={verificarCorreo}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botonTexto}>Verificar correo</Text>
            )}
          </TouchableOpacity>


        {/*   <TouchableOpacity
            style={[
              styles.botonVerificar,
              { borderColor: dark ? "#475569" : "#2563eb" },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text
              style={[
                styles.botonVerificarTexto,
                { color: dark ? "#cbd5f5" : "#2563eb" },
              ]}
            >
              Volver a iniciar sesión
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </>
  );
};

export default VerificarCorreo;

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  card: {
    width: "100%",
    padding: 25,
    borderRadius: 15,
    elevation: 2,
  },

  titulo: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    marginBottom: 5,
  },

  input: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  inputError: {
    borderWidth: 1,
    borderColor: "#dc2626",
  },

  errorText: {
    color: "#dc2626",
    fontSize: 13,
    marginBottom: 8,
  },

  boton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },

  botonTexto: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },

  /* BOTÓN SECUNDARIO */
  botonVerificar: {
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },

  botonVerificarTexto: {
    fontSize: 14,
    fontWeight: "600",
  },

  /* MODAL */
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modalSuccess: {
    backgroundColor: "#2e7d32",
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 14,
  },

  modalText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
