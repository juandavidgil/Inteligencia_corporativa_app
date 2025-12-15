import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { URL } from "../config/URL";

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
          `${URL}/dashboards_con_embed/${proyectoId}/?usuario_id=${usuario.id}`
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
  originWhitelist={['*']}
  javaScriptEnabled
  domStorageEnabled
  style={{ flex: 1 }}
  source={{
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/powerbi-client/dist/powerbi.min.js"></script>
        <style>
          html, body, #reportContainer {
            width: 100%;
            height: 100vh;
            margin: 0;
            padding: 0;
            background-color: transparent;
          }
        </style>
      </head>
      <body>
        <div id="reportContainer"></div>
       <script>
  const models = window['powerbi-client'].models;

  const embedConfig = {
    type: "report",
    tokenType: models.TokenType.Embed,
    accessToken: "${currentDashboard?.embed_token}",
    embedUrl: "${currentDashboard?.embed_url}",
    permissions: models.Permissions.All,
    settings: {
      layoutType: models.LayoutType.MobilePortrait,
      panes: {
        filters: { visible: false },
        pageNavigation: { visible: false }
      },
      background: models.BackgroundType.Transparent
    }
  };

  const reportContainer = document.getElementById("reportContainer");
  const powerbi = new window['powerbi-client'].service.Service(
    window['powerbi-client'].factories.hpmFactory,
    window['powerbi-client'].factories.wpmpFactory,
    window['powerbi-client'].factories.routerFactory
  );

  powerbi.embed(reportContainer, embedConfig);
</script>

      </body>
      </html>
    `
  }}
/>




      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9e9e9ff",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
    marginTop: '5%',
    marginBottom: '5%',
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
