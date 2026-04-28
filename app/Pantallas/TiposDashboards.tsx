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
import { URL } from "../config/URL";


interface RouteParams {
  proyectoId: number;
}

interface Tipo {
  id: number;
  nombre: string;
  tipo_url: string;
}

const TarjetaTipo = ({
  tipo,
  onPress,
  cardWidth,
}: {
  tipo : Tipo;
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
        style={[
          styles.tarjeta,
          { width: cardWidth, marginHorizontal: 8 },
        ]}
      >
        <Image
          source={ {uri: tipo.tipo_url} }
          style={styles.icono} 
        />
         
         
        <Text style={styles.nombre}>{tipo.nombre}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const TiposDashboard: React.FC = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const { proyectoId } = route.params as RouteParams;

  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [proyecto, setProyecto] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);


  const HORIZONTAL_PADDING = 40;
  const MIN_CARD_WIDTH = 260;

  const availableWidth = width - HORIZONTAL_PADDING;
  const columnas = Math.max(1, Math.floor(availableWidth / MIN_CARD_WIDTH));
  const CARD_WIDTH = availableWidth / columnas - 16;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const usuarioStr = await AsyncStorage.getItem("usuario");
        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
        const usuarioId = usuario?.id;

        if (!usuarioId || !proyectoId) return;

        const cacheKey = `tipos_${proyectoId}`;

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

      } catch (error) {
        console.error("Error cargando tipos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [proyectoId]);

const abrirTipo = (tipoId: number) => {
  navigation.navigate("Dashboards", { proyectoId, tipo: tipoId });
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
            Tipos de dashboards
          </Text>
        </View>

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
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            paddingBottom: insets.bottom + 80,
          }}
        >
          {tipos.length > 0 ? (
            tipos.map((tipo) => (
              <TarjetaTipo
                key={tipo.id}
                tipo={tipo}
                
                onPress={() => abrirTipo(tipo.id)}
                cardWidth={CARD_WIDTH}
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
  safe: { flex: 1 },
  cuerpo: { flex: 1, alignItems: "center" },
  encabezado: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  textoVolver: { fontSize: 14, fontWeight: "600" },
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
  },
  proyecto: {
    fontWeight: "700",
    color: "#2563eb",
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