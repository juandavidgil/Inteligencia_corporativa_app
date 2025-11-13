import React from 'react'
import { SafeAreaView, Text, TouchableOpacity, View, FlatList } from 'react-native'

const ProyectoUsuario : React.FC = () => {
    interface Proyecto {
       nombre:
}
    const renderItem = ({item}: {item : Proyecto}) (
        <TouchableOpacity>
            <View>
               {/*  imagen */}
               <View>
                <Text>{item.nombre}</Text>

               </View>
            </View>
        </TouchableOpacity>
    )

    
    return(
        <SafeAreaView>
            <View>
                <Text>Proyectos en los que participas</Text>
                <FlatList
                data={proyectos}
                keyExtractor={(item) => item.id.toString}
                renderItem={renderItem}
                
                
                />

            </View>
        </SafeAreaView>
    )
}
export default ProyectoUsuario