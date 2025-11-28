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

// ICONOS / IMÁGENES
import agenda from "../../assets/img/agenda.png";
import aranda from "../../assets/img/aranda.png";
import financiero from "../../assets/img/financiero.png";
import indicadores from "../../assets/img/indicadores.png";
import operativo from "../../assets/img/operativo.png";

interface DashboardItem {
  id: number;
  nombre_dashboard: string;
  embed_url?: string;
}

interface RouteParams {
  id: number; // proyectoId
}

const DashBoard: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { id: proyectoId } = route.params as RouteParams;

  const [dashboards, setDashboards] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDashboards = async () => {
      if (!proyectoId) {
        setLoading(false);
        return;
      }

      const cacheKey = `dashboards_${proyectoId}`;
      const cache = await AsyncStorage.getItem(cacheKey);

      if (cache) {
        setDashboards(JSON.parse(cache));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${URL}/dashboards_con_embed/${proyectoId}/`);
        const data = await res.json();

        if (res.ok) {
          const dashboardsData = data.dashboards || [];
          setDashboards(dashboardsData);
          await AsyncStorage.setItem(cacheKey, JSON.stringify(dashboardsData));
        } else {
          console.error("Error obteniendo dashboards:", data);
        }
      } catch (err) {
        console.error("Error de conexión:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDashboards();
  }, [proyectoId]);

  // NAVEGAR AL TABLERO
  const irTablero = (dashboard: DashboardItem) => {
    navigation.navigate("Tableros", {
      proyectoId,
      dashboardId: dashboard.id,
      nombreDashboard: dashboard.nombre_dashboard,
    });
  };

  // SELECCIONAR ICONO
  const obtenerIcono = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes("financiero")) return financiero;
    if (n.includes("indicadores")) return indicadores;
    if (n.includes("operativo")) return operativo;
    if (n.includes("agenda")) return agenda;
    if (n.includes("aranda")) return aranda;
    return null;
  };

  if (loading) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.textoCarga}>Cargando dashboards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Dashboards del Módulo</Text>
      <Text style={styles.subtitulo}>
        Selecciona un dashboard para visualizarlo.
      </Text>

      <ScrollView contentContainerStyle={styles.listaTarjetas}>
        {dashboards.length > 0 ? (
          dashboards.map((dashboard) => (
            <TouchableOpacity
              key={dashboard.id}
              style={styles.tarjeta}
              onPress={() => irTablero(dashboard)}
            >
              <View style={styles.iconoContenedor}>
                {obtenerIcono(dashboard.nombre_dashboard) ? (
                  <Image
                    source={obtenerIcono(dashboard.nombre_dashboard)}
                    style={styles.icono}
                  />
                ) : (
                  <Text style={styles.iconoGenerico}>📊</Text>
                )}
              </View>
              <Text style={styles.nombre}>{dashboard.nombre_dashboard}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ color: "white", marginTop: 20 }}>
            No hay dashboards disponibles.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default DashBoard;

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#e9e9e9ff",
    paddingTop: 40,
    alignItems: "center",
  },
  cargando: {
    flex: 1,
    backgroundColor: "#ffffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  textoCarga: {
    color: "white",
    marginTop: 15,
    fontSize: 18,
  },
  titulo: {
    color: "black",
    fontSize: 26,
    fontWeight: "700",
  },
  subtitulo: {
    color: "#464646ff",
    fontSize: 14,
    marginBottom: 20,
  },
  listaTarjetas: {
    paddingBottom: 40,
    alignItems: "center",
  },
  tarjeta: {
    width: 260,
    backgroundColor: "#ffffffff",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
  },
  iconoContenedor: {
    marginBottom: 10,
  },
  icono: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  iconoGenerico: {
    fontSize: 60,
    color: "white",
  },
  nombre: {
    marginTop: 10,
    color: "black",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
