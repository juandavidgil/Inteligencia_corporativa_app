import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashBoard from './Pantallas/DashBoards';
import InicioSesion from "./Pantallas/InicioSesion";
import ProyectosUsuario from "./Pantallas/ProyectosUsuario";
import Tableros from './Pantallas/Tableros';
import { StackParamList } from './types/types';


function App() {
const Stack = createNativeStackNavigator<StackParamList>();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="InicioSesion" component={InicioSesion} />
        <Stack.Screen name="ProyectosUsuario" component={ProyectosUsuario} />
        <Stack.Screen name="Dashboards" component={DashBoard} />
        <Stack.Screen name="Tableros" component={Tableros} />
    </Stack.Navigator>

  );

}

export default App;