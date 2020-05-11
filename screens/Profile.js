import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	TouchableOpacity,
	Image,
	Dimensions,
	Alert,
	Modal,
	ActivityIndicator,
	AsyncStorage,
} from "react-native";
import { Updates } from "expo";
import { Block, Text, Button } from "expo-ui-kit";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { clearStorage } from "../helper/cleanup-driver";
import DatePicker from "react-native-datepicker";
import { db } from "../constants/firebase-config";

const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

const { width, height } = Dimensions.get("window");

const renderDrawerButton = (navigation) => {
	return (
		<View
			style={{
				position: "absolute",
				left: 0,
				top: 0,
				paddingLeft: 16,
				paddingTop: 24,
				zIndex: 2,
			}}
		>
			<TouchableOpacity
				onPress={() => {
					navigation.openDrawer();
				}}
				style={{ width: 30, height: 30 }}
			>
				<Feather name="menu" size={32} color="white" />
			</TouchableOpacity>
		</View>
	);
};

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
				onPress={() => navigation.navigate("TabScreens")}
				style={{ width: 30, height: 30 }}
			>
				<Ionicons name="ios-arrow-back" size={32} color="white" />
			</TouchableOpacity>
		</View>
	);
};

const maxDate = () => {
	const date = new Date();
	return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
};

const renderProfile = () => {
	const [date, setDate] = useState(maxDate());
	const [change, setChange] = useState(false);
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("Username");
	const [email, setEmail] = useState("user@gmail.com");
	const [photo, setPhoto] = useState(null);
	const [method, setMethod] = useState("Google");
	const [dateSet, setDateSet] = useState(false);
	const [processing, setProcessing] = useState(true);
	const [id, setId] = useState(null);

	useEffect(() => {
		const _retrieveData = async () => {
			const i = await AsyncStorage.getItem("id");
			setId(i);
			if (i == null) return;
			db.ref("users")
				.child(i)
				.once(
					"value",
					(snapshot) => {
						const val = snapshot.val();
						//console.log(val);
						setName(capitalizeFirstLetter(val.name));
						setPhoto(val.photo_uri);
						setEmail(val.email);
						if (val.signIn === "google") {
							try {
								if (val.birthday) {
									setDate(val.birthday);
									setDateSet(true);
								}
							} catch (err) {}
						} else if (val.signIn === "facebook") {
							setMethod("Facebook");
							setDate(val.birthday);
							setDateSet(true);
						}
						setProcessing(false);
					},
					(err) => {
						console.log("Error");
						setProcessing(false);
					}
				);
		};
		_retrieveData();
	}, []);

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

	const renderDatePicker = () => {
		return (
			<DatePicker
				style={{
					backgroundColor: "transparent",
					width: width / 2,
					position: "absolute",
					top: height / 2 + 100,
					left: width / 2 - 100,
				}}
				date={date}
				mode="date"
				placeholder="select date"
				format="DD-MM-YYYY"
				minDate="01-01-1940"
				maxDate={maxDate()}
				confirmBtnText="Confirm"
				cancelBtnText="Cancel"
				customStyles={{
					dateIcon: {},
					dateInput: {
						marginLeft: 36,
					},
				}}
				onDateChange={(d) => {
					setDate(d);
					setChange(false);
					db.ref("users")
						.child(id)
						.update({ birthday: d })
						.then(() => console.log("success"))
						.catch(() => consol.log("Error"));
					setDateSet(true);
				}}
			/>
		);
	};

	return (
		<View
			style={{
				position: "absolute",
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
			}}
		>
			<LinearGradient
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				colors={["#B993D6", "#8CA6DB"]}
				style={{
					flex: 1,
					alignItems: "center",
				}}
			>
				<View
					style={{
						flex: 0.4,
						justifyContent: "center",
						alignItems: "center",
					}}
				>
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

					<Text h1 bold center white style={{ marginHorizontal: 16 }}>
						Hi ! {name}
					</Text>
				</View>
				<View
					style={{
						flex: 0.4,
						justifyContent: "flex-start",
						alignItems: "center",
						marginTop: 16,
					}}
				>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							width: width * 0.8,
							flexWrap: "wrap",
						}}
					>
						<Text caption white style={{ fontSize: 20 }}>
							Email
						</Text>
						<Text
							caption
							bold
							white
							style={{
								fontSize: 20,
								flexWrap: "wrap",
							}}
						>
							{email}
						</Text>
					</View>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							width: width * 0.8,
							marginTop: 24,
						}}
					>
						<Text caption white style={{ fontSize: 20 }}>
							Login Method
						</Text>
						<Text caption bold white style={{ fontSize: 20 }}>
							{method}
						</Text>
					</View>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							width: width * 0.8,
							marginTop: 24,
						}}
					>
						<Text caption white style={{ fontSize: 20 }}>
							Date Of Birth
						</Text>
						<Text caption bold white style={{ fontSize: 20 }}>
							{date}
						</Text>
					</View>
					{!dateSet && (
						<View
							style={{
								flexDirection: "row",
								justifyContent: "flex-end",
								width: width * 0.8,
							}}
						>
							<Button
								flex={false}
								onPress={() => {
									//setChange(true);
									Alert.alert(
										"Alert",
										"Please remember that this is a temporary setup and will be resetted on logout!",
										[
											{
												text: "Proceed",
												onPress: () => setChange(true),
											},
											{
												text: "Set Later",
												onPress: () => {},
											},
										],
										{ cancelable: false }
									);
								}}
								transparent
							>
								<Text
									white
									style={{ textDecorationLine: "underline" }}
								>
									change
								</Text>
							</Button>
						</View>
					)}
				</View>
				<View
					style={{
						flex: 0.2,
						justifyContent: "flex-end",
						marginBottom: 16,
					}}
				>
					<LinearGradient
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						colors={["#f857a6", "#ff5858"]}
						style={{
							alignItems: "center",
						}}
					>
						<Button
							style={{ width: width * 0.8 }}
							transparent
							onPress={async () => {
								setLoading(true);
								Alert.alert(
									"Log Out",
									"Are you sure you want to logout ?",
									[
										{
											text: "Cancel",
											onPress: () => setLoading(false),
										},
										{
											text: "OK",
											onPress: async () => {
												await clearStorage();
												setLoading(false);
												Updates.reload();
											},
										},
									],
									{ cancelable: false }
								);
							}}
						>
							{loading ? (
								<ActivityIndicator size="small" color="white" />
							) : (
								<Text center bold white>
									Logout
								</Text>
							)}
						</Button>
					</LinearGradient>
				</View>
			</LinearGradient>
			{change && renderDatePicker()}
			{processing && renderLoading()}
		</View>
	);
};

export default ({ navigation }) => {
	return (
		<Block center middle>
			{renderProfile()}
			{renderDrawerButton(navigation)}
			{renderBackButton(navigation)}
		</Block>
	);
};

const styles = StyleSheet.create({});
