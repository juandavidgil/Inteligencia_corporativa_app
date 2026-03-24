import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from "react-native";
import { URL } from "../config/URL";

type Errores = {
  correo?: string;
};

type Modal = {
  visible: boolean;
  mensaje: string;
  tipo: "error" | "success";
  animacion: string;
};

const VerificarCorreo: React.FC = () => {
  const navigation = useNavigation<any>();
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const [correo, setCorreo] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [modal, setModal] = useState<Modal>({
    visible: false,
    mensaje: "",
    tipo: "error",
    animacion: "",
  });

  useFocusEffect(
    useCallback(() => {
      setCorreo("");
      setErrores({});
      setLoading(false);
      setEnviado(false);
      setModal({ visible: false, mensaje: "", tipo: "error", animacion: "" });
    }, [])
  );

  const validarCorreo = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const mostrarModal = (mensaje: string, tipo: "error" | "success") => {
    setModal({
      visible: true,
      mensaje,
      tipo,
      animacion: tipo === "error" ? "shake" : "fadeIn",
    });
    setTimeout(
      () => setModal((prev) => ({ ...prev, animacion: "fadeOut" })),
      900
    );
    setTimeout(
      () =>
        setModal({ visible: false, mensaje: "", tipo: "error", animacion: "" }),
      1200
    );
  };

  const handleEnviar = async () => {
    const nuevosErrores: Errores = {};
    let hayErrores = false;

    if (!correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio.";
      hayErrores = true;
    } else if (!validarCorreo(correo)) {
      nuevosErrores.correo =
        "Ingrese un correo válido (ejemplo: usuario@datatools.com.co)";
      hayErrores = true;
    }

    if (hayErrores) {
      setErrores(nuevosErrores);
      return;
    }

    setLoading(true);
    setErrores({});

    try {
      await fetch(`${URL}/solicitar-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      // ✅ Siempre mostrar éxito — no revelar si el correo existe
      setEnviado(true);
      mostrarModal("Enlace enviado correctamente", "success");
    } catch {
      mostrarModal("Error al conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {modal.visible && (
        <View style={styles.modalOverlay}>
          <View
            style={
              modal.tipo === "error" ? styles.modalError : styles.modalSuccess
            }
          >
            <Text style={styles.modalText}>{modal.mensaje}</Text>
          </View>
        </View>
      )}

      <View style={{ flex: 1, backgroundColor: dark ? "#0d0f1a" : "#e9e9e9" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                {/* ENCABEZADO */}
                <View style={styles.encabezado}>
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    style={[
                      styles.botonVolver,
                      { backgroundColor: dark ? "#1e293b" : "#e2e8f0" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.textoVolver,
                        { color: dark ? "#e2e8f0" : "#0f172a" },
                      ]}
                    >
                      ←
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={[
                    styles.titulo,
                    { color: dark ? "#f8fafc" : "#020617" },
                  ]}
                >
                  Olvidé mi contraseña
                </Text>

                {/* ✅ PANTALLA DE ÉXITO — igual que la web */}
                {enviado ? (
                  <View style={styles.exitoContenedor}>
                    <Text style={styles.exitoIcono}>✅</Text>
                    <Text
                      style={[
                        styles.exitoTexto,
                        { color: dark ? "#cbd5e1" : "#374151" },
                      ]}
                    >
                      Si el correo está registrado, recibirás un enlace en tu
                      bandeja de entrada.
                    </Text>
                    <TouchableOpacity
                      style={styles.boton}
                      onPress={() => navigation.goBack()}
                    >
                      <Text style={styles.botonTexto}>Volver al inicio</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {/* FORMULARIO */}
                    <Text
                      style={[
                        styles.label,
                        { color: dark ? "#cbd5f5" : "#020617" },
                      ]}
                    >
                      Ingresa tu correo y te enviaremos un enlace para
                      restablecer tu contraseña.
                    </Text>

                    <TextInput
                      placeholder="Correo electrónico"
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
                      onPress={handleEnviar}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.botonTexto}>Enviar enlace</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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

  encabezado: {
    width: "100%",
    justifyContent: "center",
    marginBottom: 16,
  },

  botonVolver: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  textoVolver: {
    fontSize: 14,
    fontWeight: "600",
  },

  titulo: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
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

  /* PANTALLA DE ÉXITO */
  exitoContenedor: {
    alignItems: "center",
    paddingVertical: 10,
  },

  exitoIcono: {
    fontSize: 40,
    marginBottom: 16,
  },

  exitoTexto: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 8,
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

  modalError: {
    backgroundColor: "#c62828",
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 14,
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
