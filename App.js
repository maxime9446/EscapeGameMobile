import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import axios from 'axios';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {isSameDay} from 'date-fns';

const Stack = createStackNavigator();

const App = () => {
    const [partOfDays, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get("http://localhost:1337/api/parts-of-days?populate=*");
            setData(response.data.data.filter((partOfDay) => isSameDay(new Date(partOfDay.attributes.day), new Date())));
        } catch (error) {
            console.error(error);
        }
    };

    const handlePartOfDayPress = (partOfDay, navigation) => {
        navigation.navigate('PartOfDayDetailsScreen', {partOfDay});
    };

    const stopPartOfDay = async (partOfDayId) => {
        const confirmed = await new Promise((resolve, reject) => {
            Alert.alert("Confirmation", "Êtes-vous sûr de vouloir arrêter cette partie de la journée?", [{
                text: "Annuler", style: "cancel", onPress: () => resolve(false)
            }, {
                text: "OK", onPress: () => resolve(true)
            }]);
        });

        if (!confirmed) {
            return;
        }

        try {
            const response = await axios.put(`http://localhost:1337/api/parts-of-days/${partOfDayId}`, {
                attributes: {
                    status: 'not_started'
                }
            });

            const updatedPartOfDays = partOfDays.map((partOfDay) => {
                if (partOfDay.id === partOfDayId) {
                    return {
                        ...partOfDay, attributes: {
                            ...partOfDay.attributes, status: response.data.data.attributes.status,
                        }
                    };
                } else {
                    return partOfDay;
                }
            });

            setData(updatedPartOfDays);
        } catch (error) {
            console.error(error);
        }
    };


    const PartOfDayDetailsScreen = ({route}) => {
        const {partOfDay} = route.params;
        return (<View style={styles.container}>
            <Text style={styles.title}>Détails de la partie de la journée</Text>
            <Text>Date : {partOfDay.attributes.day}</Text>
            <Text>Status : {partOfDay.attributes.status}</Text>
            {partOfDay.attributes.status === 'in_progress' && (<TouchableOpacity
                style={styles.button}
                onPress={() => stopPartOfDay(partOfDay.id)}
            >
                <Text style={styles.buttonText}>Arrêter</Text>
            </TouchableOpacity>)}
        </View>);
    };

    return (<NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen
                name="MainScreen"
                options={{title: 'Liste des parties de la journée'}}
            >
                {({navigation}) => (<View style={styles.container}>
                    <View style={styles.table}>
                        <View style={styles.row}>
                            <Text style={[styles.headerCell, styles.leftHeaderCell]}>Date</Text>
                            <Text style={[styles.headerCell, styles.rightHeaderCell]}>Time</Text>
                            <Text style={[styles.headerCell, styles.rightHeaderCell]}>Status</Text>
                        </View>
                        {partOfDays.map((partOfDay) => (<TouchableOpacity
                            style={styles.row}
                            key={partOfDay.id}
                            onPress={() => handlePartOfDayPress(partOfDay, navigation)}
                        >
                            <Text
                                style={[styles.cell, styles.leftCell]}>{partOfDay.attributes.day}</Text>
                        </TouchableOpacity>))}
                    </View>
                </View>)}
            </Stack.Screen>
            <Stack.Screen
                name="PartOfDayDetailsScreen"
                component={PartOfDayDetailsScreen}
                options={{title: 'Détails de la partie de la journée'}}
            />
        </Stack.Navigator>
    </NavigationContainer>);
};

const styles = StyleSheet.create({
    container: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
    }, title: {
        fontSize: 24, fontWeight: 'bold', marginBottom: 20,
    }, table: {
        width: '80%', borderWidth: 1, borderColor: '#ccc', borderRadius: 4, overflow: 'hidden',
    }, row: {
        flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc',
    }, headerCell: {
        padding: 10, backgroundColor: '#f7f7f7', fontWeight: 'bold',
    }, leftHeaderCell: {
        width: '70%',
    }, rightHeaderCell: {
        width: '30%',
    }, cell: {
        padding: 10,
    }, leftCell: {
        width: '70%',
    }, rightCell: {
        width: '30%', textAlign: 'center',
    },
});

export default App;
