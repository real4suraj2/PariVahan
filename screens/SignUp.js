import React, {useState, useCallback} from 'react';
import {ActivityIndicator, Keyboard, KeyboardAvoidingView, StyleSheet, Alert, TextInput, Dimensions} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import {Block, Text, Button} from 'expo-ui-kit';
import {LinearGradient} from 'expo-linear-gradient';

const {width, height} = Dimensions.get('window');

export default ({navigation})=>{
	const [loading, setLoading] = useState(false);
	const [email,setEmail] = useState('real4suraj2@gmail.com');
	const [password, setPassword] = useState('test123');
	const [confirmPassword, setConfirmPassword] = useState('test123');
	
	
	const renderSignUp = () => {
		return (
		<Block center  middle flex={0.7}>
			<Block  style={styles.inputContainer}>
						  <Text style={styles.label}>Email address</Text>
						  <TextInput
							value={email}
							style={styles.input}
							placeholder="you@email.com"
							onChangeText={value => setEmail(value)}
							/>
			</Block>
			<Block  style={styles.inputContainer}>
						  <Text style={styles.label}>Password</Text>
						  <TextInput
							secureTextEntry
							value={password}
							style={styles.input}
							placeholder="Password"
							onChangeText={value => setPassword(value)}
							/>
			</Block>
			<Block  style={styles.inputContainer}>
						  <Text style={styles.label}>Password</Text>
						  <TextInput
							secureTextEntry
							value={password}
							style={styles.input}
							placeholder="Confirm Password"
							onChangeText={value => setConfirmPassword(value)}
							/>
			</Block>
			<Block  style={styles.inputContainer}>
						<Button  onPress={()=>Alert.alert('Signing Up successful')}>
							<Text center bold white>Sign Up</Text>
						</Button>
			</Block>
		</Block>
		);
		}

	return (
		<KeyboardAvoidingView behavior="padding" style={{flex : 1, justifyContent : 'center', backgroundColor : 'white'}} keyboardVerticalOffset = {-28}>
					<LinearGradient
						start = { { x : 0.5, y : 1} }
						end = {{ x : 0.5, y : 0}}
						colors = {["#0AC4BA","#2BDA8E"]}
						style={{flex : 1}}
						>	
						<Block center middle>
							{renderSignUp()}
						</Block>
						<Block bottom center flex={false} style={{marginBottom : 16, paddingRight : 16, paddingLeft : 16}}>
							<Button onPress={()=> navigation.goBack()} transparent> 
								<Text white style={{textDecorationLine : 'underline'}}>Login Instead </Text>
							</Button>
						</Block>
					</LinearGradient>
		</KeyboardAvoidingView>
	);
	}
	
const styles = StyleSheet.create({
		label : {
			fontSize : 12,
			color : '#fff',
			fontWeight : 'bold'
			},
		inputContainer : {
				width : width * 0.8,
				flex : 0,
				marginBottom : 32
			},
		input: {
				borderColor: 'rgba(255,255,255,0.8)',
				color : '#fff',
				borderRadius: 6,
				borderBottomWidth: StyleSheet.hairlineWidth,
				fontSize: 20,
				padding: 12,
		}
	});