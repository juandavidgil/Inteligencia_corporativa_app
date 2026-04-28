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

interface RouteParams {
  proyectoId: number;
  nombreCarpeta?: string;
  carpetaId: number;
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
  imagen_url: string;
}

interface Contenido {
  carpetas: CarpetaItem[];
  dashboards: DashboardItem[];
}

const Carpeta: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const CARD_WIDTH = isLandscape
    ? (width - 60) / 2
    : Math.min(width - 40, 350);

  const { carpetaId, proyectoId, nombreCarpeta } =
    route.params as RouteParams;

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
          `${URL}/contenido_carpeta/${carpetaId}/${usuario.id}`
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
  }, [carpetaId, usuario?.id]);


  const irTablero = (dashboard: DashboardItem) => {
    navigation.navigate("Tableros", {
      proyectoId,
      dashboardId: dashboard.id,
      nombreDashboard: dashboard.nombre_dashboard,
    });
  };

  const irCarpeta = (c: CarpetaItem) => {
    navigation.push("Carpeta", {
      proyectoId,
      nombreCarpeta: c.nombre,
      carpetaId: c.id,
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

  const noHayCarpetas = contenido?.carpetas?.length === 0;
  const noHayDashboards = contenido?.dashboards?.length === 0;
  const noHayNada = noHayCarpetas && noHayDashboards;

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
    <Text style={[styles.textoVolver, { color: dark ? "#e2e8f0" : "#0f172a" }]}>
      ←
    </Text>
  </TouchableOpacity>

  <Text
    style={[
      styles.titulo,
      { color: dark ? "#e5e7eb" : "#0f172a" },
    ]}
    numberOfLines={2}         // ← permite hasta 2 líneas
    adjustsFontSizeToFit      // ← achica la fuente si no cabe
    minimumFontScale={0.7}    // ← no baja del 70% del tamaño original
  >
    {nombreCarpeta || "Contenido"}
  </Text>
</View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: isLandscape ? "row" : "column",
            flexWrap: "wrap",
            justifyContent: "center",
            paddingBottom: insets.bottom + 80,
          }}
        >
          {/* MENSAJE GENERAL */}
          {noHayNada && (
            <Text style={styles.emptyText}>
              No hay contenido disponible.
            </Text>
          )}

          {/* CARPETAS */}
          {contenido?.carpetas.map((c) => (
            <TarjetaSimple
              key={c.id}
              texto={c.nombre}
              dark={dark}
              width={CARD_WIDTH}
              onPress={() => irCarpeta(c)}
            />
          ))}



          {/* DASHBOARDS */}

{contenido?.dashboards.map((dashboard) => (
    <TarjetaDashboard
        key={dashboard.id}
        nombre={dashboard.nombre_dashboard}
        icono={dashboard.imagen_url ?? null}  l
        dark={dark}
        width={CARD_WIDTH}
        onPress={() => irTablero(dashboard)}
    />
))}


        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Carpeta;

/* COMPONENTES Y ESTILOS IGUALES A LOS TUYOS */

const TarjetaSimple = ({ texto, onPress, dark, width }: any) => {
  const scale = useState(new Animated.Value(1))[0];

  return (
    <Animated.View style={{ transform: [{ scale }], margin: 10 }}>
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
          { backgroundColor: dark ? "#0f172a" : "#ffffff", width },
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


const TarjetaDashboard = ({ nombre, icono, onPress, dark, width }: any) => {
    const scaleAnim = useState(new Animated.Value(1))[0];

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], margin: 10 }}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={() =>
                    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start()
                }
                onPressOut={() =>
                    Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start()
                }
                onPress={onPress}
                style={[
                    styles.tarjetaTipoDashboard,
                    { backgroundColor: dark ? "#0f172a" : "#ffffff", width },
                ]}
            >
                <Image
                    source={
                        typeof icono === 'string' && icono.length > 0
                            ? { uri: icono }    
                            : predeterminado      
                    }
                    style={styles.iconoGrande}
                    defaultSource={predeterminado} 
                />
                <Text style={[styles.nombreGrande, { color: dark ? "#e2e8f0" : "#0f172a" }]}>
                    {nombre}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  cuerpo: { flex: 1, alignItems: "center" },
encabezado: {
  width: "100%",
  minHeight: 50,        // ← minHeight en vez de height fijo para permitir 2 líneas
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 10,
  paddingHorizontal: 70, // ← espacio a ambos lados para no tapar la flecha (botón ocupa ~60px)
},
titulo: {
  fontSize: 24,
  fontWeight: "800",
  marginTop: 10,
  textAlign: "center",  // ← centra el texto dentro del espacio disponible
},
  botonVolver: {
    position: "absolute",
    left: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  textoVolver: {
    fontSize: 14,
    fontWeight: "600",
  },

  tarjetaSimple: {
    height: 110,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  tarjetaTipoDashboard: {
    height: 180,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
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
    width: "100%",
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
    color: "#64748b",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});