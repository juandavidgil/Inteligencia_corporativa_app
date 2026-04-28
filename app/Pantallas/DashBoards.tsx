import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import predeterminado from "../../assets/img/predeterminado.png";
import { URL } from "../config/URL";



interface DashboardItem {
  id: number;
  nombre_dashboard: string;
  embed_url?: string;
  imagen_url: string;
}

interface RouteParams {
  proyectoId: number;
  tipo: string;
}

const TarjetaDashboard = ({
  dashboard,
  icono,
  onPress,
  cardWidth,
}: {
  dashboard: DashboardItem;
  icono: any;
  onPress: () => void;
  cardWidth: number;
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
        style={[styles.tarjeta, { width: cardWidth, marginHorizontal:8 }]}
      >
        <Image 
          source={
            typeof dashboard.imagen_url === 'string' && dashboard.imagen_url.length > 0 
            ? { uri : dashboard.imagen_url}
            : predeterminado
          }
          style={styles.icono} 
          
        />
          
        <Text style={styles.nombre}>
          {dashboard.nombre_dashboard}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};


const DashBoard: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const esLandscape = width > height;

  const CARD_WIDTH = esLandscape
    ? Math.min(width / 2 - 40, 350)
    : Math.min(width - 40, 300);

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

      // Muestra caché inmediatamente mientras carga
      if (cache) {
        setDashboards(JSON.parse(cache));
        setLoading(false); // ← quita el spinner rápido si hay caché
      }

      // Siempre consulta el servidor para tener datos frescos
      const res = await fetch(
        `${URL}/dashboards_con_embed/${proyectoId}/?usuario_id=${usuario.id}&tipo=${tipo}`
      );
      const data = await res.json();

      if (res.ok) {
        const dashboardsData = data.dashboards || [];
        setDashboards(dashboardsData);  // ← sobreescribe con datos nuevos
        await AsyncStorage.setItem(cacheKey, JSON.stringify(dashboardsData));
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

          <Text
            style={[
              styles.titulo,
              { color: dark ? "#e5e7eb" : "#0f172a" },
            ]}
          >
            Dashboards
          </Text>
        </View>

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
            flexDirection: esLandscape ? "row" : "column",
            flexWrap: esLandscape ? "wrap" : "nowrap",
            justifyContent: esLandscape ? "center" : "flex-start",
          }}
        >
          {dashboards.length > 0 ? (
            dashboards.map((dashboard) => (
              <TarjetaDashboard
                key={dashboard.id}
                dashboard={dashboard}
                icono={dashboard.imagen_url || predeterminado}
                cardWidth={CARD_WIDTH}
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

  encabezado: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  textoVolver: {
    fontSize: 14,
    fontWeight: "600",
  },

  botonVolver: {
    position: "absolute",
    left: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 10,
  },

  subtitulo: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 30,
  },

  tarjeta: {
    height: 180,
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