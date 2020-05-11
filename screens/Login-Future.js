import React, { useState, useCallback, useEffect } from "react";
import {
	ActivityIndicator,
	Keyboard,
	KeyboardAvoidingView,
	StyleSheet,
	Alert,
	TextInput,
	Dimensions,
	TouchableOpacity,
	AsyncStorage,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as Facebook from "expo-facebook";
import * as Google from "expo-google-app-auth";
import { db } from "../constants/firebase-config";
import { LinearGradient } from "expo-linear-gradient";
import { Block, Text, Button } from "expo-ui-kit";

import { navigationReset } from "../helper/navigation-reset";

const { width, height } = Dimensions.get("window");

const FACEBOOK_APP_ID = "834072043737963";
const GOOGLE_IOS_ID = "";
const GOOGLE_ANDROID_ID =
	"746591055474-uva2rfpk4cje6pe57ottjpcnirfaifab.apps.googleusercontent.com";
const API_URL = "http://5e08ac18434a370014168b98.mockapi.io/api/v1";

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
				_serve(token, json.id);
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
				scopes: ["profile", "email"],
			});
			setLoading(false);
			if (type === "success") {
				console.log({ user, accessToken });
				db.ref("users/" + user.id).set({
					signIn: "google",
					email: user.email,
					name: user.name,
					photo_uri: user.photoUrl,
				});
				_serve(accessToken, user.id);
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

	const handleLogin = useCallback(async () => {
		fetch(`${API_URL}/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		})
			.then((response) => response.json())
			.then((result) => {
				alert(`Login token: ${result?.token}`);
				setLoading(false);
			})
			.catch((error) => {
				console.error("Login Error:", error);
				setLoading(false);
			});
	});

	const handleAuth = useCallback(async (type) => {
		setLoading(true);
		switch (type) {
			case "google":
				await handleGoogle();
				break;
			case "facebook":
				await handleFacebook();
				break;
			case "password":
			default:
				await handleLogin();
				break;
		}
	});

	const renderLogin = () => {
		return (
			<Block center middle flex={0.7}>
				<Block style={styles.inputContainer}>
					<Text style={styles.label}>Email address</Text>
					<TextInput
						value={email}
						style={styles.input}
						placeholder="you@email.com"
						onChangeText={(value) => setEmail(value)}
					/>
				</Block>
				<Block style={styles.inputContainer}>
					<Text style={styles.label}>Password</Text>
					<TextInput
						secureTextEntry
						value={password}
						style={styles.input}
						placeholder="password"
						onChangeText={(value) => setPassword(value)}
					/>
				</Block>
				<Block row flex={false}>
					<Button
						transparent
						onPress={() => navigation.push("Forgot")}
						style={{
							position: "relative",
							right: -width * 0.25,
							top: -24,
						}}
					>
						<Text
							white
							caption
							style={{ textDecorationLine: "underline" }}
						>
							Forgot Password{" "}
						</Text>
					</Button>
				</Block>
				<Block style={styles.inputContainer}>
					<Button onPress={() => handleAuth()}>
						{loading ? (
							<ActivityIndicator size="small" color="white" />
						) : (
							<Text center bold white>
								Sign In
							</Text>
						)}
					</Button>
				</Block>
				<Block row center flex={false}>
					<Block style={styles.divider} />
					<Text caption white>
						or
					</Text>
					<Block style={styles.divider} />
				</Block>
			</Block>
		);
	};

	const renderSocials = () => (
		<Block
			style={{
				flexDirection: "row",
				flex: 0,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<TouchableOpacity
				activeOpacity={0.8}
				style={styles.socialContainer}
				onPress={() => handleAuth("google")}
			>
				<Block style={styles.google}>
					<FontAwesome name="google" size={32} color={"white"} />
				</Block>
			</TouchableOpacity>
			<TouchableOpacity
				activeOpacity={0.8}
				style={styles.socialContainer}
				onPress={() => handleAuth("facebook")}
			>
				<Block style={styles.facebook}>
					<FontAwesome name="facebook" size={32} color={"white"} />
				</Block>
			</TouchableOpacity>
		</Block>
	);
	return (
		<KeyboardAvoidingView
			behavior="padding"
			style={{
				flex: 1,
				justifyContent: "center",
				backgroundColor: "white",
			}}
			keyboardVerticalOffset={-28}
		>
			<LinearGradient
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
				colors={["#0AC4BA", "#2BDA8E"]}
				style={{ flex: 1, overflow: "visible" }}
			>
				<Block center middle>
					{renderLogin()}
					{renderSocials()}
				</Block>
				<Block
					bottom
					center
					flex={false}
					style={{
						marginBottom: 16,
						paddingRight: 16,
						paddingLeft: 16,
					}}
				>
					<Button
						onPress={() => navigation.push("SignUp")}
						transparent
					>
						<Text white style={{ textDecorationLine: "underline" }}>
							{" "}
							SignUp with Email{" "}
						</Text>
					</Button>
				</Block>
			</LinearGradient>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	label: {
		fontSize: 12,
		color: "#fff",
		fontWeight: "bold",
	},
	inputContainer: {
		width: width * 0.8,
		flex: 0,
		marginBottom: 32,
	},
	input: {
		borderColor: "rgba(255,255,255,0.8)",
		color: "#fff",
		borderRadius: 6,
		borderBottomWidth: StyleSheet.hairlineWidth,
		fontSize: 20,
		padding: 12,
	},
	divider: {
		flex: 0,
		height: StyleSheet.hairlineWidth,
		backgroundColor: "rgba(255,255,255,0.8)",
		width: "30%",
		marginLeft: 12,
		marginRight: 12,
	},
	socialContainer: {
		marginHorizontal: 32,
		flex: 0,
		width: 64,
		height: 64,
	},
	google: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#DC4E41",
		overflow: "hidden",
		width: 64,
		height: 64,
		borderRadius: 32,
	},
	facebook: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#3A5896",
		width: 64,
		height: 64,
		borderRadius: 32,
	},
});
