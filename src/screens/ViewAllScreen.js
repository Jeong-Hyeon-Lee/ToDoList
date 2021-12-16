import React, {useState, useEffect} from 'react';
import {TouchableOpacity,StyleSheet, Button, StatusBar, SafeAreaView, Text, Dimensions, ScrollView, View} from 'react-native';
import {viewStyles, textStyles, barStyles, cardStyles, rowStyles, topbarStyles, bottombarStyles} from '../styles';
import { images } from '../images';
import IconButton from '../components/IconButton';
import Task from '../components/Task';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLoading from 'expo-app-loading';
import DateTimePicker from '@react-native-community/datetimepicker';
import Search from '../components/Search';
import { theme } from '../theme';
import CustomButton from '../components/custombutton';

export default function ViewAll({navigation, route}) {   
    const width = Dimensions.get('window').width;

    const [isReady, setIsReady] = useState(false);
    const [newTask, setNewTask] = useState('');
    const [tasks, setTasks] = useState({ //
        /*'1' : {id: '1', text: "Todo item #1", completed: false},
        '2' : {id: '2', text: "Todo item #2", completed: true},*/
    });

    //using search
    const [searchText, setSearchText] = useState('');
    
    //show and hide search bar
    const [shouldShow, setShouldShow] = useState(true);

    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    React.useEffect(()=>{
        const reloadTab = navigation.addListener('focus',(e)=>{
            setIsReady(false)
        });
        return reloadTab;
    },[navigation]);

    const _saveTasks = async tasks => {
        try {
            await AsyncStorage.setItem('tasks',JSON.stringify(tasks));
            setTasks(tasks);
        } catch (e) {
            console.error(e);
        }
    };

    const _loadTasks = async () => {
        const loadedTasks = await AsyncStorage.getItem('tasks');
        setTasks(JSON.parse(loadedTasks || '{}'));
    };

    const _deleteTask = id => {
        const currentTasks = Object.assign({}, tasks);
        delete currentTasks[id];
        //setTasks(currentTasks);
        _saveTasks(currentTasks);
    };
    const _toggleTask = id => {
        const currentTasks = Object.assign({}, tasks);
        currentTasks[id]['completed'] = !currentTasks[id]['completed'];
        //setTasks(currentTasks);
        _saveTasks(currentTasks);
    };
    const _updateTask = item => {
        const currentTasks = Object.assign({}, tasks);
        currentTasks[item.id] = item;
        //setTasks(currentTasks);
        _saveTasks(currentTasks);
    };

    const _editTask = id => {
        const currentTasks = Object.assign({}, tasks);
        const editScreen = navigation.navigate('EDIT', {selectedTask: currentTasks[id], taskID: id});
        return editScreen;
    };
    
    const _setDueDate = item => {
        const currentTasks = Object.assign({}, tasks);
        showDatepicker();
        setTasks(currentTasks);
    };

    var now = new Date();
    var month = now.getMonth() + 1;
    var today = now.getDate();

    const _getData = async() => {
        try {
            await AsyncStorage.getAllKeys().then(async keys => {
                await AsyncStorage.multiGet(keys).then(key => {
                  key.forEach(data => {
                    //Object.values(data).reverse().map(function(item){ console.log(item) })
                    console.log(data[1]); //values
                  });
                });
            });
        } catch (error) {
            console.log(error);
        }
        //AsyncStorage.getAllKeys().then((keys)=> AsyncStorage.multiGet(keys).then((keys)=>console.log(keys[1])))

        /*
        AsyncStorage.setItem('KEY', JSON.stringify(array));
        Object.values(AsyncStorage.getAllKeys).reverse().map(function(item){
            console.log(item)
        });
        */
        
        /*
        const keys = await AsyncStorage.getAllKeys;
        const result = await AsyncStorage.multiGet(keys);
        return result.map(req => JSON.parse(req)).forEach(console.log);
        */
    }

    {/*const image = focused ? require('../assets/due-date.png') : require('../assets/due-date.png') */}


//[ID]: {id: ID, text: newTask, completed: false, startdate: JSON.stringify(date), duedate: JSON.stringify(date), category: "null"},
    return  isReady? (
        <SafeAreaView style={viewStyles.container}>
            <StatusBar barStyle="dark-content" style={barStyles.statusbar}/> 
            
            <View style={cardStyles.card}>
                <View style={rowStyles.context}> 
                    <IconButton type={images.searchI} onPressOut={()=>setShouldShow(!shouldShow)}/>
                    {shouldShow ? <Search value={searchText} onChangeText={text => {setSearchText(text)}}/> : null}
                </View>

                <View style={rowStyles.context}> 
                    <CustomButton text="share" onPress={_getData}/>
                    <CustomButton text="select" onPress={()=>navigation.navigate('SELECT')} /*style={[textStyles.title, {alignItems:'flex-end'}]}*//> 
                </View>

                <ScrollView width = {width-20} onLoad={(route)=>_addTask(route.params)}>
                    {Object.values(tasks).reverse().filter((filterItem)=>{
                        if(searchText ==""){
                            return filterItem
                        } else if (filterItem.text.toLowerCase().includes(searchText.toLowerCase())){
                            return filterItem
                        }
                    }).map(item=> (
                        <Task key={item.id} item={item} editTask={_editTask} deleteTask={_deleteTask} toggleTask={_toggleTask}
                        updateTask={_updateTask} setDueDate={_setDueDate}
                        /> 
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    )   :   (
        <AppLoading
            startAsync = {_loadTasks}
            onFinish={()=>setIsReady(true)}
            onError={console.error}/>
    );
};