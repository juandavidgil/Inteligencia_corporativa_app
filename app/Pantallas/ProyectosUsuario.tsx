import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
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

import ATM from "../../assets/img/atm.png";
import Cartagena from "../../assets/img/cartagena.png";
import Chia from "../../assets/img/chia.png";
import Data from "../../assets/img/datatools.jpg";
import MOVIDIC from "../../assets/img/movidic.png";
import Neiva from "../../assets/img/neiva.jpg";
import Silvania from "../../assets/img/silvania.jpg";
import VUS from "../../assets/img/vus.png";
import { URL } from "../config/URL";


interface Proyecto {
  id: number;
  nombre_proyecto: string;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width - 40, 300);


const TarjetaProyecto = ({
  proyecto,
  imagen,
  onPress,
}: {
  proyecto: Proyecto;
  imagen: any;
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
        <Image source={imagen} style={styles.imagenTarjeta} />
        <Text style={styles.nombre}>
          {proyecto.nombre_proyecto}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};


const ProyectosUsuario: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const scheme = useColorScheme();
  const dark = scheme === "dark";

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
      if (!usuario?.id) return;

      const cache = await AsyncStorage.getItem("proyectos_usuario");
      if (cache) {
        setProyectos(JSON.parse(cache));
        return;
      }

      const response = await fetch(`${URL}/proyectos_usuario/${usuario.id}/`);
      const data = await response.json();

      if (response.ok) {
        setProyectos(data);
        await AsyncStorage.setItem(
          "proyectos_usuario",
          JSON.stringify(data)
        );
      }
    } catch (error) {
      console.error("Error cargando proyectos:", error);
    } finally {
      setLoading(false);
    }
  };

  const CerrarSesion = async () => {
    await AsyncStorage.clear();
    navigation.navigate("InicioSesion");
  };

  useEffect(() => {
    cargarProyectos();
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.safe,
          {
            paddingTop: insets.top,
            backgroundColor: dark ? "#0d0f1aff" : "#f1f5f9",
          },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text
            style={[
              styles.loadingText,
              { color: dark ? "#cbd5f5" : "#334155" },
            ]}
          >
            Cargando tus módulos...
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
          backgroundColor: dark ? "#0d0f1aff" : "#f1f5f9",
        },
      ]}
    >
      <View style={styles.cuerpo}>
        <Text
          style={[
            styles.titulo,
            { color: dark ? "#f8fafc" : "#020617" },
          ]}
        >
          MÓDULOS
        </Text>

        <Text
          style={[
            styles.subtitulo,
            { color: dark ? "#94a3b8" : "#475569" },
          ]}
        >
          Aquí puedes ver los módulos en los que estás participando
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: insets.bottom + 100,
          }}
        >
          {proyectos.length > 0 ? (
            proyectos.map((proyecto) => {
              const imagen =
                imagenesProyectos[proyecto.nombre_proyecto] || Data;

              return (
                <TarjetaProyecto
                  key={proyecto.id}
                  proyecto={proyecto}
                  imagen={imagen}
                  onPress={() =>
                    navigation.navigate("Tipos", {
                      proyectoId: proyecto.id,
                    })
                  }
                />
              );
            })
          ) : (
            <Text
              style={[
                styles.vacio,
                { color: dark ? "#94a3b8" : "#64748b" },
              ]}
            >
              No tienes módulos asignados.
            </Text>
          )}
        </ScrollView>

        <View
          style={[
            styles.footerSafe,
            { paddingBottom: insets.bottom + 12 },
          ]}
        >
          <TouchableOpacity
            style={styles.botonCerrar}
            onPress={CerrarSesion}
          >
            <Text style={styles.textoCerrar}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProyectosUsuario;


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
    paddingHorizontal: 30,
    textAlign: "center",
  },

  tarjeta: {
    width: CARD_WIDTH,
    backgroundColor: "#ffffff",
    height: 200,
    borderRadius: 14,
    padding: 15,
    marginBottom: 22,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  imagenTarjeta: {
    width: "60%",
    height: 120,
    borderRadius: 10,
    resizeMode: "cover",
  },

  nombre: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#020617",
  },

  footerSafe: {
    paddingTop: 10,
  },

  botonCerrar: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 4,
  },

  textoCerrar: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 15,
    fontSize: 15,
  },

  vacio: {
    marginTop: 40,
    fontSize: 15,
  },
});
