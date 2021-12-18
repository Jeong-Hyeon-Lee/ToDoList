import React, {useState, useEffect} from 'react';
import {TouchableOpacity,StyleSheet, Button, StatusBar, SafeAreaView, Text, Dimensions, ScrollView, View, Share} from 'react-native';
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
import DraggableFlatList, { RenderItemParams, ScaleDecorator, ShadowDecorator, OpacityDecorator, useOnCellActiveAnimation} from 'react-native-draggable-flatlist';
//import copy from 'copy-to-clipboard';

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

    const _editTask = id => {
        const currentTasks = Object.assign({}, tasks);
        const editScreen = navigation.navigate('EDIT', {selectedTask: currentTasks[id], taskID: id});
        return editScreen;
    };

    const renderItem= ({ item, index, drag, isActive }) => {    
        return (
            <ScaleDecorator>
                <TouchableOpacity
                  style={[
                    {
                      backgroundColor: isActive ? 'red' : item.backgroundColor,
                      height: item.height,
                        elevation: isActive ? 30 : 0,
                    },
                  ]}
                  onLongPress={drag}>
                      <Task key={item.id} item={item} editTask={_editTask} deleteTask={_deleteTask} toggleTask={_toggleTask}/>
                 {/*} <Animated.View
                    style={{
                    }}>
                    <Task key={item.id} item={item} editTask={_editTask} deleteTask={_deleteTask} toggleTask={_toggleTask}/>
                </Animated.View> */}
                </TouchableOpacity>
            </ScaleDecorator>
        )
    };


    var now = new Date();
    var month = now.getMonth() + 1;
    var today = now.getDate();

    const _shareData = async() => {
        var text = '<ToDoList>\n';
        {Object.values(tasks)
            .map(function(data){
                var shape;
                if(data.completed){
                    shape = "○";
                } else {
                    shape = "x";
                }
                var splitStart = data.startdate.split('T');
                var splitDue = data.duedate.split('T');
                text+=data.text+'('+shape+') : startdate('+splitStart[0]+'"), duedate('+splitDue[0]+'")\n'
            })
        }
        
        try{
            const result = await Share.share({
                message:text,
              });
              if (result.action === Share.sharedAction) {
                if (result.activityType) {
                  // shared with activity type of result.activityType
                } else {
                  // shared
                }
              } else if (result.action === Share.dismissedAction) {
                // dismissed
              }
        } catch (error) {
            alert(error.message);
        }
    }

    var sorted = true;
    //const [sortingData, setSortingData] = useState({});
    //.sort((a,b)=>(a.duedate>b.duedate)?1:-1)
    const _sortDataS = () => {
        sorted = true;
        //setSortingData(Object.values(tasks).sort((a,b)=>(a.startdate>b.startdate)?1:-1));
    }
    const _sortDataD = () => {
        sorted = false;
        //setSortingData(Object.values(tasks).sort((a,b)=>(a.duedate>b.duedate)?1:-1));
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
                    <CustomButton text="share" onPress={_shareData}/>
                    <CustomButton text="select" onPress={()=>navigation.navigate('SELECT')} /*style={[textStyles.title, {alignItems:'flex-end'}]}*//> 
                    <CustomButton text="sortS" onPress={_sortDataS}/>
                    <CustomButton text="sortD" onPress={_sortDataD}/>
                </View>

                <DraggableFlatList width = {width-20}
                        data={!sorted 
                            ? (Object.values(tasks).sort((a,b)=>(a.startdate>b.startdate)?1:-1).filter((filterItem)=>{ 
                            if(searchText ==""){
                                return filterItem
                            } else if (filterItem.text.toLowerCase().includes(searchText.toLowerCase())){
                                return filterItem
                            }}))
                            : (Object.values(tasks).sort((a,b)=>(a.duedate>b.duedate)?1:-1).filter((filterItem)=>{ 
                            if(searchText ==""){
                                return filterItem
                            } else if (filterItem.text.toLowerCase().includes(searchText.toLowerCase())){
                                return filterItem
                            }}))
                        }
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        //onDragBegin={() => setOuterScrollEnabled(false)}
                        onDragEnd={({ data }) => {
                            _saveTasks(data)
                            //setOuterScrollEnabled(true)
                        }}
                        simultaneousHandlers={ScrollView}
                        activationDistance={20}
                />
            </View>
        </SafeAreaView>
    )   :   (
        <AppLoading
            startAsync = {_loadTasks}
            onFinish={()=>setIsReady(true)}
            onError={console.error}/>
    );
};