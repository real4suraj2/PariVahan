import React, {useState,useEffect} from 'react';
import {FlatList, Dimensions, Animated, Image, StyleSheet, Modal, ScrollView} from 'react-native';
import {Block, Text, Button} from 'expo-ui-kit';
import {LinearGradient} from "expo-linear-gradient";
import * as Font from 'expo-font';
import {AppLoading} from 'expo';

const {width, height} = Dimensions.get('window');

const scrollX = new Animated.Value(0);

const theme = {
	  sizes : {
		  base: 16,
		  font: 14,
		  radius: 6,
		  padding: 25,
		  h1: 26,
		  h2: 20,
		  h3: 18,
		  title: 18,
		  header: 16,
		  body: 14,
		  caption: 12
		  }
};

 const illustrations =  [
    { id: 1, source: require("../assets/images/cars_1.png") },
    { id: 2, source: require("../assets/images/cars_2.png") },
    { id: 3, source: require("../assets/images/cars_5.png") }];

const fetchFonts = ()=> {
	return Font.loadAsync({
						'playfair-display-bold': require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
						'playfair-display-italic': require('../assets/fonts/PlayfairDisplay-Italic.ttf'),
						'playfair-display-bold-italic': require('../assets/fonts/PlayfairDisplay-BoldItalic.ttf'),
						'playfair-display-extra-bold': require('../assets/fonts/PlayfairDisplay-ExtraBold.ttf'),
						'playfair-display-regular': require('../assets/fonts/PlayfairDisplay-Regular.ttf'),

					});
}

const Welcome = ({navigation})=>{
		const [showTerms, setShowTerms] = useState(false);
		const [loading, setLoading] = useState(true);
		if(loading)
			return <AppLoading
							startAsync={()=> fetchFonts()}
							onFinish= {()=> setLoading(false)}
						/>
	
		 const renderTerms = () => {
			 return (
			 <Modal visible={showTerms} onRequestClose={()=>setShowTerms(false)} animationType="slide">
				<Block
				  padding={[theme.sizes.padding * 2, theme.sizes.padding]}
				  space="between"
				>
				  <Text h2 light>
					Terms of Service
				  </Text>

				  <ScrollView style={{ marginVertical: theme.sizes.padding }}>
					<Text
					  caption
					  bold
					  height={24}
					  style={{ marginBottom: theme.sizes.base }}
					>
					  1. This app is solely managed by the Developer Suraj Patel, 
					  founder and co founder Shrey Gupta  
					</Text>
					<Text
					  caption
					  gray
					  height={24}
					  style={{ marginBottom: theme.sizes.base }}
					>
					  2. Your use of the Service is at your sole risk. The service is
					  provided on an "as is" and "as available" basis.
					</Text>
					<Text
					  caption
					  gray
					  height={24}
					  style={{ marginBottom: theme.sizes.base }}
					>
					  3. You understand that Expo uses third-party vendors and hosting
					  partners to provide the necessary hardware, software, networking,
					  storage, and related technology required to run the Service.
					</Text>
					<Text
					  caption
					  gray
					  height={24}
					  style={{ marginBottom: theme.sizes.base }}
					>
					  4. You must not modify, adapt or hack the Service or modify
					  another website so as to falsely imply that it is associated with
					  the Service, Expo, or any other Expo service.
					</Text>
					<Text
					  caption
					  gray
					  height={24}
					  style={{ marginBottom: theme.sizes.base }}
					>
					  5. You may use the Expo Pages static hosting service solely as
					  permitted and intended to host your organization pages, personal
					  pages, or project pages, and for no other purpose. You may not use
					  Expo Pages in violation of Expo's trademark or other rights or in
					  violation of applicable law. Expo reserves the right at all times
					  to reclaim any Expo subdomain without liability to you.
					</Text>
					<Text
					  caption
					  gray
					  height={24}
					  style={{ marginBottom: theme.sizes.base }}
					>
					  6. You agree not to reproduce, duplicate, copy, sell, resell or
					  exploit any portion of the Service, use of the Service, or access
					  to the Service without the express written permission by Expo.
					</Text>
					<Text
					  caption
					  gray
					  height={24}
					  style={{ marginBottom: theme.sizes.base }}
					>
					  7. We may, but have no obligation to, remove Content and Accounts
					  containing Content that we determine in our sole discretion are
					  unlawful, offensive, threatening, libelous, defamatory,
					  pornographic, obscene or otherwise objectionable or violates any
					  party's intellectual property or these Terms of Service.
					</Text>
					<Text
					  caption
					  gray
					  height={24}
					  style={{ marginBottom: theme.sizes.base }}
					>
					  8. Verbal, physical, written or other abuse (including threats of
					  abuse or retribution) of any Expo customer, employee, member, or
					  officer will result in immediate account termination.
					</Text>
					<Text
					  caption
					  gray
					  height={24}
					  style={{ marginBottom: theme.sizes.base }}
					>
					  9. You understand that the technical processing and transmission
					  of the Service, including your Content, may be transferred
					  unencrypted and involve (a) transmissions over various networks;
					  and (b) changes to conform and adapt to technical requirements of
					  connecting networks or devices.
					</Text>
					<Text
					  caption
					  gray
					  height={24}
					  style={{ marginBottom: theme.sizes.base }}
					>
					  10. You must not upload, post, host, or transmit unsolicited
					  e-mail, SMSs, or "spam" messages.
					</Text>
				  </ScrollView>

				  <Block middle padding={[theme.sizes.base / 2, 0]}>
					<Button
					  gradient
					  onPress={() => setShowTerms(false)}
					>
					  <Text center white>
						I understand
					  </Text>
					</Button>
				  </Block>
				</Block>
			 </Modal>
			 )
			 
			 
			 }
		
		const renderIllustrations = ()=>{
				return(
					<FlatList 
						horizontal
						pagingEnabled
						scrollEnabled
						snapToAlignment="center"
						scrollEventThrottle={16}
						showsHorizontalScrollIndicator={false}
						keyExtractor={(item, index) => `${item.id}`}
						data={illustrations}
						renderItem ={({item})=>(
							<Image 
								source={item.source}
								resizeMode="contain"
								style={{width, height: height/2}}
							/>)}
						onScroll={Animated.event([
											  {
												nativeEvent: { contentOffset: { x: scrollX } }
											  }
											])}
					/>);
			}
		const renderSteps = ()=>{
				const stepPosition = Animated.divide(scrollX, width);
				return (
				  <Block row center middle>
					{illustrations.map((item, index) => {
					  const opacity = stepPosition.interpolate({
						inputRange: [index - 1, index, index + 1],
						outputRange: [0.4, 1, 0.4],
						extrapolate: "clamp"
					  });

					  return (
						<Block
						  animated
						  flex={false}
						  key={`step-${index}`}
						  color="gray"
						  style={[styles.steps, { opacity }]}
						/>
					  );
					})}
				  </Block>
				);
			}
			
		return (
		<Block center color="#fff">
			<Block margin={[24,0]} flex={0.2} middle>
				<Text  h1 color="#0AC4BA" center style={{fontFamily : 'playfair-display-extra-bold'}}>PariVahan</Text>
				<Text gray margin={[10,0,0,0]} style={{fontFamily : 'playfair-display-regular'}}>Getting Vehicle Details 
					{"  "}
					<Text primary style={{fontFamily : 'playfair-display-bold-italic', fontSize: 22}}>Now Easier.</Text></Text>
			</Block>
			<Block flex={0.6} style={{backgroundColor : '#fff'}}>
			{renderIllustrations()}
			{renderSteps()}
			</Block>
			<Block bottom flex={0.2} margin={[0,0,10,0]} padding={6}>
					<LinearGradient start={{x : 0, y : 0}} end={{x : 1, y : 1}} colors={["#0AC4BA","#2BDA8E"]} style={styles.loginButton}>
						<Button transparent onPress={()=> navigation.push("Login")}>
							<Text white bold center> Login </Text>
						</Button>
					</LinearGradient>
				<Button transparent onPress={()=>setShowTerms(true)}>
					<Text gray caption style={{textDecorationLine : 'underline'}} center > Terms of Service </Text>
				</Button>
			</Block>
		{renderTerms()}
		</Block>
		)
	};

export default Welcome;

const styles= StyleSheet.create({
		steps: {
			width: 7,
			height: 7,
			borderRadius: 5,
			marginHorizontal: 2.5
		},
		loginButton : {
			width : width * 0.75,
			borderRadius : 3
			}
	});