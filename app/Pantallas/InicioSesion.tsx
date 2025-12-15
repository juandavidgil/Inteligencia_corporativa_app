import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { URL } from "../config/URL";

const InicioDeSesion: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");


  const validarCorreo = (correo: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };


  useEffect(() => {
    const limpiar = async () => {
      await AsyncStorage.clear();
      setCorreo("");
      setPassword("");
    };
    limpiar();
  }, [route.key]);

  
  const Ingresar = async () => {
    if (!correo.trim()) {
      Alert.alert("Error", "El correo es obligatorio.");
      return;
    }

    if (!validarCorreo(correo)) {
      Alert.alert(
        "Error",
        "Ingrese un correo válido (ejemplo: usuario@datatools.com.co)"
      );
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "La contraseña es obligatoria.");
      return;
    }

    try {
      const response = await fetch(`${URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem(
          "usuario",
          JSON.stringify(data.usuario)
        );
        await AsyncStorage.setItem(
          "powerbi_token",
          data.powerbi_token
        );

        await precargarDatos(data.usuario.id);

        Alert.alert(
          "Bienvenido",
          data.usuario.nombre,
          [
            {
              text: "Continuar",
              onPress: () =>
                navigation.navigate("ProyectosUsuario"),
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert("Error", "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      Alert.alert(
        "Error",
        "Error al conectar con el servidor"
      );
    }
  };

 
  const precargarDatos = async (usuarioId: number) => {
    try {
      const proyectosRes = await fetch(
        `${URL}/proyectos_usuario/${usuarioId}/`
      );
      const proyectos = await proyectosRes.json();

      if (!proyectosRes.ok) return;

      await AsyncStorage.setItem(
        "proyectos_usuario",
        JSON.stringify(proyectos)
      );

   for (const proyecto of proyectos) {
  const tiposRes = await fetch(
    `${URL}/tipos_dashboards/${proyecto.id}/?usuario_id=${usuarioId}`
  );

  const tiposData = await tiposRes.json();
/* 
  console.log(
    "Tipos dashboards - Proyecto:",
    proyecto.id,
    "Respuesta completa:",
    tiposData
  );
 */
  const tipos = tiposData.tipos || [];

/*   console.log(
    "Tipos procesados - Proyecto:",
    proyecto.id,
    tipos
  ); */

  await AsyncStorage.setItem(
    `tipos_${proyecto.id}`,
    JSON.stringify(tipos)
  );

  for (const tipo of tipos) {
    const dashboardsRes = await fetch(
      `${URL}/dashboards_con_embed/${proyecto.id}/?usuario_id=${usuarioId}&tipo=${tipo}`
    );
    const dashboardsData = await dashboardsRes.json();

    if (dashboardsRes.ok) {
      await AsyncStorage.setItem(
        `dashboards_${proyecto.id}_${tipo}`,
        JSON.stringify(dashboardsData.dashboards || [])
      );
    }
  }
}

    } catch (error) {
      console.warn(
        "Error precargando proyectos/tipos/dashboards:",
        error
      );
    }
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.card}>
        <Image
          source={require("../../assets/img/datatools.jpg")}
          style={styles.img}
        />

        <Text style={styles.titulo}>
          Inteligencia Corporativa
        </Text>

        <Text style={styles.label}>
          Correo electrónico
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese su correo electrónico"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese su contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.boton}
          onPress={Ingresar}
        >
          <Text style={styles.botonTexto}>
            Ingresar
          </Text>
        </TouchableOpacity>

        <Text style={styles.slogan}>
          "Producto No Para"
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#e9e9e9ff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    elevation: 5,
  },
  img: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
    marginBottom: 10,
  },
  titulo: {
    color: "black",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    color: "black",
    marginBottom: 5,
    fontSize: 15,
  },
  input: {
    backgroundColor: "#ccccccff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  boton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    marginTop: 30,
  },
  botonTexto: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  slogan: {
    color: "#000",
    marginTop: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default InicioDeSesion;
