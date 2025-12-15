import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { URL } from "../config/URL";


import tipo_agenda from "../../assets/img/agenda.png";
import tipo_financiero from "../../assets/img/financiero.png";
import tipo_indicadores from "../../assets/img/indicadores.png";
import tipo_operativo from "../../assets/img/operativo.png";
import tipo_predictivo from "../../assets/img/predictivo.png";

interface RouteParams {
  proyectoId: number;
}

const TiposDashboard: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { proyectoId } = route.params as RouteParams;

  const [tipos, setTipos] = useState<string[]>([]);
  const [proyecto, setProyecto] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        console.log(proyectoId)
        const usuarioStr = await AsyncStorage.getItem("usuario");
        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
        const usuarioId = usuario?.id;

        if (!usuarioId || !proyectoId) {
          setLoading(false);
          return;
        }

  
        const cacheKey = `tipos_${proyectoId}`;
        const cacheTipos = await AsyncStorage.getItem(cacheKey);

        if (cacheTipos) {
          setTipos(JSON.parse(cacheTipos));
          setLoading(false);
        }

     
        if (!proyecto) {
          const resProy = await fetch(
            `${URL}/proyectos_usuario/${usuarioId}`
          );
          const proyectos = await resProy.json();

          const proy = proyectos.find(
            (p: any) => String(p.id) === String(proyectoId)
          );

          setProyecto(proy ? proy.nombre_proyecto : "Proyecto");
        }

      
        if (!cacheTipos) {
          const resTipos = await fetch(
            `${URL}/tipos_dashboards/${proyectoId}/?usuario_id=${usuarioId}`
          );

          const data = await resTipos.json();

          if (resTipos.ok) {
            setTipos(data.tipos || []);
            await AsyncStorage.setItem(
              cacheKey,
              JSON.stringify(data.tipos || [])
            );
          }
        }
      } catch (error) {
        console.error("Error cargando tipos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [proyectoId]);


  const abrirTipo = (tipo: string) => {
    navigation.navigate("Dashboards", {
      proyectoId,
      tipo,
    });
  };


  const obtenerIcono = (tipo: string) => {
    const t = tipo.toLowerCase();
    if (t.includes("financiero")) return tipo_financiero;
    if (t.includes("indicadores")) return tipo_indicadores;
    if (t.includes("operativo")) return tipo_operativo;
    if (t.includes("agenda")) return tipo_agenda;
    if (t.includes("predictivo")) return tipo_predictivo;
    return null;
  };

  if (loading) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.textoCarga}>Cargando tipos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>
        Tipos del Proyecto
        <Text style={styles.proyecto}> {proyecto}</Text>
      </Text>

      <Text style={styles.subtitulo}>
        Selecciona un tipo de dashboard.
      </Text>

      <ScrollView contentContainerStyle={styles.listaTarjetas}>
        {tipos.length > 0 ? (
          tipos.map((tipo) => (
            <TouchableOpacity
              key={tipo}
              style={styles.tarjeta}
              onPress={() => abrirTipo(tipo)}
            >
              {obtenerIcono(tipo) ? (
                <Image
                  source={obtenerIcono(tipo)!}
                  style={styles.icono}
                />
              ) : (
                <Text style={styles.iconoGenerico}>📊</Text>
              )}

              <Text style={styles.nombre}>{tipo}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ marginTop: 20 }}>
            No tienes tipos asignados en este proyecto.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default TiposDashboard;

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#e9e9e9ff",
    paddingTop: 40,
    alignItems: "center",
  },
  cargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textoCarga: {
    marginTop: 10,
    fontSize: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  proyecto: {
    color: "#6b7280",
  },
  subtitulo: {
    fontSize: 14,
    marginBottom: 20,
    color: "#4b5563",
  },
  listaTarjetas: {
    alignItems: "center",
    paddingBottom: 40,
  },
  tarjeta: {
    width: 260,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
  },
  icono: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  nombre: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
