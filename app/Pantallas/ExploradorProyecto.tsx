import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
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

interface RouteParams {
  proyectoId: number;
}

interface Carpeta {
  id: number;
  nombre: string;
}

interface EstructuraProyecto {
  nombre_proyecto: string;
  carpetas: Carpeta[];
}

interface Usuario {
  id: number;
  nombre: string;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width - 40, 300);

const TarjetaCarpeta = ({
  carpeta,
  onPress,
  dark,
}: {
  carpeta: Carpeta;
  onPress: () => void;
  dark: boolean;
}) => {
  const scaleAnim = useState(new Animated.Value(1))[0];

  const pressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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
          {
            backgroundColor: dark ? "#0f172a" : "#ffffff",
          },
        ]}
      >
        <Text
          style={[
            styles.nombre,
            { color: dark ? "#e2e8f0" : "#0f172a" },
          ]}
        >
          {carpeta.nombre}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ExploradorProyecto: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const { proyectoId } = route.params as RouteParams;

  const [estructura, setEstructura] =
    useState<EstructuraProyecto | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!usuario?.id) return;

    const cargarProyecto = async () => {
      try {
        const res = await fetch(
          `${URL}/estructura_proyecto/${proyectoId}/${usuario.id}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error("Error cargando proyecto");
        }

        setEstructura(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarProyecto();
  }, [proyectoId, usuario]);

  const irCarpeta = (c: Carpeta) => {
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
          <Text
            style={{
              marginTop: 15,
              color: dark ? "#94a3b8" : "#334155",
            }}
          >
            Cargando proyecto...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
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
          <Text style={{ color: "red" }}>
            Error: {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!estructura) return null;

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
          Carpetas del proyecto
        </Text>


        <Text
          style={[
            styles.subtitulo,
            { color: dark ? "#94a3b8" : "#475569" },
          ]}
        >
          Proyecto:{" "}
          <Text style={styles.proyecto}>
            {estructura.nombre_proyecto}
          </Text>
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: insets.bottom + 80,
          }}
        >
          {estructura.carpetas.length > 0 ? (
            estructura.carpetas.map((c) => (
              <TarjetaCarpeta
                key={c.id}
                carpeta={c}
                dark={dark}
                onPress={() => irCarpeta(c)}
              />
            ))
          ) : (
            <Text
              style={{
                color: dark ? "#94a3b8" : "#64748b",
                marginTop: 40,
              }}
            >
              No hay carpetas disponibles.
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ExploradorProyecto;

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
    height: 130,
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

  nombre: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});