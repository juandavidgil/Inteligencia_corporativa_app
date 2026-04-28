import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

const Tableros: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const dark = scheme === "dark";
  const navigation = useNavigation()
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

    if (proyectoId && dashboardId) {
      fetchDashboard();
    }
  }, [proyectoId, dashboardId]);

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: dark ? "#020617" : "#f1f5f9",
        },
      ]}
    >
      <View style={styles.container}>
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
              { color: dark ? "#f8fafc" : "#0f172a" },
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {nombreDashboard ||
              currentDashboard?.nombre_dashboard ||
              "Dashboard"}
          </Text>

        </View>


        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#60a5fa" />
            <Text
              style={[
                styles.loadingText,
                { color: dark ? "#cbd5f5" : "#334155" },
              ]}
            >
              Cargando dashboard...
            </Text>
          </View>
        )}

        {error !== "" && !loading && (
          <View style={styles.center}>
            <Text style={styles.error}>{error}</Text>
          </View>
        )}

        {!loading && currentDashboard?.embed_url && (
          <View
            style={[
              styles.webviewContainer,
              {
                backgroundColor: "#ffffff",
                shadowColor: dark ? "#000" : "#475569",
              },
            ]}
          >
            <WebView
              originWhitelist={["*"]}
              javaScriptEnabled
              domStorageEnabled
              style={styles.webview}
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
      height: 100%;
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
      accessToken: "${currentDashboard.embed_token}",
      embedUrl: "${currentDashboard.embed_url}",
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
                `,
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Tableros;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  encabezado: {
    width: "100%",
    minHeight: 50,        
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 70, 
  },
  titulo: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",  
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



  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },

  error: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  webviewContainer: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 1,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
