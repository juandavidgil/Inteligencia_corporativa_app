import { RouteProp } from "@react-navigation/native";
export type StackParamList = {

  InicioSesion: undefined;
  VerificarCorreo: undefined
  CambiarContrasena: {usuarioId : number}
  ProyectosUsuario: undefined;
  Tipos: {id: number};
  Dashboards: { id: number };
  Tableros: {
    proyectoId: number;
    dashboardId: number;
    nombreDashboard: string;

};
  Explorador: { proyectoId: number };
  Carpetas: { proyectoId: number };

    
}

export type InicioSesionScreenNavigationProp = RouteProp<StackParamList, 'InicioSesion'>;
export type VerificarCorreoScreenNavigationProp = RouteProp<StackParamList, 'VerificarCorreo'>;
export type CambiarContrasenaScreenNavigationProp = RouteProp<StackParamList, 'CambiarContrasena'>;
export type ProyectoUsuarioScreenNavigationProp = RouteProp<StackParamList, 'ProyectosUsuario'>;
export type TiposDashboardScreenNavigationProp = RouteProp<StackParamList, 'Tipos'>;
export type DashboardsScreenNavigationProp = RouteProp<StackParamList, 'Dashboards'>;
export type TablerosScreenNavigationProp = RouteProp<StackParamList, 'Tableros'>;
export type ExploradorScreenNavigationProp = RouteProp<StackParamList, 'Explorador'>;
export type CarpetasScreenNavigationProp = RouteProp<StackParamList, 'Carpetas'>;