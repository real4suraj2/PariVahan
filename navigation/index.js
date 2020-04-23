import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {Feather, Ionicons, FontAwesome5} from '@expo/vector-icons';

import Welcome from '../screens/Welcome';
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import Forgot from '../screens/Forgot';
import Profile from '../screens/Profile';
import SavedVehicles from '../screens/SavedVehicles';

import SearchBoard from '../screens/SearchBoard';
import History from '../screens/History';

import {Block, Button} from 'expo-ui-kit';

const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const AuthStackScreens = ({navigation}) => {
	return (
	<AuthStack.Navigator 
		initialRouteName="Welcome"
	 >
		<AuthStack.Screen name="Welcome" options={{headerShown : false}}>
			{(props)=> <Welcome {...props} />}
		</AuthStack.Screen>
		<AuthStack.Screen name="Login" options={{headerShown : false}}>
			{(props)=> <Login {...props} />}
		</AuthStack.Screen>
		<AuthStack.Screen name="SignUp" options={{headerShown : false}}>
			{(props)=> <SignUp {...props} />}
		</AuthStack.Screen>
		<AuthStack.Screen name="Forgot" options={{headerShown : false}}>
			{(props)=> <Forgot {...props} />}
		</AuthStack.Screen>
	</AuthStack.Navigator>
	);
	}
	
const TabScreens = ({navigation}) => {
	return (
	<Tab.Navigator initialRouteName="SearchBoard">
		<Tab.Screen name="SearchBoard"
			component={SearchBoard}
			options={{
				tabBarVisible : false,
			}}
		 />
		<Tab.Screen 
			name="History" 
			component={History} 
			options={{
				tabBarVisible : false,
				headerRight: () => (
									  <Button
									    onPress={() =>{}}
									    
									  > <Text h1 bold >Weirdo Button </Text></Button>)
				}}
		 />
	</Tab.Navigator>
	);
	}
	
const DrawerScreens = ({navigation}) =>{
	return(
		 <Drawer.Navigator initialRouteName="AuthStack">
		   <Drawer.Screen name="AuthStack" component={AuthStackScreens} />
		   <Drawer.Screen name="TabScreens" component={TabScreens} />
		   <Drawer.Screen name="Profile" component={Profile} />
		   <Drawer.Screen name="SavedVehicles" component={SavedVehicles} />
		 </Drawer.Navigator>
     );
}
	
export default () => {
	return (
		<NavigationContainer>
			<DrawerScreens />
		</NavigationContainer>
	);
	}