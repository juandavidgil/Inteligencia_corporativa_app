import React, { useState } from "react";
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
//import {NativeStackNavigationProp}'@react-navigation/native-stack' ;


const InicioSesion: React.FC  =  () => {
    const [correo, setCorreo] = useState ('')
    const [contraseña, setContraseña] = useState ('')
     return(
        <SafeAreaView>
        <View>
        <Text>Inteligencia Corporativa</Text>
        <TextInput
        
        />

         <Text>Correo electronico</Text>
        <TextInput
            placeholder="Ingrese su correo corporativo"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setCorreo}
            value={correo}
        />

         <Text>Contraseña</Text>
        <TextInput
            placeholder="Ingrese su contraseña"
            secureTextEntry
            onChangeText={setContraseña}
            value={contraseña}
            
        />

        <TouchableOpacity>
            <Text>Iniciar Sesion</Text>
        </TouchableOpacity>
        </View>
        </SafeAreaView>
     )
}

export default InicioSesion
