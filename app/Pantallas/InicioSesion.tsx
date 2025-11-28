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
  View
} from "react-native";
import { URL } from "../config/URL";

const InicioDeSesion: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

 
  useEffect(() => {
    const limpiar = async () => {
      await AsyncStorage.clear();
      setCorreo("");
      setPassword("");
    };

    limpiar();
  }, [route.key]);


  const Administrar = () => {
   /*  Alert.alert(
      "Abrir Admin",
      "Esto abrirá el administrador en el navegador.",
      [
        {
          text: "Abrir",
          onPress: () =>
            Linking.openURL("http://127.0.0.1:8000/admin/")
        },
        { text: "Cancelar", style: "cancel" }erroe a
      ]
    ); */
  };


  const Ingresar = async () => {
    try {
      const response = await fetch(`${URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });
      console.log("iniciando sesion...")
      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("usuario", JSON.stringify(data.usuario));
        await AsyncStorage.setItem("powerbi_token", data.powerbi_token);


        await precargarDatos(data.usuario.id);
        Alert.alert("Bienvenido", data.usuario.nombre);
        navigation.navigate("ProyectosUsuario");
      } else {
        Alert.alert("Error", data.error || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor por queee");
      console.log("url: ",URL)
    }
  };

 
const precargarDatos = async (usuarioId: number) => {
  try {

    const resProyectos = await fetch(`${URL}/proyectos_usuario/${usuarioId}/`);
    const proyectos = await resProyectos.json();

    if (!resProyectos.ok) {
      console.warn("No se pudieron cargar los proyectos");
      return;
    }


    await AsyncStorage.setItem("proyectos_usuario", JSON.stringify(proyectos));


    for (const proyecto of proyectos) {
      const resDash = await fetch(
        `${URL}/dashboards_con_embed/${proyecto.id}/?usuario_id=${usuarioId}`
      );
      const dashData = await resDash.json();

      if (resDash.ok && dashData.dashboards) {
        await AsyncStorage.setItem(
          `dashboards_${proyecto.id}`,
          JSON.stringify(dashData.dashboards)
        );
      }
    }

    console.log("Datos precargados correctamente");
  } catch (err) {
    console.warn("Error precargando proyectos o dashboards:", err);
  }
};


  return (
    <View style={styles.contenedor}>
      <View style={styles.card}>
      
      <Image 
        source={require('../../assets/img/dataTools.jpg')}
        style={styles.img}
      />

        <Text style={styles.titulo}>Inteligencia Corporativa</Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese su correo"
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

        <TouchableOpacity style={styles.boton} onPress={Ingresar}>
          <Text style={styles.botonTexto}>Ingresar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonAdmin} onPress={Administrar}>
          <Text style={styles.botonTexto}>Administrar</Text>
        </TouchableOpacity>

        <Text style={styles.slogan}>"Producto No Para"</Text>
      </View>
    </View>
  );
};

export default InicioDeSesion;

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
    backgroundColor: "#ffffffff",
    padding: 25,
    borderRadius: 15,
  },
  img:{
    
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
    color: "white",
    marginBottom: 5,
  },
  boton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    marginTop: 50,
  },
  botonAdmin: {
    backgroundColor: "#1088a7ff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  botonTexto: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  slogan: {
    color: "#000000ff",
    marginTop: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
});
