import { RouteProp } from "@react-navigation/native";
export type StackParamList = {

  InicioSesion: undefined;
  ProyectosUsuario: undefined;
  Tipos: {id: number};
  Dashboards: { id: number };
  Tableros: {
    proyectoId: number;
    dashboardId: number;
    nombreDashboard: string;

};

    
}

export type InicioSesionScreenNavigationProp = RouteProp<StackParamList, 'InicioSesion'>;
export type ProyectoUsuarioScreenNavigationProp = RouteProp<StackParamList, 'ProyectosUsuario'>;
export type TiposDashboardScreenNavigationProp = RouteProp<StackParamList, 'Tipos'>;
export type DashboardsScreenNavigationProp = RouteProp<StackParamList, 'Dashboards'>;
export type TablerosScreenNavigationProp = RouteProp<StackParamList, 'Tableros'>;