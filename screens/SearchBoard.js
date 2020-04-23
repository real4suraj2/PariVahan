import React, {useState, useEffect} from 'react';
import {StyleSheet, Alert, TouchableOpacity, Modal, Dimensions} from 'react-native';
import {Block, Text, Button} from 'expo-ui-kit';
import {Feather, Ionicons, FontAwesome5,FontAwesome, MaterialIcons, MaterialCommunityIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';


const {width, height} = Dimensions.get('window');

export default ({navigation}) => {
	const [hasPermission, setPermissions] = useState(null);
	const [useCamera, setUseCamera] = useState(false);
	useEffect(()=>{
		async function getPermission(){
			const { status } = await Permissions.askAsync(Permissions.CAMERA);
			setPermissions(status === "granted");
		}
		getPermission();
	},[]);
	
	const renderCamera = () => {
		let camera = null;
		const takePicture = async () => {
			  if (camera) {
				let photo = await camera.takePictureAsync();
				FileSystem.copyAsync({
					from : photo.uri,
					to : `${FileSystem.documentDirectory}a.jpg`
					}).then( ()=>setUseCamera(false) );
			  }
		}
		if (hasPermission === null) {
		  return <Block />;
		} else if (hasPermission === false) {
		  return <Text>No access to camera</Text>;
		} else {
		  return (
			  <Modal visible={useCamera} onRequestClose={()=>setUseCamera(false)} animationType="slide">
					<Block>
						<Camera style={{ flex: 1}} type={Camera.Constants.Type.back} ref={ref => { camera = ref }} >
							 <Block row color="transparent" flex={1} style={{margin : 20}}>
								  <TouchableOpacity style={{flex : 1,  alignSelf: 'flex-end', alignItems: 'flex-start', backgroundColor: 'transparent'}}>
										<Ionicons name="ios-photos" style={{ color: "#fff", fontSize: 40}} />
								  </TouchableOpacity>
								  <TouchableOpacity style={{flex : 2, position : 'absolute', bottom : 0, left : (width /2) - 40 }}
										onPress={()=>takePicture()}
								  >
										<FontAwesome name="camera" style={{ color: "#fff", fontSize: 40}}/>
								  </TouchableOpacity>
							</Block>
						</Camera>
					</Block>
			</Modal>
		  );		
		}
	}
	return(
		<Block center middle> 
			<Block flex={0.8} middle>
				<TouchableOpacity
					style={{
					  alignSelf: 'center',
					  alignItems: 'center',
					  backgroundColor: 'transparent',
					}}
					onPress={()=>setUseCamera(true)}
					>
							<FontAwesome
								name="camera"
								style={{ color: "#fff", fontSize: 40}}
							/>
				  </TouchableOpacity>
			</Block>
			<Block middle flex={0.2}>
				<Block row flex={false}>
					<LinearGradient start={{x : 0, y : 0}} end={{x : 1, y : 1}} colors={["#0AC4BA","#2BDA8E"]} style={[styles.tabContainer,styles.active]}>
						<Button transparent onPress={()=> Alert.alert('Already on SearchBoard')}> 
							<MaterialIcons name="location-searching" size={54} color="white"/>
						</Button>
					</LinearGradient>
					<LinearGradient start={{x : 0, y : 0}} end={{x : 1, y : 1}} colors={["#0AC4BA","#2BDA8E"]} style={styles.tabContainer}>
						<Button transparent onPress={()=> navigation.jumpTo("History")}> 
							<FontAwesome5 name="history" size={45} color="white"/>
						</Button>
					</LinearGradient>
				</Block>
			</Block>
			{renderCamera()}
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
			shadowColor: 'rgba(0, 0, 0, 0.3)',
			shadowOpacity: 0.8,
			elevation: 6,
			shadowRadius: 15 ,
			shadowOffset : { width: 1, height: 13},
		}
	});