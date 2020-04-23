import React from 'react';
import {StyleSheet, Alert} from 'react-native';
import {Block, Text, Button} from 'expo-ui-kit';
import {Feather, Ionicons, FontAwesome5, MaterialIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';


export default ({navigation}) => {
	return(
		<Block center middle> 
			<Block flex={0.8} middle>
				<Text h1 bold> History </Text>
			</Block>
			<Block middle flex={0.2}>
				<Block row flex={false}>
					<LinearGradient start={{x : 0, y : 0}} end={{x : 1, y : 1}} colors={["#0AC4BA","#2BDA8E"]} style={[styles.tabContainer]}>
						<Button transparent onPress={()=> navigation.jumpTo("SearchBoard")}> 
							<MaterialIcons name="location-searching" size={54} color="white"/>
						</Button>
					</LinearGradient>
					<LinearGradient start={{x : 0, y : 0}} end={{x : 1, y : 1}} colors={["#0AC4BA","#2BDA8E"]} style={[styles.tabContainer, styles.active]}>
						<Button transparent onPress={()=> Alert.alert("Already on History")}> 
							<FontAwesome5 name="history" size={45} color="white"/>
						</Button>
					</LinearGradient>
				</Block>
			</Block>
		</Block>
	);
	}
	
const styles = StyleSheet.create({
	tabContainer : {
			width : 72,
			height : 72,
			borderRadius : 72,
			justifyContent : 'center',
			alignItems : 'center',
			margin : 15
		},
	active : {
			shadowColor: 'rgba(0, 0, 0, 0.1)',
			shadowOpacity: 0.8,
			elevation: 6,
			shadowRadius: 15 ,
			shadowOffset : { width: 1, height: 13},
		}
	});