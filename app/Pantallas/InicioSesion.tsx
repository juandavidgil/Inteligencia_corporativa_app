import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { URL } from "../config/URL";

const TERMS_VERSION = "1.0";
const PRIVACY_URL =
  "https://wa-inteligenciacorporativa-frn-dt-prod-anb2ehg4caakb4et.eastus2-01.azurewebsites.net/politica-privacidad";

const InicioDeSesion: React.FC = () => {
  const navigation = useNavigation<any>();
  const scheme = useColorScheme();
  const dark = scheme === "dark";
  const { width, height } = useWindowDimensions();
  const esLandscape = width > height;

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");

  const [loading, setLoading] = useState(false);

  const [modalBienvenida, setModalBienvenida] = useState(false);
  const [modalTerminosVisible, setModalTerminosVisible] = useState(false);

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const validarCorreo = (correo: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  const ingresar = async () => {
    setErrorCorreo("");
    setErrorPassword("");
    setErrorGeneral("");

    let valido = true;

    if (!correo.trim()) {
      setErrorCorreo("Este campo es obligatorio");
      valido = false;
    } else if (!validarCorreo(correo)) {
      setErrorCorreo("Ingrese un correo válido");
      valido = false;
    }

    if (!password.trim()) {
      setErrorPassword("Este campo es obligatorio");
      valido = false;
    }

    if (!valido) return;

    try {
      setLoading(true);

      const response = await fetch(`${URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorGeneral("Credenciales incorrectas");
        return;
      }

      await AsyncStorage.setItem("usuario", JSON.stringify(data.usuario));
      await AsyncStorage.setItem("access_token", data.access);
      await AsyncStorage.setItem("refresh_token", data.refresh);

      if (data.acepto_terminos) {
        await cargarProyectos(data.usuario.id);
        setNombreUsuario(data.usuario.nombre);
        setModalBienvenida(true);
      } else {
        setModalTerminosVisible(true);
      }
    } catch (error) {
      console.error("Error en login:", error);
      setErrorGeneral("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const cargarProyectos = async (usuarioId: number) => {
    try {
      const access_token = await AsyncStorage.getItem("access_token");

      const proyectosRes = await fetch(
        `${URL}/proyectos_usuario/${usuarioId}/`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (proyectosRes.status === 401) {
        navigation.navigate("Login");
        return;
      }

      if (!proyectosRes.ok) {
        console.error("Error al obtener proyectos:", proyectosRes.status);
        return;
      }

      const data = await proyectosRes.json();
      await AsyncStorage.setItem("proyectos", JSON.stringify(data));
    } catch (error) {
      console.error("No se cargaron los proyectos del usuario", error);
    }
  };

  const redireccionProyectos = async () => {
    try {
      const proyectosCache = await AsyncStorage.getItem("proyectos");
      const proyectos = proyectosCache ? JSON.parse(proyectosCache) : [];

      setModalBienvenida(false);

      if (proyectos.length === 1) {
        const proyecto = proyectos[0];
        navigation.navigate(
          proyecto.tiene_carpeta ? "Explorador" : "Tipos",
          { proyectoId: proyecto.id }
        );
      } else {
        navigation.navigate("ProyectosUsuario");
      }
    } catch (error) {
      console.error("Error leyendo proyectos", error);
      navigation.navigate("ProyectosUsuario");
    }
  };

  const aceptarTerminos = async () => {
    try {
      const access_token = await AsyncStorage.getItem("access_token");
      const usuarioStr = await AsyncStorage.getItem("usuario");

      if (!access_token || !usuarioStr) {
        setErrorGeneral("Sesión inválida. Inicie sesión nuevamente.");
        return;
      }

      const usuario = JSON.parse(usuarioStr);

      const response = await fetch(`${URL}/aceptar-terminos-app/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          version: TERMS_VERSION,
          plataforma: Platform.OS,
        }),
      });

      if (!response.ok) {
        setErrorGeneral("No fue posible registrar la aceptación");
        return;
      }

      setModalTerminosVisible(false);
      setNombreUsuario(usuario.nombre);
      setModalBienvenida(true);
    } catch (error) {
      console.error("Error aceptando términos:", error);
      setErrorGeneral("Error de conexión");
    }
  };

  return (

    <View style={{ flex: 1, backgroundColor: dark ? "#0d0f1a" : "#e9e9e9" }}>


      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[
              styles.contenedor,
              { backgroundColor: dark ? "#0d0f1a" : "#e9e9e9" },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.card,
                { backgroundColor: dark ? "#020617" : "#ffffff" },
                esLandscape && styles.cardLandscape,
              ]}
            >
              {/* IZQUIERDA */}
              <View style={esLandscape ? styles.leftSide : undefined}>
                <View style={styles.imgContainer}>
                  <Image
                    source={require("../../assets/img/datatools.jpg")}
                    style={styles.img}
                  />
                </View>
              </View>

              {/* DERECHA */}
              <View style={esLandscape ? styles.rightSide : undefined}>
                <Text
                  style={[
                    styles.titulo,
                    { color: dark ? "#f8fafc" : "#020617" },
                  ]}
                >
                  Inteligencia Corporativa
                </Text>

                <Text
                  style={[styles.label, { color: dark ? "#cbd5f5" : "#020617" }]}
                >
                  Correo electrónico
                </Text>

                <TextInput
                  style={[styles.input, errorCorreo ? styles.inputError : null]}
                  placeholder="usuario@datatools.com.co"
                  placeholderTextColor="#6b7280"
                  value={correo}
                  onChangeText={setCorreo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {errorCorreo !== "" && (
                  <Text style={styles.errorText}>{errorCorreo}</Text>
                )}

                <Text
                  style={[styles.label, { color: dark ? "#cbd5f5" : "#020617" }]}
                >
                  Contraseña
                </Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.inputConIcono,
                      errorPassword ? styles.inputError : null,
                    ]}
                    placeholder="Ingrese su contraseña"
                    placeholderTextColor="#6b7280"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!mostrarPassword}
                  />
                  <TouchableOpacity
                    style={styles.ojito}
                    onPress={() => setMostrarPassword(!mostrarPassword)}
                  >
                     <Ionicons
    name={mostrarPassword ? "eye-off-outline" : "eye-outline"}
    size={20}
    color="#6b7280"
  />
                  </TouchableOpacity>
                </View>

                {errorPassword !== "" && (
                  <Text style={styles.errorText}>{errorPassword}</Text>
                )}

                {errorGeneral !== "" && (
                  <Text style={styles.errorGeneral}>{errorGeneral}</Text>
                )}

                <TouchableOpacity
                  style={styles.boton}
                  onPress={ingresar}
                  disabled={loading || modalTerminosVisible}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.botonTexto}>Ingresar</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botonVerificar}
                  onPress={() => navigation.navigate("VerificarCorreo")}
                >
                  <Text style={styles.botonVerificarTexto}>
                    Cambiar contraseña
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>



      <Modal transparent visible={modalBienvenida} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Bienvenido</Text>
            <Text style={styles.modalNombre}>{nombreUsuario}</Text>
            <TouchableOpacity
              style={styles.modalBoton}
              onPress={redireccionProyectos}
            >
              <Text style={styles.modalBotonTexto}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={modalTerminosVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Términos y Condiciones</Text>

            <Text style={{ textAlign: "center", marginBottom: 15 }}>
              Debes aceptar los términos y condiciones y la política de
              privacidad para continuar.
            </Text>

            <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
              <Text style={styles.link}>Ver TyC y Política de Privacidad</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalBoton,
                { opacity: aceptaTerminos ? 1 : 0.6 },
              ]}
              disabled={!aceptaTerminos}
              onPress={aceptarTerminos}
            >
              <Text style={styles.modalBotonTexto}>Aceptar y continuar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAceptaTerminos(!aceptaTerminos)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: aceptaTerminos }}
              style={styles.checkboxContainer}
            >
              <View
                style={[
                  styles.checkbox,
                  aceptaTerminos && styles.checkboxActivo,
                ]}
              >
                {aceptaTerminos && (
                  <Text style={styles.checkboxMarca}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxTexto}>
                He leído y acepto los términos
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default InicioDeSesion;

const styles = StyleSheet.create({
  cardLandscape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rightSide: {
    flex: 1.5,
  },
  contenedor: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: { padding: 25, borderRadius: 15 },
  imgContainer: {
    width: "60%",
    height: 160,
    borderRadius: 15,
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: 10,
  },
  img: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  titulo: { fontSize: 24, fontWeight: "700", textAlign: "center", margin: 20 },
  label: { marginTop: 15 },
  input: { backgroundColor: "#e5e7eb", padding: 12, borderRadius: 10 },
  inputError: { borderWidth: 1, borderColor: "#dc2626" },
  errorText: { color: "#dc2626", fontSize: 12 },
  errorGeneral: { color: "#dc2626", textAlign: "center", marginTop: 10 },
  boton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    marginTop: 25,
  },
  botonTexto: { color: "#fff", textAlign: "center", fontWeight: "600" },
  botonVerificar: { marginTop: 15, alignItems: "center" },
  botonVerificarTexto: { color: "#2563eb", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
  },
  modalTitulo: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  modalNombre: { fontSize: 18, marginBottom: 20 },
  modalBoton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  modalBotonTexto: { color: "#fff", fontWeight: "600" },
  link: { color: "#2563eb", marginBottom: 8 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxActivo: {
    backgroundColor: "#2563eb",
  },
  checkboxMarca: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  checkboxTexto: {
    fontSize: 14,
    color: "#374151",
  },

  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  inputConIcono: {
    paddingRight: 45,
  },
  ojito: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
  }
});
