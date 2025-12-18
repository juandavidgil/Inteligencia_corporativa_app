import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { URL } from "../config/URL";

const InicioDeSesion: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");

  const validarCorreo = (correo: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  useEffect(() => {
    const limpiar = async () => {
      await AsyncStorage.clear();
      setCorreo("");
      setPassword("");
      setErrorCorreo("");
      setErrorPassword("");
      setErrorGeneral("");
    };
    limpiar();
  }, [route.key]);

  const Ingresar = async () => {
    setErrorCorreo("");
    setErrorPassword("");
    setErrorGeneral("");

    let valido = true;

    if (!correo.trim()) {
      setErrorCorreo("este campo es obligatorio");
      valido = false;
    } else if (!validarCorreo(correo)) {
      setErrorCorreo("Ingrese un correo válido, ejemplo usuario@datatools.com.co");
      valido = false;
    }

    if (!password.trim()) {
      setErrorPassword("este campo es obligatorio");
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
      await AsyncStorage.setItem("powerbi_token", data.powerbi_token);

      setNombreUsuario(data.usuario.nombre);
      setModalVisible(true);
    } catch {
      setErrorGeneral("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.contenedor,
        { backgroundColor: dark ? "#0d0f1aff" : "#e9e9e9" },
      ]}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: dark ? "#020617" : "#ffffff" },
        ]}
      >
        <Image
          source={require("../../assets/img/datatools.jpg")}
          style={styles.img}
        />

        <Text
          style={[
            styles.titulo,
            { color: dark ? "#f8fafc" : "#020617" },
          ]}
        >
          Inteligencia Corporativa
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
          style={[
            styles.input,
            {
              backgroundColor: dark ? "#020617" : "#e5e7eb",
              color: dark ? "#f8fafc" : "#020617",
              borderColor: dark ? "#334155" : "transparent",
              borderWidth: dark ? 1 : 0,
            },
            errorCorreo && styles.inputError,
          ]}
          placeholder="usuario@datatools.com.co"
          placeholderTextColor={dark ? "#94a3b8" : "#6b7280"}
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {errorCorreo !== "" && (
          <Text style={styles.errorText}>{errorCorreo}</Text>
        )}

        <Text
          style={[
            styles.label,
            { color: dark ? "#cbd5f5" : "#020617" },
          ]}
        >
          Contraseña
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: dark ? "#020617" : "#e5e7eb",
              color: dark ? "#f8fafc" : "#020617",
              borderColor: dark ? "#334155" : "transparent",
              borderWidth: dark ? 1 : 0,
            },
            errorPassword && styles.inputError,
          ]}
          placeholder="Ingrese su contraseña"
          placeholderTextColor={dark ? "#94a3b8" : "#6b7280"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {errorPassword !== "" && (
          <Text style={styles.errorText}>{errorPassword}</Text>
        )}

        {errorGeneral !== "" && (
          <Text style={styles.errorGeneral}>{errorGeneral}</Text>
        )}

        <TouchableOpacity
          style={styles.boton}
          onPress={Ingresar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Ingresar</Text>
          )}
        </TouchableOpacity>
    <TouchableOpacity
  style={[
    styles.botonVerificar,
    { borderColor: dark ? "#475569" : "#2563eb" },
  ]}
  onPress={() => navigation.navigate("VerificarCorreo")}
>
  <Text
    style={[
      styles.botonVerificarTexto,
      { color: dark ? "#cbd5f5" : "#2563eb" },
    ]}
  >
    Cambiar contraseña
  </Text>
</TouchableOpacity>


        <Text
          style={[
            styles.slogan,
            { color: dark ? "#94a3b8" : "#4556a3ff" },
          ]}
        >
          "Producto No Para"
        </Text>
      </View>

     
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: dark ? "#020617" : "#ffffff" },
            ]}
          >
            <Text
              style={[
                styles.modalTitulo,
                { color: dark ? "#f8fafc" : "#020617" },
              ]}
            >
              Bienvenido
            </Text>

            <Text
              style={[
                styles.modalNombre,
                { color: dark ? "#f8fafc" : "#020617" },
              ]}
            >
              {nombreUsuario}
            </Text>

            <TouchableOpacity
              style={styles.modalBoton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("ProyectosUsuario");
              }}
            >
              <Text style={styles.modalBotonTexto}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InicioDeSesion;

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#e9e9e9",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    elevation: 2,
  },
  img: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
    
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 20,
  },
  label: {
    fontSize: 15,
    marginBottom: 5,
    marginTop: 15
  },
  input: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 10,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginBottom: 8,
  },
  errorGeneral: {
    color: "#dc2626",
    textAlign: "center",
    marginTop: 10,
  },
  boton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    marginTop: 25,
  },
  botonTexto: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  botonSecundario: {
    marginTop: 15,
    alignItems: "center",
  },
  botonSecundarioTexto: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  slogan: {
    marginTop: 20,
    textAlign: "center",
    fontStyle: "italic",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalNombre: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalBoton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  modalBotonTexto: {
    color: "#fff",
    fontWeight: "600",
  },
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

});

