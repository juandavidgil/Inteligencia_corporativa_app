import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

type RootStackParamList = {
  Tableros: {
    proyectoId: number;
    dashboardId: number;
    nombreDashboard?: string;
  };
};

type TablerosRouteProp = RouteProp<RootStackParamList, "Tableros">;

export default function Tableros() {
  const route = useRoute<TablerosRouteProp>();
  const { proyectoId, dashboardId, nombreDashboard } = route.params;

  const [currentDashboard, setCurrentDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const usuarioString = await AsyncStorage.getItem("usuario");
        const usuario = usuarioString ? JSON.parse(usuarioString) : null;

        if (!usuario?.id) {
          setError("No se encontró información del usuario.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://TU_BACKEND/dashboards_con_embed/${proyectoId}/?usuario_id=${usuario.id}`
        );

        const data = await response.json();

        if (response.ok && data.dashboards?.length > 0) {
          const dashboardEncontrado = data.dashboards.find(
            (d: any) => d.id === dashboardId
          );
          if (dashboardEncontrado) {
            setCurrentDashboard(dashboardEncontrado);
          } else {
            setError("No se encontró el dashboard solicitado.");
          }
        } else {
          setError("No se encontraron dashboards activos.");
        }
      } catch (err) {
        console.error("Error al cargar dashboard:", err);
        setError("Error de conexión al backend.");
      } finally {
        setLoading(false);
      }
    };

    if (proyectoId && dashboardId) fetchDashboard();
  }, [proyectoId, dashboardId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {nombreDashboard || currentDashboard?.nombre_dashboard || "Dashboard"}
      </Text>

      {loading && <ActivityIndicator size="large" color="#007AFF" />}
      {error && <Text style={styles.error}>{error}</Text>}

      {currentDashboard?.embed_url && (
        <WebView
          source={{ uri: currentDashboard.embed_url }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  error: {
    color: "red",
    fontSize: 16,
    marginVertical: 10,
  },
  webview: {
    height: Dimensions.get("window").height - 150,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
  },
});
