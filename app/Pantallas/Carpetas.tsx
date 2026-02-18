/* import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";

import style from "../css/Carpeta.module.css";

import agenda from "../../../assets/agenda.png";
import aranda from "../../../assets/aranda.png";
import conciliacion from "../../../assets/consignacion.png";
import consulta from "../../../assets/consulta.png";
import financiero from "../../../assets/financiero.png";
import indicadores from "../../../assets/indicadores.png";
import multa from "../../../assets/multa.png";
import operativo from "../../../assets/operativo.png";
import predictivo from "../../../assets/predictivo.png";
import recaudo from "../../../assets/recaudo.png";

import { URL } from "../config/URL";

interface RouteParams {
  proyectoId: number;
}

const Carpeta: React.FC  = () => {



const navigation = useNavigation<any>();

  const [contenido, setContenido] = useState(null);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const { nombreCarpeta } = route.params as RouteParams;
    const usuario = async () => {
    await AsyncStorage.getItem("usuario");
  }


  const obtenerIcono = (nombre) => {
    const n = nombre.toLowerCase();

    if (n.includes("financiero")) return <img className={style.icono} src={financiero} alt="Financiero" />;
    if (n.includes("indicadores")) return <img className={style.icono} src={indicadores} alt="Indicadores" />;
    if (n.includes("operativo")) return <img className={style.icono} src={operativo} alt="Operativo" />;
    if (n.includes("agenda")) return <img className={style.icono} src={agenda} alt="Agenda" />;
    if (n.includes("aranda")) return <img className={style.icono} src={aranda} alt="Aranda" />;
    if (n.includes("multa")) return <img className={style.icono} src={multa} alt="Multa" />;
    if (n.includes("conciliación cartera")) return <img className={style.icono} src={conciliacion} alt="Conciliación" />;
    if (n.includes("recaudo")) return <img className={style.icono} src={recaudo} alt="Recaudo" />;
    if (n.includes("consulta")) return <img className={style.icono} src={consulta} alt="Consulta" />;
    if (n.includes("predictivo")) return <img className={style.icono} src={predictivo} alt="Predictivo" />;

    return null;
  };


  const irTablero = (dashboard) => {
    navigation.navigate(`/tableros/${dashboard.id}`, {

        proyectoId : proyectoId,
        nombreDashboard: dashboard.nombreDashboard,
 
    });
  };

  const Regresar = () => {
    navigation.navigate(-1);
  };

  const irCarpeta = (c) => {
     navigation.navigate(`/carpeta/${c.id}`, {
        state:{
            nombreCarpeta: c.nombre
        }
     })}


  useEffect(() => {
    console.log(id, nombreCarpeta)
    const cargarContenido = async () => {
      if (!usuario?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${URL}/contenido_carpeta/${id}/${usuario.id}`
        );

        const data = await response.json();

        if (response.ok) {
          setContenido(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    cargarContenido();
  }, [id, usuario?.id]);

  if (loading || !contenido) {
    return <div className={style.loading}>Cargando contenido...</div>;
  }

  return (
    <div className={style.Cuerpo}>
      <div className={style.Contenedor}>

        <button className={style.botonVolver} onClick={Regresar}></button>

        <h2 className={style.Titulo}>Contenido {nombreCarpeta}</h2>

        <div className={style.Seccion}>
          <h3 className={style.SeccionTitulo}>Mas contenidos</h3>

          {contenido.carpetas.length === 0 ? (
            <p className={style.sinRegistros}>No hay contenido</p>
          ) : (
            <div className={style.listaCarpetas}>
              {contenido.carpetas.map((c) => (
                <div
                  key={c.id}
                  className={style.carpetaItem}
                  onClick={() => irCarpeta(c)}
                  
                >
                  {c.nombre}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={style.Seccion}>
          <h3 className={style.SeccionTitulo}>Dashboards</h3>

          {contenido.dashboards.length === 0 ? (
            <p className={style.sinRegistros}>No hay dashboards disponibles</p>
          ) : (
            <div className={style.contenedorTarjetas}>
              {contenido.dashboards.map((dashboard) => (
                <button
                  key={dashboard.id}
                  className={style.tarjeta}
                  onClick={() => irTablero(dashboard)}
                >
                  <div className={style.iconoTarjeta}>
                    {obtenerIcono(dashboard.nombre_dashboard)}
                  </div>

                  <h3>{dashboard.nombre_dashboard}</h3>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Carpeta;
 */