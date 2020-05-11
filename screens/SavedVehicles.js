import React, { useEffect, useState, useRef } from "react";
import {
	StyleSheet,
	Alert,
	FlatList,
	View,
	Dimensions,
	TouchableOpacity,
	AsyncStorage,
	ActivityIndicator,
} from "react-native";
import { Block, Text, Button } from "expo-ui-kit";
import {
	Feather,
	Ionicons,
	FontAwesome5,
	MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Permissions from "expo-permissions";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as IntentLauncher from "expo-intent-launcher";
import { db } from "../constants/firebase-config";
import { ERRORS } from "../constants/errors";
const { width, height } = Dimensions.get("window");

const uuidv4 = () => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
		c
	) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

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

const renderSavedVehicles = () => {
	const [savedVehicles, setSavedVehicles] = useState([]);
	const [vehicleIds, setVehicleIds] = useState({});
	const [processing, setProcessing] = useState(true);
	const [id, setId] = useState(null);

	useEffect(() => {
		const _retrieveData = async () => {
			const i = await AsyncStorage.getItem("id");
			setId(i);
			db.ref(`savedVehicles/${i}`).on(
				"value",
				(snapshot) => {
					if (snapshot.val() != null) {
						const obj = snapshot.val();
						const ret = {};
						Object.keys(obj).forEach((key) => {
							ret[obj[key]] = key;
						});
						setVehicleIds(ret);
						setSavedVehicles(Object.keys(ret));
						//console.log(ret);
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

	const saveFile = async (filename, data) => {
		const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
		if (status === "granted") {
			let fileUri = FileSystem.documentDirectory + filename + ".html";
			await FileSystem.writeAsStringAsync(fileUri, data, {
				encoding: FileSystem.EncodingType.UTF8,
			});
			const asset = await MediaLibrary.createAssetAsync(fileUri);
			await MediaLibrary.createAlbumAsync("Download", asset, false);
			console.log("Process completed :)");
			setProcessing(false);
			FileSystem.getContentUriAsync(fileUri).then((cUri) => {
				IntentLauncher.startActivityAsync(
					"android.intent.action.VIEW",
					{
						data: cUri.uri,
						flags: 1,
						type: "text/html",
					}
				);
			});
		}
	};

	const handleSearch = (vehicle) => {
		setProcessing(true);
		fetch(
			"http://ec2-18-222-48-197.us-east-2.compute.amazonaws.com/api/" +
				vehicle +
				"/"
		)
			.then((res) => res.text())
			.then((res) => {
				if (ERRORS.find((el) => el == res) == res) {
					setProcessing(false);
					Alert.alert(
						"Error",
						res.slice(4, res.length - 5),
						[
							{
								text: "OK",
								onPress: () => {},
							},
						],
						{ cancelable: true }
					);
				} else saveFile(uuidv4(), res);
			});
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
				colors={["#1CD8D2", "#93EDC7"]}
				style={{
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					paddingTop: 40,
				}}
			>
				{savedVehicles.length ? (
					<FlatList
						showsVerticalScrollIndicator={false}
						keyExtractor={(item, index) => `${item}`}
						data={savedVehicles}
						renderItem={({ item, index }) => {
							const marginBottom =
								index === savedVehicles.length - 1 ? 110 : 16;
							const marginTop = index === 0 ? 25 : 0;
							return (
								<View
									style={{
										...styles.active,
										flexDirection: "row",
										justifyContent: "space-between",
										alignItems: "center",
										flex: 1,
										backgroundColor: "#fff",
										padding: 16,
										marginRight: 8,
										marginLeft: 8,
										borderRadius: 16,
										marginTop,
										marginBottom,
									}}
								>
									<View style={{ width: width * 0.6 }}>
										<Text bold>{item}</Text>
									</View>
									<View
										style={{
											flexDirection: "row",
										}}
									>
										<Button
											transparent
											onPress={() => handleSearch(item)}
											style={{ marginRight: 6 }}
										>
											<Feather
												name="info"
												size={32}
												color="blue"
											/>
										</Button>
										<Button
											transparent
											onPress={() => {
												Alert.alert(
													"Delete Vehicle",
													"Are you sure you want to remove this saved vehicle ?",
													[
														{
															text: "Cancel",
															onPress: () => {},
														},
														{
															text: "Delete",
															onPress: () => {
																setProcessing(
																	true
																);
																savedVehicles.splice(
																	index,
																	1
																);
																db.ref(
																	`savedVehicles/${id}`
																)
																	.child(
																		vehicleIds[
																			item
																		]
																	)
																	.remove()
																	.then(
																		() => {
																			setProcessing(
																				false
																			);
																		}
																	)
																	.catch(
																		(
																			err
																		) => {
																			console.log(
																				"Error"
																			);
																			setProcessing(
																				false
																			);
																		}
																	);
															},
														},
													],
													{ cancelable: false }
												);
											}}
											style={{ marginLeft: 6 }}
										>
											<Feather
												name="trash"
												size={32}
												color="red"
											/>
										</Button>
									</View>
								</View>
							);
						}}
					/>
				) : (
					<View
						style={{
							position: "absolute",
							top: 0,
							bottom: 0,
							right: 0,
							left: 0,
						}}
					>
						<LinearGradient
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							colors={["#1CD8D2", "#93EDC7"]}
							style={{
								flex: 1,
								justifyContent: "space-around",
								alignItems: "center",
							}}
						>
							<FontAwesome5
								name="smile"
								size={152}
								color="white"
							/>
							<Text
								h2
								bold
								white
								center
								style={{
									marginBottom: 32,
									marginHorizontal: 16,
								}}
							>
								You Haven't Saved Any Vehicle Yet
							</Text>
						</LinearGradient>
					</View>
				)}
			</LinearGradient>
			{processing && renderLoading()}
		</View>
	);
};

export default ({ navigation }) => {
	return (
		<Block center middle>
			{renderSavedVehicles()}
			{renderDrawerButton(navigation)}
			{renderBackButton(navigation)}
		</Block>
	);
};

const styles = StyleSheet.create({});
