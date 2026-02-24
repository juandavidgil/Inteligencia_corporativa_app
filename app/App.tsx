import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
