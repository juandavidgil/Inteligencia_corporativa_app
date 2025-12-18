import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { URL } from "../config/URL";

type RootStackParamList = {
  CambiarContraseña: {
    usuarioId: number;
  };
};

type RouteProps = RouteProp<RootStackParamList, "CambiarContraseña">;

type Errores = {
  contraseñaActual?: string;
  nuevaContraseña?: string;
  confirmarContraseña?: string;
};

const CambiarContraseña: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { usuarioId } = route.params;

  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const [contraseñaActual, setContraseñaActual] = useState("");
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");

  const [errores, setErrores] = useState<Errores>({});
  const [loading, setLoading] = useState(false);
  const [passwordValida, setPasswordValida] = useState<boolean | null>(null);

  /* ===== MODAL ===== */
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!usuarioId) {
      navigation.navigate("InicioSesion");
    }
  }, [usuarioId]);

  const verificarContraseña = (value: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

  const validarFormulario = (): boolean => {
    const nuevosErrores: Errores = {};

    if (!contraseñaActual.trim()) {
      nuevosErrores.contraseñaActual = "Este campo es obligatorio";
    }

    if (!nuevaContraseña.trim()) {
      nuevosErrores.nuevaContraseña = "Este campo es obligatorio";
    } else if (!verificarContraseña(nuevaContraseña)) {
      nuevosErrores.nuevaContraseña =
        "Mín. 8 caracteres, mayúscula, número y símbolo";
    }

    if (!confirmarContraseña.trim()) {
      nuevosErrores.confirmarContraseña = "Este campo es obligatorio";
    } else if (nuevaContraseña !== confirmarContraseña) {
      nuevosErrores.confirmarContraseña = "Las contraseñas no coinciden";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const mostrarModal = () => {
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
        navigation.navigate("InicioSesion");
      });
    }, 1500);
  };

  const Cambiar = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${URL}/cambiarContraseña/${usuarioId}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actual: contraseñaActual,
            nueva: nuevaContraseña,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrores({
          contraseñaActual: data?.error || "Contraseña incorrecta",
        });
        return;
      }

      setErrores({});
      mostrarModal();
    } catch {
      setErrores({
        contraseñaActual: "No se pudo conectar con el servidor",
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
              Contraseña actualizada correctamente
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
            Cambiar Contraseña
          </Text>

          <Text style={[styles.label, { color: dark ? "#cbd5f5" : "#020617" }]}>
            Contraseña actual
          </Text>
          <TextInput
            secureTextEntry
            placeholder="Contraseña actual"
            placeholderTextColor={dark ? "#94a3b8" : "#6b7280"}
            value={contraseñaActual}
            onChangeText={setContraseñaActual}
            style={[
              styles.input,
              {
                backgroundColor: dark ? "#020617" : "#e5e7eb",
                color: dark ? "#f8fafc" : "#020617",
                borderColor: dark ? "#334155" : "transparent",
                borderWidth: dark ? 1 : 0,
              },
              errores.contraseñaActual && styles.inputError,
            ]}
          />
          {errores.contraseñaActual && (
            <Text style={styles.errorText}>{errores.contraseñaActual}</Text>
          )}

          <Text style={[styles.label, { color: dark ? "#cbd5f5" : "#020617" }]}>
            Nueva contraseña
          </Text>
          <TextInput
            secureTextEntry
            placeholder="Nueva contraseña"
            placeholderTextColor={dark ? "#94a3b8" : "#6b7280"}
            value={nuevaContraseña}
            onChangeText={(text) => {
              setNuevaContraseña(text);
              setPasswordValida(text ? verificarContraseña(text) : null);
            }}
            style={[
              styles.input,
              {
                backgroundColor: dark ? "#020617" : "#e5e7eb",
                color: dark ? "#f8fafc" : "#020617",
                borderColor: dark ? "#334155" : "transparent",
                borderWidth: dark ? 1 : 0,
              },
              (errores.nuevaContraseña || passwordValida === false) &&
                styles.inputError,
            ]}
          />

          {errores.nuevaContraseña && (
            <Text style={styles.errorText}>{errores.nuevaContraseña}</Text>
          )}

          {passwordValida === true && (
            <Text style={styles.successText}>Contraseña segura</Text>
          )}

          <Text style={[styles.label, { color: dark ? "#cbd5f5" : "#020617" }]}>
            Confirmar contraseña
          </Text>
          <TextInput
            secureTextEntry
            placeholder="Confirmar contraseña"
            placeholderTextColor={dark ? "#94a3b8" : "#6b7280"}
            value={confirmarContraseña}
            onChangeText={setConfirmarContraseña}
            style={[
              styles.input,
              {
                backgroundColor: dark ? "#020617" : "#e5e7eb",
                color: dark ? "#f8fafc" : "#020617",
                borderColor: dark ? "#334155" : "transparent",
                borderWidth: dark ? 1 : 0,
              },
              errores.confirmarContraseña && styles.inputError,
            ]}
          />
          {errores.confirmarContraseña && (
            <Text style={styles.errorText}>
              {errores.confirmarContraseña}
            </Text>
          )}

          <TouchableOpacity
            style={styles.boton}
            onPress={Cambiar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botonTexto}>Actualizar contraseña</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default CambiarContraseña;

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

  successText: {
    color: "#16a34a",
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
