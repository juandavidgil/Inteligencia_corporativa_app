import { RouteProp } from "@react-navigation/native";
export type StackParamList = {

  InicioSesion: undefined;
  ProyectosUsuario: undefined;
  Dashboards: { id: number };
  Tableros: {
    proyectoId: number;
    dashboardId: number;
    nombreDashboard: string;

};

    
}

export type InicioSesionScreenNavigationProp = RouteProp<StackParamList, 'InicioSesion'>;
export type ProyectoUsuarioScreenNavigationProp = RouteProp<StackParamList, 'ProyectosUsuario'>;
export type DashboardsScreenNavigationProp = RouteProp<StackParamList, 'Dashboards'>;
export type TablerosScreenNavigationProp = RouteProp<StackParamList, 'Tableros'>;