import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
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

const ExploradorProyecto: React.FC = () => {

  const navigation = useNavigation<any>();
  const route = useRoute();
  const { proyectoId } = route.params as RouteParams;

  const [estructura, setEstructura] = useState<EstructuraProyecto | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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

        const data: EstructuraProyecto = await res.json();

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
      carpetaId: c.id,
      nombreCarpeta: c.nombre
    });
  };

  if (loading) {
    return (
      <View>
        <Text>Cargando proyecto...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  if (!estructura) return null;

  return (
    <View>
      <Text>{estructura.nombre_proyecto}</Text>

      {estructura.carpetas.map((c) => (
        <Pressable key={c.id} onPress={() => irCarpeta(c)}>
          <Text>{c.nombre}</Text>
        </Pressable>
      ))}
    </View>
  );
};

export default ExploradorProyecto;
