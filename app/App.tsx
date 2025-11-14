import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InicioSesion from "./Pantallas/InicioSesion";
import ProyectosUsuario from "./Pantallas/ProyectosUsuario";
import { StackParamList } from './types/types';


function App() {
const Stack = createNativeStackNavigator<StackParamList>();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="InicioSesion" component={InicioSesion} />
        <Stack.Screen name="ProyectosUsuario" component={ProyectosUsuario} />
    
    </Stack.Navigator>

  );

}

export default App;