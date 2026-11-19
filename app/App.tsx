import messaging from '@react-native-firebase/messaging';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import CambiarContrasena from "./Pantallas/CambiarContrasena";
import Carpetas from './Pantallas/Carpetas';
import DashBoard from './Pantallas/DashBoards';
import ExploradorProyecto from './Pantallas/ExploradorProyecto';
import InicioSesion from "./Pantallas/InicioSesion";
import ProyectosUsuario from "./Pantallas/ProyectosUsuario";
import Tableros from './Pantallas/Tableros';
import TiposDashboards from "./Pantallas/TiposDashboards";
import VerificarCorreo from "./Pantallas/VerificarCorreo";
import { StackParamList } from './types/types';


const Stack = createNativeStackNavigator<StackParamList>();

export default function App() {

useEffect(() => {
  const init = async () => {
    try {

      // Android 13+
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        console.log('POST_NOTIFICATIONS:', result);
      }

      console.log('Registrando dispositivo...');

      await messaging().registerDeviceForRemoteMessages();

      console.log('Dispositivo registrado');

      const authStatus = await messaging().requestPermission();

      console.log('AUTH STATUS:', authStatus);

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {

        const token = await messaging().getToken();

        console.log('FCM TOKEN:', token);

      }

    } catch (error) {

      console.log('Error obteniendo token FCM:', error);

    }
  };

  init();
}, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="InicioSesion" component={InicioSesion} />
        <Stack.Screen name="VerificarCorreo" component={VerificarCorreo} />
        <Stack.Screen name="CambiarContrasena" component={CambiarContrasena} />
        <Stack.Screen name="ProyectosUsuario" component={ProyectosUsuario} />
        <Stack.Screen name="Tipos" component={TiposDashboards} />
        <Stack.Screen name="Dashboards" component={DashBoard} />
        <Stack.Screen name="Tableros" component={Tableros} />
        <Stack.Screen name="Explorador" component={ExploradorProyecto} />
        <Stack.Screen name="Carpeta" component={Carpetas} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}