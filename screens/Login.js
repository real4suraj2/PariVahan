import React, { useState, useCallback, useEffect } from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Alert,
	View,
	Dimensions,
	TouchableOpacity,
	AsyncStorage,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Facebook from "expo-facebook";
import * as Google from "expo-google-app-auth";
import { db } from "../constants/firebase-config";
import { LinearGradient } from "expo-linear-gradient";
import { Block, Text, Button } from "expo-ui-kit";

import {FACEBOOK_APP_ID, GOOGLE_ANDROID_ID, GOOGLE_ANDROID_ID_STANDALONE, GOOGLE_IOS_ID, API_URL} from '../config/social-config';

import { navigationReset } from "../helper/navigation-reset";

const { width, height } = Dimensions.get("window");

export default ({ navigation }) => {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("real4suraj2@gmail.com");
	const [password, setPassword] = useState("test123");

	const _serve = async (token, id) => {
		try {
			await AsyncStorage.setItem("token", token);
			await AsyncStorage.setItem("id", id);
		} catch (err) {
			console.log("Error");
		}
	};

	const handleFacebook = useCallback(async () => {
		try {
			await Facebook.initializeAsync(FACEBOOK_APP_ID);
			const {
				type,
				token,
			} = await Facebook.logInWithReadPermissionsAsync({
				permissions: ["public_profile", "email", "user_birthday"],
			});
			setLoading(false);
			if (type === "success") {
				const response = await fetch(
					`https://graph.facebook.com/me?fields=id,name,email,birthday,picture.type(large)&access_token=${token}`
				);
				const json = await response.json();
				db.ref("users/" + json.id).set({
					signIn: "facebook",
					birthday: json.birthday,
					name: json.name,
					photo_uri: json.picture.data.url,
					email:
						json.email === undefined ? "Not Assigned" : json.email,
				});
				await _serve(token, json.id);
				navigationReset(navigation, "Drawer");
				navigation.navigate("Drawer");
			} else {
			}
		} catch ({ message }) {
			alert(`Facebook Login Error: ${message}`);
			setLoading(false);
		}
	});

	const handleGoogle = useCallback(async () => {
		try {
			const { type, accessToken, user } = await Google.logInAsync({
				iosClientId: GOOGLE_IOS_ID,
				androidClientId: GOOGLE_ANDROID_ID,
				androidStandaloneAppClientId: GOOGLE_ANDROID_ID_STANDALONE,
				scopes: ["profile", "email"],
			});
			setLoading(false);
			if (type === "success") {
				//console.log({ user, accessToken });
				db.ref("users/" + user.id).set({
					signIn: "google",
					email: user.email,
					name: user.name,
					photo_uri: user.photoUrl,
				});
				await _serve(accessToken, user.id);
				navigationReset(navigation, "Drawer");
				navigation.navigate("Drawer");
			} else {
				alert(`Google Login canceled`);
			}
		} catch ({ message }) {
			alert(`Google Login Error: ${message}`);
			setLoading(false);
		}
	});

	const handleAuth = useCallback(async (type) => {
		switch (type) {
			case "google":
				setLoading(true);
				await handleGoogle();
				break;
			case "facebook":
				await handleFacebook();
				break;
			default:
				break;
		}
	});

	const renderBackButton = (navigation) => {
		return (
			<View
				style={{
					position: "absolute",
					right: 0,
					top: 0,
					paddingRight: 16,
					paddingTop: 24,
				}}
			>
				<TouchableOpacity
					onPress={() => navigation.navigate("Welcome")}
					style={{ width: 30, height: 30 }}
				>
					<Ionicons name="ios-arrow-back" size={32} color="white" />
				</TouchableOpacity>
			</View>
		);
	};

	const renderLoading = () => {
		return (
			<View
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
					width,
					height: height + 30,
					elevation: 7,
					backgroundColor: "rgba(0, 0, 0, 0.3)",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<View
					style={{
						flex: 1,
						justifyContent: "center",
					}}
				>
					<ActivityIndicator size={64} color="#fff" />
				</View>
			</View>
		);
	};

	const renderSocials = () => (
		<View
			style={{
				justifyContent: "center",
				alignItems: "center",
				flex: 1,
			}}
		>
			<TouchableOpacity
				activeOpacity={0.8}
				onPress={() => handleAuth("google")}
			>
				<View
					style={{
						flexDirection: "row",
						backgroundColor: "#DC4E41",
						width: width * 0.8,
						justifyContent: "center",
						alignItems: "center",
						marginBottom: 16,
						borderRadius: 32,
						paddingVertical: 12,
					}}
				>
					<Text white bold>
						Sign In with Google{"          "}
					</Text>
					<FontAwesome name="google" size={32} color={"white"} />
				</View>
			</TouchableOpacity>
			<TouchableOpacity
				activeOpacity={0.8}
				onPress={() => handleAuth("facebook")}
			>
				<View
					style={{
						flexDirection: "row",
						backgroundColor: "#3A5896",
						width: width * 0.8,
						justifyContent: "center",
						alignItems: "center",
						marginTop: 16,
						borderRadius: 32,
						paddingVertical: 12,
					}}
				>
					<Text white bold>
						Sign In with Facebook{"      "}
					</Text>
					<FontAwesome name="facebook" size={32} color={"white"} />
				</View>
			</TouchableOpacity>
		</View>
	);
	return (
		<LinearGradient
			start={{ x: 0.5, y: 0 }}
			end={{ x: 0.5, y: 1 }}
			colors={["#0AC4BA", "#2BDA8E"]}
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
			}}
		>
			{renderSocials()}
			{renderBackButton(navigation)}
			{loading && renderLoading()}
		</LinearGradient>
	);
};

const styles = StyleSheet.create({});
