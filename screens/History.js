import React, { useEffect, useState, useRef } from "react";
import {
	StyleSheet,
	Alert,
	AsyncStorage,
	FlatList,
	View,
	Dimensions,
	TouchableOpacity,
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

const usePrevious = (value) => {
	const ref = useRef();
	useEffect(() => {
		ref.current = value;
	});
	return ref.current;
};

const uuidv4 = () => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
		c
	) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

const { width, height } = Dimensions.get("window");

export default ({ navigation }) => {
	const [history, setHistory] = useState([]);
	const [processing, setProcessing] = useState(false);
	const [id, setId] = useState(undefined);
	const [token, setToken] = useState(undefined);
	const prevHis = usePrevious(history);

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

	useEffect(() => {
		const _retrieveData = async () => {
			try {
				const res = await AsyncStorage.getAllKeys();
				setHistory(res);
			} catch (err) {
				console.log("Error!!");
			}
		};
		_retrieveData();
	}, [prevHis]);

	useEffect(() => {
		const _retrieveData = async () => {
			try {
				const t = await AsyncStorage.getItem("token");
				const i = await AsyncStorage.getItem("id");
				setToken(t);
				setId(i);
			} catch (err) {
				console.log("Error!!");
			}
		};
		_retrieveData();
	}, []);

	const findVehicle = (list, item) =>
		list != null && list.find((el) => el == item) == item;

	const handleSaveData = (item) => {
		const _retrieveData = () => {
			setProcessing(true);
			db.ref("savedVehicles")
				.child(id)
				.push(item)
				.then(() => {
					setProcessing(false);
					Alert.alert(
						"vehicle Saved",
						"Vehicle Added to your saved list",
						[
							{
								text: "OK",
								onPress: () => {},
							},
						],
						{
							cancelable: true,
						}
					);
				})
				.catch((err) => {
					console.log("Error");
					setProcessing(false);
				});
		};

		db.ref("savedVehicles/" + id).once(
			"value",
			(snapshot) => {
				if (snapshot.val() == null) {
					_retrieveData();
				} else {
					const vehicles = Object.values(snapshot.val());
					if (!findVehicle(vehicles, item)) _retrieveData();
					else {
						Alert.alert(
							"Save Error",
							"Vehicle is already saved",
							[
								{
									text: "OK",
									onPress: () => {},
								},
							],
							{
								cancelable: true,
							}
						);
					}
				}
			},
			(err) => {}
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

	const renderHistory = () => {
		return (
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
					colors={["#7F00FF", "#E100FF"]}
					style={{ flex: 1, paddingTop: 40 }}
				>
					<FlatList
						showsVerticalScrollIndicator={false}
						keyExtractor={(item, index) => `${item}`}
						data={history}
						renderItem={({ item, index }) => {
							if (item === "id" || item === "token") return null;
							const marginBottom =
								index === history.length - 1 ? 110 : 16;
							const marginTop = index === 0 ? 24 : 0;
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
									<TouchableOpacity
										style={{ flex: 0.75 }}
										onPress={() => handleSearch(item)}
									>
										<Text h2>{item}</Text>
									</TouchableOpacity>
									<View
										style={{
											flexDirection: "row",
											flex: 0.25,
											justifyContent: "space-between",
										}}
									>
										<Button
											transparent
											onPress={() => handleSaveData(item)}
										>
											<Feather
												name="save"
												size={32}
												color="blue"
											/>
										</Button>
										<Button
											transparent
											onPress={() => {
												try {
													const _deleteKey = async () => {
														await AsyncStorage.removeItem(
															item
														);
													};
													_deleteKey();
												} catch (err) {
													console.log("error");
												}
												history.splice(index, 1);
											}}
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
				</LinearGradient>
			</View>
		);
	};

	const renderDrawerButton = () => {
		return (
			<View
				style={{
					position: "absolute",
					left: 0,
					top: 0,
					paddingLeft: 16,
					paddingTop: 24,
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

	return (
		<Block center middle>
			{history.length != 2 ? (
				renderHistory()
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
						colors={["#7F00FF", "#E100FF"]}
						style={{
							flex: 1,
							justifyContent: "space-around",
							alignItems: "center",
						}}
					>
						<FontAwesome5 name="smile" size={152} color="white" />
						<Text h2 bold white style={{ marginBottom: 32 }}>
							No recent Searches found
						</Text>
					</LinearGradient>
				</View>
			)}
			<Block bottom style={{ top: -15 }}>
				<Block row flex={false}>
					<LinearGradient
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						colors={["#0AC4BA", "#2BDA8E"]}
						style={[styles.tabContainer]}
					>
						<Button
							transparent
							onPress={() => navigation.jumpTo("SearchBoard")}
						>
							<MaterialIcons
								name="location-searching"
								size={54}
								color="white"
							/>
						</Button>
					</LinearGradient>
					<LinearGradient
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						colors={["#0AC4BA", "#2BDA8E"]}
						style={[styles.tabContainer, styles.active]}
					>
						<Button transparent onPress={() => {}}>
							<FontAwesome5
								name="history"
								size={45}
								color="white"
							/>
						</Button>
					</LinearGradient>
				</Block>
			</Block>
			{renderDrawerButton()}
			{processing && renderLoading()}
		</Block>
	);
};

const styles = StyleSheet.create({
	tabContainer: {
		width: 72,
		height: 72,
		borderRadius: 72,
		justifyContent: "center",
		alignItems: "center",
		margin: 15,
	},
	active: {
		shadowColor: "rgba(0, 0, 0, 0.1)",
		shadowOpacity: 0.8,
		elevation: 6,
		shadowRadius: 15,
		shadowOffset: { width: 1, height: 13 },
	},
});
