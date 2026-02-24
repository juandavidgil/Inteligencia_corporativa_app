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

import agenda from "../../assets/img/agenda.png";
import aranda from "../../assets/img/aranda.png";
import conciliacion from "../../assets/img/consignacion.png";
import consulta from "../../assets/img/consulta.png";
import financiero from "../../assets/img/financiero.png";
import indicadores from "../../assets/img/indicadores.png";
import multa from "../../assets/img/multa.png";
import operativo from "../../assets/img/operativo.png";
import predeterminado from "../../assets/img/predeterminado.png";
import predictivo from "../../assets/img/predictivo.png";
import recaudo from "../../assets/img/recaudo.png";


import { URL } from "../config/URL";

interface RouteParams {
  proyectoId: number;
  nombreCarpeta?: string;
}

interface Usuario {
  id: number;
  nombre: string;
}

interface CarpetaItem {
  id: number;
  nombre: string;
}

interface DashboardItem {
  id: number;
  nombre_dashboard: string;
}

interface Contenido {
  carpetas: CarpetaItem[];
  dashboards: DashboardItem[];
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width - 40, 300); // Igual que TiposDashboard

const Carpeta: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const { proyectoId, nombreCarpeta } = route.params as RouteParams;

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [contenido, setContenido] = useState<Contenido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      const usuarioString = await AsyncStorage.getItem("usuario");
      const usuarioParsed: Usuario | null = usuarioString
        ? JSON.parse(usuarioString)
        : null;
      setUsuario(usuarioParsed);
    };
    cargarUsuario();
  }, []);

  useEffect(() => {
    const cargarContenido = async () => {
      if (!usuario?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${URL}/contenido_carpeta/${proyectoId}/${usuario.id}`
        );
        const data = await response.json();

        if (response.ok) {
          setContenido(data);
        }
      } catch (error) {
        console.error("Error cargando contenido:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarContenido();
  }, [proyectoId, usuario?.id]);

  const obtenerIcono = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes("financiero")) return financiero;
    if (n.includes("indicadores")) return indicadores;
    if (n.includes("operativo")) return operativo;
    if (n.includes("agenda")) return agenda;
    if (n.includes("aranda")) return aranda;
    if (n.includes("multa")) return multa;
    if (n.includes("conciliación cartera")) return conciliacion;
    if (n.includes("recaudo")) return recaudo;
    if (n.includes("consulta")) return consulta;
    if (n.includes("predictivo")) return predictivo;
    return predeterminado;
  };

  const irTablero = (dashboard: DashboardItem) => {
    navigation.navigate("Tableros", {
      proyectoId,
      dashboardId: dashboard.id,
      nombreDashboard: dashboard.nombre_dashboard,
    });
  };

  const irCarpeta = (c: CarpetaItem) => {
    navigation.navigate("Carpeta", {
      proyectoId: c.id,
      nombreCarpeta: c.nombre,
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
          <Text style={{ marginTop: 15, color: dark ? "#94a3b8" : "#334155" }}>
            Cargando contenido...
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
          {nombreCarpeta || "Contenido"}
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: insets.bottom + 80,
          }}
        >
          {/* CARPETAS */}
          <Text
            style={[
              styles.seccionTitulo,
              { color: dark ? "#94a3b8" : "#475569" },
            ]}
          >
            Más contenidos
          </Text>

          {contenido?.carpetas.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay contenido disponible.
            </Text>
          ) : (
            contenido?.carpetas.map((c) => (
              <TarjetaSimple
                key={c.id}
                texto={c.nombre}
                dark={dark}
                onPress={() => irCarpeta(c)}
              />
            ))
          )}

          {/* DASHBOARDS */}
          <Text
            style={[
              styles.seccionTitulo,
              { color: dark ? "#94a3b8" : "#475569" },
            ]}
          >
            Dashboards
          </Text>

          {contenido?.dashboards.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay dashboards disponibles.
            </Text>
          ) : (
            contenido?.dashboards.map((dashboard) => (
              <TarjetaDashboard
                key={dashboard.id}
                nombre={dashboard.nombre_dashboard}
                icono={obtenerIcono(dashboard.nombre_dashboard)}
                dark={dark}
                onPress={() => irTablero(dashboard)}
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Carpeta;

/* COMPONENTES */

const TarjetaSimple = ({
  texto,
  onPress,
  dark,
}: {
  texto: string;
  onPress: () => void;
  dark: boolean;
}) => {
  const scale = useState(new Animated.Value(1))[0];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          }).start()
        }
        onPress={onPress}
        style={[
          styles.tarjetaSimple,
          { backgroundColor: dark ? "#0f172a" : "#ffffff" },
        ]}
      >
        <Text
          style={[
            styles.nombreSimple,
            { color: dark ? "#e2e8f0" : "#0f172a" },
          ]}
        >
          {texto}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const TarjetaDashboard = ({
  nombre,
  icono,
  onPress,
  dark,
}: any) => {
  const scaleAnim = useState(new Animated.Value(1))[0];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() =>
          Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          }).start()
        }
        onPress={onPress}
        style={[
          styles.tarjetaTipoDashboard,
          { backgroundColor: dark ? "#0f172a" : "#ffffff" },
        ]}
      >
        <Image source={icono} style={styles.iconoGrande} />
        <Text
          style={[
            styles.nombreGrande,
            { color: dark ? "#e2e8f0" : "#0f172a" },
          ]}
        >
          {nombre}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ESTILOS */

const styles = StyleSheet.create({
  safe: { flex: 1 },

  cuerpo: { flex: 1, alignItems: "center" },

  titulo: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 10,
  },

  seccionTitulo: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },

  tarjetaSimple: {
    width: CARD_WIDTH,
    height: 110,
    borderRadius: 14,
    padding: 20,
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  tarjetaTipoDashboard: {
    width: CARD_WIDTH,
    height: 180,
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

  iconoGrande: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },

  nombreSimple: {
    fontSize: 17,
    fontWeight: "700",
  },

  nombreGrande: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  emptyText: {
    marginBottom: 10,
    fontSize: 14,
    color: "#64748b",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});