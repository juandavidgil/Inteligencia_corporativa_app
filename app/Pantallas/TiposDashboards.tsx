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

import tipo_agenda from "../../assets/img/agenda.png";
import tipo_financiero from "../../assets/img/financiero.png";
import tipo_indicadores from "../../assets/img/indicadores.png";
import tipo_operativo from "../../assets/img/operativo.png";
import tipo_predictivo from "../../assets/img/predictivo.png";


interface RouteParams {
  proyectoId: number;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width - 40, 300);


const TarjetaTipo = ({
  tipo,
  icono,
  onPress,
}: {
  tipo: string;
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
        <Text style={styles.nombre}>{tipo}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};


const TiposDashboard: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const { proyectoId } = route.params as RouteParams;

  const [tipos, setTipos] = useState<string[]>([]);
  const [proyecto, setProyecto] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const usuarioStr = await AsyncStorage.getItem("usuario");
        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
        const usuarioId = usuario?.id;

        if (!usuarioId || !proyectoId) return;

        const cacheKey = `tipos_${proyectoId}`;
        const cacheTipos = await AsyncStorage.getItem(cacheKey);

        if (cacheTipos) {
          setTipos(JSON.parse(cacheTipos));
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
    navigation.navigate("Dashboards", { proyectoId, tipo });
  };

  const obtenerIcono = (tipo: string) => {
    const t = tipo.toLowerCase();
    if (t.includes("financiero")) return tipo_financiero;
    if (t.includes("indicadores")) return tipo_indicadores;
    if (t.includes("operativo")) return tipo_operativo;
    if (t.includes("agenda")) return tipo_agenda;
    if (t.includes("predictivo")) return tipo_predictivo;
    return tipo_indicadores;
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
            Cargando tipos...
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
          TIPOS DE DASHBOARD
        </Text>

        <Text
          style={[
            styles.subtitulo,
            { color: dark ? "#94a3b8" : "#475569" },
          ]}
        >
          Proyecto:{" "}
          <Text style={styles.proyecto}>{proyecto}</Text>
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: insets.bottom + 80,
          }}
        >
          {tipos.length > 0 ? (
            tipos.map((tipo) => (
              <TarjetaTipo
                key={tipo}
                tipo={tipo}
                icono={obtenerIcono(tipo)}
                onPress={() => abrirTipo(tipo)}
              />
            ))
          ) : (
            <Text style={{ color: dark ? "#94a3b8" : "#64748b", marginTop: 40 }}>
              No tienes tipos asignados en este proyecto.
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default TiposDashboard;


const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  cuerpo: {
    flex: 1,
    alignItems: "center",
  },

  titulo: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 10,
  },

  subtitulo: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
  },

  proyecto: {
    fontWeight: "700",
    color: "#2563eb",
  },

  tarjeta: {
    width: CARD_WIDTH,
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
    fontSize: 18,
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
