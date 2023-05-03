import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import axios from 'axios';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {isSameDay} from 'date-fns';
import moment from "moment";

const Stack = createStackNavigator();

const App = () => {
    const [partOfDays, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);


    const fetchData = async () => {
        try {
            const response = await axios.get("http://192.168.0.27:1337/api/parts-of-days?populate=*");
            const today = new Date().toISOString().substr(0, 10); // Récupère la date du jour au format ISO
            const data = response.data.data.filter((partOfDay) => partOfDay.attributes.day.startsWith(today));
            setData(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePartOfDayPress = (partOfDay, navigation) => {
        navigation.navigate('PartOfDayDetailsScreen', {partOfDay});
    };

    const reloadPartsOfDays = () => {
        axios
            .get('http://192.168.0.27:1337/api/parts-of-days?populate=*')
            .then((response) => {
                const partsOfDays = response.data.data.filter((partOfDay) =>
                    isSameDay(new Date(partOfDay.attributes.day), new Date())
                )
                setData(partsOfDays)
            })
            .catch((error) => {
                console.error(error)
            })
    }
    const PartOfDayDetailsScreen = ({route}) => {
        const {partOfDay} = route.params;
        const formatedDate = moment(partOfDay.attributes.day).format("DD/MM/YYYY");
        const time = moment(partOfDay.attributes.day).format("HH:mm");
        const [status, setStatus] = useState(partOfDay.attributes.status);

        const handleStatusChange = async (partOfDayId) => {
            try {
                if (status === "not_started") {
                    const updatedPartOfDay = {
                        data: {
                            id: partOfDayId,
                            day: partOfDay.attributes.day,
                            status: partOfDay.attributes.status === 'not_started' ? 'in_progress' : 'completed'
                        }
                    };
                    await axios.put(`http://192.168.0.27:1337/api/parts-of-days/${partOfDay.id}`, updatedPartOfDay);
                    setStatus("in_progress");
                } else if (status === "in_progress") {
                    const updatedPartOfDay = {
                        data: {
                            id: partOfDayId,
                            day: partOfDay.attributes.day,
                            status: partOfDay.attributes.status = 'completed'
                        }
                    };
                    await axios.put(`http://192.168.0.27:1337/api/parts-of-days/${partOfDay.id}`, updatedPartOfDay);
                    setStatus("completed");
                }
            } catch (error) {
                console.error(error);
            }
        };

        return (
            <View style={styles.container}>
                <Text style={styles.title}>Détails de la partie de la journée</Text>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Titre:</Text>
                    <Text style={styles.infoText}>{partOfDay.attributes.scenario.data.attributes.title}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoText}>{formatedDate}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Heure:</Text>
                    <Text style={styles.infoText}>{time}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Statut:</Text>
                    <View
                        style={[styles.statusContainer, {backgroundColor: status === 'not_started' ? '#F6C90E' : status === 'in_progress' ? '#3DBB3D' : '#E5373A'}]}>
                        <Text style={styles.statusText}>{status}</Text>
                    </View>
                </View>
                {status === "not_started" && (
                    <TouchableOpacity style={[styles.button, styles.startButton]} onPress={() => handleStatusChange()}>
                        <Text style={styles.buttonText}>Démarrer</Text>
                    </TouchableOpacity>
                )}
                {status === "in_progress" && (
                    <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={() => handleStatusChange()}>
                        <Text style={styles.buttonText}>Arrêter</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="MainScreen"
                    options={{title: 'Liste des parties de la journée'}}
                >
                    {({navigation}) => (
                        <View style={styles.container}>
                            <View style={styles.table}>
                                <View style={styles.row}>
                                    <Text style={[styles.headerCell, styles.leftHeaderCell]}>Scénarios</Text>
                                    <Text style={[styles.headerCell, styles.rightHeaderCell]}>Heures</Text>
                                </View>
                                {partOfDays.map((partOfDay) => {
                                    const time = moment(partOfDay.attributes.day).format("HH:mm");
                                    return (
                                        <TouchableOpacity
                                            style={styles.row}
                                            key={partOfDay.id}
                                            onPress={() => handlePartOfDayPress(partOfDay, navigation)}
                                        >
                                            <Text
                                                style={[styles.leftCell]}>{partOfDay.attributes.scenario.data.attributes.title}</Text>
                                            <Text
                                                style={styles.rightCell}>{moment(partOfDay.attributes.day).format("HH:mm")}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </Stack.Screen>
                <Stack.Screen
                    name="PartOfDayDetailsScreen"
                    component={PartOfDayDetailsScreen}
                    options={{title: 'Détails de la partie'}}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    table: {
        marginVertical: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    leftCell: {
        flex: 1,
    },
    rightCell: {
        flex: 1,
        textAlign: 'right',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
    },
    headerCell: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    leftHeaderCell: {
        textAlign: 'left',
    },
    rightHeaderCell: {
        textAlign: 'right',
    },

    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        flex: 1,
        fontWeight: 'bold',
        marginRight: 16,
    },
    infoText: {
        flex: 2,
        fontSize: 16,
    },
    statusContainer: {
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    statusText: {
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontSize: 16,
    },
    button: {
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    startButton: {
        backgroundColor: '#F6C90E',
    },
    stopButton: {
        backgroundColor: '#E5373A',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
export default App;