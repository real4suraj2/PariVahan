import { AsyncStorage } from "react-native";

export const clearStorage = async () => {
	await AsyncStorage.clear();
};
