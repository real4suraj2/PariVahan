import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Alert,
	TouchableOpacity,
	Modal,
	Dimensions,
	TextInput,
	View,
	StatusBar,
	AsyncStorage,
	Keyboard,
	ActivityIndicator,
} from "react-native";
import { Block, Text, Button } from "expo-ui-kit";
import {
	Feather,
	Ionicons,
	FontAwesome5,
	FontAwesome,
	MaterialIcons,
	MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as IntentLauncher from "expo-intent-launcher";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

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

export default ({ navigation }) => {
	const [hasPermission, setPermissions] = useState(null);
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(true);
	const [type, setType] = useState(null);
	const [processing, setProcessing] = useState(false);
	const [selectionType, setSelectionType] = useState(false);

	useEffect(() => {
		async function getPermission() {
			const { status: cameraPerm } = await Permissions.askAsync(
				Permissions.CAMERA
			);
			const { status: cameraRollPerm } = await Permissions.askAsync(
				Permissions.CAMERA_ROLL
			);

			setPermissions(
				cameraPerm === "granted" && cameraRollPerm === "granted"
			);
		}
		getPermission();

		// async function clearStorage() {
		// 	await AsyncStorage.clear();
		// }
		// clearStorage();
	}, []);

	const handleImageSearch = async (uri) => {
		setProcessing(true);
		let resizedPhoto = await ImageManipulator.manipulateAsync(
			uri,
			[
				{
					resize: {
						width: 500,
					},
				},
			],
			{
				compress: 0.7,
				format: "jpeg",
			}
		);
		let name = uuidv4();
		let localUri = resizedPhoto.uri;
		let filename = localUri.split("/").pop();
		let match = /\.(\w+)$/.exec(filename);
		let type = match ? `image/${match[1]}` : `image`;
		let formData = new FormData();
		formData.append("image", {
			uri: localUri,
			name: name,
			type,
		});
		fetch(
			"http://ec2-18-222-48-197.us-east-2.compute.amazonaws.com/api/image/",
			{
				method: "POST",
				body: formData,
				headers: {
					"content-type": "multipart/form-data",
				},
			}
		)
			.then((res) => res.text())
			.then((text) => {
				// console.log(text);
				if (ERRORS.find((el) => text == el) == text) {
					Alert.alert(
						"Error",
						text.slice(4, text.length - 5),
						[
							{
								text: "OK",
								onPress: () => {},
							},
						],
						{ cancelable: true }
					);
				} else saveFile(name, text);
				setProcessing(false);
			});
	};

	const handlePicture = async (option) => {
		let photo = null;
		const capturePicture = async () => {
			photo = await ImagePicker.launchCameraAsync({
				allowsEditing: true,
			});
		};
		const selectPicture = async () => {
			photo = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				quality: 1,
			});
		};
		if (option === "click") await capturePicture();
		else await selectPicture();
		if (photo == null || photo.uri == undefined) return;
		else handleImageSearch(photo.uri);
	};

	const renderSelectionType = () => {
		return (
			<Modal
				visible={selectionType}
				onRequestClose={() => setSelectionType(false)}
				animationType="slide"
			>
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
						colors={["#c2e59c", "#64b3f4"]}
						style={{
							flex: 1,
							justifyContent: "space-around",
							alignItems: "center",
						}}
					>
						{renderBackButton()}
						<TouchableOpacity
							style={{
								backgroundColor: "transparent",
								justifyContent: "center",
								alignItems: "center",
							}}
							onPress={() => {
								setSelectionType(false);
								handlePicture("click");
							}}
						>
							<MaterialCommunityIcons
								name="camera-enhance"
								size={54}
								color="white"
							/>
							<Text h2 strong white>
								Click
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={{
								backgroundColor: "transparent",
								justifyContent: "center",
								alignItems: "center",
							}}
							onPress={() => {
								setSelectionType(false);
								handlePicture("browse");
							}}
						>
							<MaterialCommunityIcons
								name="folder-image"
								size={54}
								color="white"
							/>
							<Text h2 strong white>
								Browse
							</Text>
						</TouchableOpacity>
					</LinearGradient>
				</View>
			</Modal>
		);
	};

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
		console.log(vehicle);
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

	const renderInput = () => {
		return (
			<Block center middle>
				<Block flex={false}>
					<TextInput
						value={text}
						style={styles.input}
						autoCapitalize="characters"
						placeholder="Vehicle No."
						onChangeText={(value) => {
							setText(value);
						}}
					/>
				</Block>
				<Block flex={false} padding={16}>
					<Button
						onPress={() => {
							setProcessing(true);
							Keyboard.dismiss();
							const val = text.trim().toUpperCase();
							setText("");
							if (
								val.length != 10 ||
								val[0] != "M" ||
								val[1] != "P"
							)
								return Alert.alert(
									"Error",
									"Please Enter A Valid MP Vehicle Number",
									[
										{
											text: "OK",
											onPress: () => setProcessing(false),
										},
									],
									{ cancelable: false }
								);
							const _serve = async () => {
								try {
									await AsyncStorage.setItem(
										val,
										new Date().toLocaleDateString()
									);
								} catch (err) {
									console.log("Error");
								}
							};
							_serve();
							handleSearch(val);
						}}
						style={{
							width: 0.7 * width,
							backgroundColor: "#fff",
							...styles.active,
						}}
					>
						<Text center bold>
							Search
						</Text>
					</Button>
				</Block>
			</Block>
		);
	};

	const renderBackButton = () => {
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
					onPress={() => setType()}
					style={{ width: 30, height: 30 }}
				>
					<Ionicons name="ios-arrow-back" size={32} color="white" />
				</TouchableOpacity>
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

	const renderSelection = () => {
		if (type == "Camera")
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
						colors={["#00c6ff", "#0072ff"]}
						style={{ flex: 1, justifyContent: "center" }}
					>
						{renderBackButton()}
						<TouchableOpacity
							style={{
								backgroundColor: "transparent",
								justifyContent: "center",
								alignItems: "center",
							}}
							onPress={() => setSelectionType(true)}
						>
							<Feather name="camera" size={54} color="white" />
						</TouchableOpacity>
					</LinearGradient>
					{renderSelectionType()}
				</View>
			);
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
					colors={["#FF4E50", "#F9D423"]}
					style={{ flex: 1 }}
				>
					{renderBackButton()}
					{renderInput()}
				</LinearGradient>
			</View>
		);
	};

	const renderButtons = () => {
		return (
			<Block bottom style={{ top: -15 }}>
				<Block row flex={false}>
					<LinearGradient
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						colors={["#0AC4BA", "#2BDA8E"]}
						style={[styles.tabContainer, styles.active]}
					>
						<Button transparent onPress={() => {}}>
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
						style={styles.tabContainer}
					>
						<Button
							transparent
							onPress={() => navigation.jumpTo("History")}
						>
							<FontAwesome5
								name="history"
								size={45}
								color="white"
							/>
						</Button>
					</LinearGradient>
				</Block>
			</Block>
		);
	};

	const renderOptions = () => {
		return (
			<View
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					right: 0,
					left: 0,
					flexDirection: "row",
				}}
			>
				<LinearGradient
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					colors={["#00c6ff", "#0072ff"]}
					style={{ flex: 1 }}
				>
					<TouchableOpacity
						style={{
							flexDirection: "column",
							backgroundColor: "transparent",
							flex: 1,
						}}
						onPress={() => setType("Camera")}
					>
						<View
							style={{
								justifyContent: "center",
								alignItems: "center",
								flex: 1,
							}}
						>
							<Feather name="camera" size={54} color="white" />
							<Text h1 strong white>
								Camera
							</Text>
						</View>
					</TouchableOpacity>
				</LinearGradient>
				<LinearGradient
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					colors={["#FF4E50", "#F9D423"]}
					style={{ flex: 1 }}
				>
					<TouchableOpacity
						style={{
							flexDirection: "column",
							backgroundColor: "transparent",
							flex: 1,
						}}
						onPress={() => setType("Text")}
					>
						<View
							style={{
								justifyContent: "center",
								alignItems: "center",
								flex: 1,
							}}
						>
							<MaterialIcons
								name="input"
								size={54}
								color="white"
							/>
							<Text h1 strong white>
								Text
							</Text>
						</View>
					</TouchableOpacity>
				</LinearGradient>
			</View>
		);
	};

	const renderLoading = () => (
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

	return (
		<Block center middle>
			{type == null ? renderOptions() : renderSelection()}
			{renderDrawerButton()}
			{renderButtons()}
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
		shadowColor: "rgba(0, 0, 0, 0.3)",
		shadowOpacity: 0.8,
		elevation: 6,
		shadowRadius: 15,
		shadowOffset: { width: 1, height: 13 },
	},
	options: {
		flex: 1,
		height: height,
	},
	input: {
		borderColor: "#fff",
		width: 0.7 * width,
		color: "#fff",
		borderRadius: 6,
		borderBottomWidth: StyleSheet.hairlineWidth,
		fontSize: 20,
		padding: 12,
	},
});
