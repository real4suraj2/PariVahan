import { CommonActions } from "@react-navigation/native";

export const navigationReset = (navigation, route) => {
	navigation.dispatch(
		CommonActions.reset({
			index: 0,
			routes: [{ name: route }],
		})
	);
};
