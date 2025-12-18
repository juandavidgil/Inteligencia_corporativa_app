import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { URL } from "../config/URL";


import agenda from "../../assets/img/agenda.png";
import aranda from "../../assets/img/aranda.png";
import conciliacion from "../../assets/img/consignacion.png";
import consulta from "../../assets/img/consulta.png";
import financiero from "../../assets/img/financiero.png";
import indicadores from "../../assets/img/indicadores.png";
import multa from "../../assets/img/multa.png";
import operativo from "../../assets/img/operativo.png";
import predictivo from "../../assets/img/predictivo.png";
import recaudo from "../../assets/img/recaudo.png";


interface DashboardItem {
  id: number;
  nombre_dashboard: string;
  embed_url?: string;
}

interface RouteParams {
  proyectoId: number;
  tipo: string;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width - 40, 300);


const TarjetaDashboard = ({
  dashboard,
  icono,
  onPress,
}: {
  dashboard: DashboardItem;
  icono: any;
  onPress: () => void;
}) => {
  const scaleAnim = useState(new Animated.Value(1))[0];

  const pressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        style={styles.tarjeta}
      >
        <Image source={icono} style={styles.icono} />
        <Text style={styles.nombre}>
          {dashboard.nombre_dashboard}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};


const DashBoard: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const { proyectoId, tipo } = route.params as RouteParams;

  const [dashboards, setDashboards] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDashboards = async () => {
      try {
        const usuarioStr = await AsyncStorage.getItem("usuario");
        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
        if (!usuario || !proyectoId) return;

        const cacheKey = `dashboards_${proyectoId}_${tipo}`;
        const cache = await AsyncStorage.getItem(cacheKey);

        if (cache) {
          setDashboards(JSON.parse(cache));
          return;
        }

        const res = await fetch(
          `${URL}/dashboards_con_embed/${proyectoId}/?usuario_id=${usuario.id}&tipo=${tipo}`
        );
        const data = await res.json();

        if (res.ok) {
          const dashboardsData = data.dashboards || [];
          setDashboards(dashboardsData);
          await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify(dashboardsData)
          );
        }
      } catch (error) {
        console.error("Error cargando dashboards:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDashboards();
  }, [proyectoId, tipo]);

  const irTablero = (dashboard: DashboardItem) => {
    navigation.navigate("Tableros", {
      proyectoId,
      dashboardId: dashboard.id,
      nombreDashboard: dashboard.nombre_dashboard,
      tipoSeleccionado: tipo,
    });
  };

  const obtenerIcono = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes("financiero")) return financiero;
    if (n.includes("indicadores")) return indicadores;
    if (n.includes("operativo")) return operativo;
    if (n.includes("agenda")) return agenda;
    if (n.includes("aranda")) return aranda;
    if (n.includes("multa")) return multa;
    if (n.includes("conciliación")) return conciliacion;
    if (n.includes("recaudo")) return recaudo;
    if (n.includes("consulta")) return consulta;
    if (n.includes("predictivo")) return predictivo;
    return indicadores;
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.safe,
          {
            paddingTop: insets.top,
            backgroundColor: dark ? "#020617" : "#f1f5f9",
          },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ color: dark ? "#94a3b8" : "#334155" }}>
            Cargando dashboards...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          paddingTop: insets.top,
          backgroundColor: dark ? "#020617" : "#f1f5f9",
        },
      ]}
    >
      <View style={styles.cuerpo}>
        <Text
          style={[
            styles.titulo,
            { color: dark ? "#e5e7eb" : "#0f172a" },
          ]}
        >
          DASHBOARDS
        </Text>

        <Text
          style={[
            styles.subtitulo,
            { color: dark ? "#94a3b8" : "#475569" },
          ]}
        >
          Selecciona un dashboard para visualizarlo
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: insets.bottom + 80,
          }}
        >
          {dashboards.length > 0 ? (
            dashboards.map((dashboard) => (
              <TarjetaDashboard
                key={dashboard.id}
                dashboard={dashboard}
                icono={obtenerIcono(dashboard.nombre_dashboard)}
                onPress={() => irTablero(dashboard)}
              />
            ))
          ) : (
            <Text style={{ color: dark ? "#94a3b8" : "#64748b", marginTop: 40 }}>
              No hay dashboards disponibles para este tipo.
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default DashBoard;


const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  cuerpo: {
    flex: 1,
    alignItems: "center",
  },

  titulo: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 10,
  },

  subtitulo: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 30,
  },

  tarjeta: {
    width: CARD_WIDTH,
    height: 200,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  icono: {
    width: 80,
    height: 80,
    resizeMode: "contain", 
  },

  nombre: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a", 
    textAlign: "center",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
