import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Neiva from "../../assets/img//neiva.jpg";
import ATM from "../../assets/img/atm.png";
import Cartagena from "../../assets/img/cartagena.png";
import Chia from "../../assets/img/chia.png";
import MOVIDIC from "../../assets/img/movidic.png";
import Silvania from "../../assets/img/silvania.jpg";
import VUS from "../../assets/img/vus.png";
import Data from "../../assets/img/datatools.jpg";
import { URL } from "../config/URL";

interface Proyecto {
  id: number;
  nombre_proyecto: string;
}

const ProyectosUsuario: React.FC = () => {
  const navigation = useNavigation<any>();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  const imagenesProyectos: Record<string, any> = {
    Guayaquil: ATM,
    VUS: VUS,
    MOVIDIC: MOVIDIC,
    Chía: Chia,
    Silvania: Silvania,
    Neiva: Neiva,
    Cartagena: Cartagena,
    Data: Data,
  };

  const cargarProyectos = async () => {
    try {
      const usuarioString = await AsyncStorage.getItem("usuario");
      const usuario = usuarioString ? JSON.parse(usuarioString) : null;

      if (!usuario?.id) {
        console.warn("No se encontró el usuario en AsyncStorage");
        setLoading(false);
        return;
      }

      const cache = await AsyncStorage.getItem("proyectos_usuario");
      if (cache) {
        setProyectos(JSON.parse(cache));
        setLoading(false);
        return;
      }

      const response = await fetch(`${URL}/proyectos_usuario/${usuario.id}/`);
      const data = await response.json();

      if (response.ok) {
        setProyectos(data);
        await AsyncStorage.setItem("proyectos_usuario", JSON.stringify(data));
      } else {
        console.error("Error al obtener proyectos:", data);
      }
    } catch (err) {
      console.error("Error de conexión:", err);
    } finally {
      setLoading(false);
    }
  };

  const CerrarSesion = async () => {
    await AsyncStorage.removeItem("usuario");
    await AsyncStorage.removeItem("proyectos_usuario");
    navigation.navigate("Login");
  };

  useEffect(() => {
    cargarProyectos();
  }, []);

  if (loading) {
    return (
      <View style={styles.cuerpo}>
        <ActivityIndicator size="large" color="#000000ff" />
        <Text style={styles.titulo}>Cargando tus módulos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.cuerpo}>
      <Text style={styles.titulo}>MÓDULOS</Text>
      <Text style={styles.subtitulo}>
        Aquí puedes ver los módulos en los que estás participando.
      </Text>

      <ScrollView contentContainerStyle={styles.contenedorTarjetas}>
        {proyectos.length > 0 ? (
          proyectos.map((proyecto) => {
            const imagen =
              imagenesProyectos[proyecto.nombre_proyecto] || Data;

            return (
              <TouchableOpacity
                key={proyecto.id}
                style={styles.tarjeta}
                 onPress={() => {
                  navigation.navigate("Tipos", { proyectoId: proyecto.id });
                }}
              >
                <Image source={imagen} style={styles.imagenTarjeta} />
                <Text style={styles.nombre}>{proyecto.nombre_proyecto}</Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={{ color: "white" }}>No tienes módulos asignados.</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.botonCerrar} onPress={CerrarSesion}>
        <Text style={styles.textoCerrar}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProyectosUsuario;

const styles = StyleSheet.create({
  cuerpo: {
    flex: 1,
    backgroundColor: "#e9e9e9ff",
    alignItems: "center",
    paddingTop: 40,
  },
  titulo: {
    color: "black",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitulo: {
    color: "#464646ff",
    fontSize: 14,
    marginBottom: 20,
  },
  contenedorTarjetas: {
    paddingBottom: 80,
    alignItems: "center",
  },
  tarjeta: {
    width: 250,
    backgroundColor: "#ffffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
    elevation: 6,
  },
  imagenTarjeta: {
    width: 180,
    height: 120,
    borderRadius: 10,
  },
  nombre: {
    color: "black",
    fontSize: 18,
    marginTop: 10,
    fontWeight: "600",
  },
  botonCerrar: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "#b91c1c",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  textoCerrar: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
