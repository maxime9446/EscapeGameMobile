import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import App from './App';
import PartOfDayDetailScreen from './PartOfDayDetailScreen';
import {Permissions} from 'expo-permissions';

const checkNetworkPermission = async () => {
    const {status} = await Permissions.getAsync(Permissions.NETWORK);

    if (status !== 'granted') {
        console.log('Autorisation d\'accès au réseau non accordée.');
    } else {
        console.log('Autorisation d\'accès au réseau accordée.');
    }
}

const Stack = createStackNavigator();

const Navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="App"
                    component={App}
                    options={{title: 'Liste des parties de la journée'}}
                />
                <Stack.Screen
                    name="PartOfDayDetailScreen"
                    component={PartOfDayDetailScreen}
                    options={({route}) => ({title: route.params.title})}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Navigation;
