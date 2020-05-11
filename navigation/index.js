import React, { useState, useEffect } from "react";
import {
	AsyncStorage,
	View,
	Dimensions,
	Image,
	StyleSheet,
	Alert,
} from "react-native";
import { Updates } from "expo";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
	createDrawerNavigator,
	DrawerItem,
	DrawerContentScrollView,
} from "@react-navigation/drawer";
import { Feather, Ionicons, FontAwesome5, AntDesign } from "@expo/vector-icons";

import Welcome from "../screens/Welcome";
import Login from "../screens/Login";

//--------Future Implementation-------//
//import Login form "../screens/Login";
//import SignUp from "../screens/SignUp";
//import Forgot from "../screens/Forgot";
//----------------------------------//

import Profile from "../screens/Profile";
import SavedVehicles from "../screens/SavedVehicles";

import SearchBoard from "../screens/SearchBoard";
import History from "../screens/History";

import { clearStorage } from "../helper/cleanup-driver";
import { db } from "../constants/firebase-config";

import { Block, Button, Text } from "expo-ui-kit";

const { width, height } = Dimensions.get("window");

const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const DrawerContent = (props) => {
	const [photo, setPhoto] = useState(null);
	useEffect(() => {
		const _serve = async () => {
			try {
				const id = await AsyncStorage.getItem("id");
				if (id === null) return;
				db.ref("users")
					.child(id)
					.child("photo_uri")
					.once(
						"value",
						(snapshot) => {
							setPhoto(snapshot.val());
						},
						(err) => console.log(err)
					);
			} catch (err) {
				console.log("Error", err);
			}
		};
		_serve();
	}, []);
	return (
		<DrawerContentScrollView
			{...props}
			scrollEnabled={false}
			contentContainerStyle={{ flex: 1 }}
		>
			<Block>
				<Block flex={0.4} margin={20} bottom>
					{photo == null ? (
						<Image
							source={require("../assets/images/avatar.png")}
							style={{ width: 90, height: 90, borderRadius: 90 }}
						/>
					) : (
						<Image
							source={{ uri: photo }}
							style={{ width: 90, height: 90, borderRadius: 90 }}
						/>
					)}
				</Block>
				<Block>
					<DrawerItem
						label="Dashboard"
						labelStyle={{ color: "black", marginLeft: -16 }}
						style={styles.drawerItem}
						onPress={() => props.navigation.navigate("TabScreens")}
						icon={() => (
							<AntDesign
								name="dashboard"
								color="black"
								size={16}
							/>
						)}
					/>
					<DrawerItem
						label="Profile"
						labelStyle={{ color: "black", marginLeft: -16 }}
						style={{ alignItems: "flex-start", marginVertical: 0 }}
						onPress={() => props.navigation.navigate("Profile")}
						icon={() => (
							<FontAwesome5 name="user" color="black" size={16} />
						)}
					/>
					<DrawerItem
						label="Saved Vehicles"
						labelStyle={{ color: "black", marginLeft: -16 }}
						style={{ alignItems: "flex-start", marginVertical: 0 }}
						onPress={() =>
							props.navigation.navigate("SavedVehicles")
						}
						icon={() => (
							<FontAwesome5 name="car" color="black" size={16} />
						)}
					/>
				</Block>
			</Block>

			<Block flex={false}>
				<DrawerItem
					label="Logout"
					labelStyle={{ color: "black" }}
					icon={() => (
						<AntDesign name="logout" color="black" size={16} />
					)}
					onPress={() =>
						Alert.alert(
							"Log Out",
							"Are you sure you want to logout ?",
							[
								{
									text: "Cancel",
									onPress: () => {},
								},
								{
									text: "OK",
									onPress: async () => {
										await clearStorage();
										Updates.reload();
									},
								},
							],
							{ cancelable: false }
						)
					}
				/>
			</Block>
		</DrawerContentScrollView>
	);
};

const AuthStackScreens = ({ navigation }) => {
	return (
		<AuthStack.Navigator initialRouteName="Welcome">
			<AuthStack.Screen name="Welcome" options={{ headerShown: false }}>
				{(props) => <Welcome {...props} />}
			</AuthStack.Screen>
			<AuthStack.Screen name="Login" options={{ headerShown: false }}>
				{(props) => <Login {...props} />}
			</AuthStack.Screen>
			<AuthStack.Screen name="SignUp" options={{ headerShown: false }}>
				{(props) => <SignUp {...props} />}
			</AuthStack.Screen>
			<AuthStack.Screen name="Forgot" options={{ headerShown: false }}>
				{(props) => <Forgot {...props} />}
			</AuthStack.Screen>
			<AuthStack.Screen name="Drawer" options={{ headerShown: false }}>
				{(props) => <DrawerScreens {...props} />}
			</AuthStack.Screen>
		</AuthStack.Navigator>
	);
};

const TabScreens = ({ navigation }) => {
	return (
		<Tab.Navigator initialRouteName="SearchBoard">
			<Tab.Screen
				name="SearchBoard"
				component={SearchBoard}
				options={{
					tabBarVisible: false,
				}}
			/>
			<Tab.Screen
				name="History"
				component={History}
				options={{
					tabBarVisible: false,
				}}
			/>
		</Tab.Navigator>
	);
};

const DrawerScreens = ({ navigation }) => {
	return (
		<Drawer.Navigator
			initialRouteName="TabScreens"
			drawerType="slide"
			overlayColor="transparent"
			lazy={false}
			drawerStyle={styles.drawerStyles}
			contentContainerStyle={{ flex: 1 }}
			drawerContentOptions={{
				activeBackgroundColor: "transparent",
				activeTintColor: "white",
				inactiveTintColor: "white",
			}}
			sceneContainerStyle={{ backgroundColor: "transparent" }}
			drawerContent={(props) => <DrawerContent {...props} />}
		>
			<Drawer.Screen name="TabScreens" component={TabScreens} />
			<Drawer.Screen name="Profile" component={Profile} />
			<Drawer.Screen name="SavedVehicles" component={SavedVehicles} />
		</Drawer.Navigator>
	);
};

export default () => {
	const [authenticated, setAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);
	const _serve = async () => {
		try {
			const token = await AsyncStorage.getItem("token");
			const id = await AsyncStorage.getItem("id");
			if (token != null && id != null) {
				setAuthenticated(true);
			}
			setLoading(false);
		} catch (err) {
			setLoading(false);
			console.log("Error", err);
		}
	};
	useEffect(() => {
		_serve();
	}, []);

	return (
		<NavigationContainer>
			{authenticated ? <DrawerScreens /> : <AuthStackScreens />}
		</NavigationContainer>
	);
};

const styles = StyleSheet.create({
	drawerStyles: { flex: 1, width: "70%", backgroundColor: "transparent" },
	drawerItem: { alignItems: "flex-start", marginVertical: 0 },
});
