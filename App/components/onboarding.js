import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Picker
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  Title,
  Button,
  Surface,
  TouchableRipple,
  Divider,
  List,
  Card,
  Appbar,
  Paragraph,
  IconButton,
  Caption
} from "react-native-paper";
import Swiper from "react-native-swiper";
import { Actions } from "react-native-router-flux";
var PopularRestraunts = [];
var NearbyRestraunts = [];
export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
   
    return (
      <View style={styles.container}>
      <Swiper loop={false} height={200} horizontal={true} showsPagination={true}>
            <View style={{ flex: 1,alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
            <Image source = {require('../images/Group1.png')} />
            <Title style={{paddingVertical:50}}>ORDER VIA THE APP</Title>
            <Caption style={{fontSize:20,textAlign:'center'}}>Just some thoughts about the onboarding Screens</Caption>
            </View>
            
            <View style={{ flex: 1,alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
            <Image source = {require('../images/Group2.png')} />
            <Title style={{paddingVertical:50}}>ORDER VIA THE APP</Title>
            <Caption style={{fontSize:20,textAlign:'center'}}>Just some thoughts about the onboarding Screens</Caption>
            </View>
           
            <View style={{ flex: 1,alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
            <Image source = {require('../images/Group3.png')} />
            <Title style={{paddingVertical:50}}>ORDER VIA THE APP</Title>
            <Caption style={{fontSize:20,textAlign:'center'}}>Just some thoughts about the onboarding Screens</Caption>
            <View style={{bottom:0,marginVertical:10}}>
            <Button mode="contained"  onPress={() => {
            Actions.home()
          }}>Get Started</Button>
            </View>
            </View>
           
           
          </Swiper>
       
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
 
});
