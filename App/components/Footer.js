/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { NetInfo } from 'react-native';
import Toast from 'react-native-simple-toast';
const home = <FontAwesome5 name={'home'} size={24}  />;
const qrcode = <FontAwesome5 name={'qrcode'} size={24} />;
const order = <FontAwesome5 name={'utensils'} size={24}/>
const user = <FontAwesome5 name={'user'} size={24} solid/>;
export default class extends React.Component {
  state = {
    isHome: false,
    isProfile: false,
    isScan: false,
    isOrder:false
  };
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.screenCheck();
  }
  screenCheck() {
    const screen = Actions.currentScene;
    if (screen == 'home') {
      this.setState({ isHome: true });
    } else if (screen == 'profile') {
      this.setState({ isProfile: true });
    } else if (screen == 'ScanScreen') {
      this.setState({ isScan: true });
    } else if(screen =='order'){
      this.setState({isOrder:true})
    }
  }
  scan = async () => {
    if (!this.props.loggedIn) {
      Toast.show('Please login to continue ordering', Toast.LONG, Toast.TOP);
      Actions.login();
      return;
    }
    if (this.props.camera == 'false') {
      Toast.showWithGravity('You have a pending order', Toast.LONG, Toast.BOTTOM);
    } else {
      NetInfo.isConnected.fetch().then((isConnected) => {
        if (isConnected) {
          Actions.ScanScreen();
        } else {
          Toast.showWithGravity('Please Check Your Internet Connection', Toast.LONG, Toast.BOTTOM);
        }
      });
    }
  };

  goToHome() {
    
    if (Actions.currentScene !== 'home') {
      Actions.home();
    }
  }
  order(){
    if(Actions.currentScene!==home){
      if (this.props.camera == 'false') {
        Actions.paynow({ orderId: this.props.orderId })
      } else {
        Actions.emptycart();
      }
    }
  }

  goToProfile() {
    if (Actions.currentScene !== 'profile') {
      if (!this.props.loggedIn) {
        Toast.show('Please login to view profile', Toast.LONG, Toast.TOP);
        Actions.login();
        return;
      } else {
        Actions.profile();
      }
    }
  }

  render() {
    return (
      <View style={{ height: 40, padding: 8, backgroundColor: '#eee' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
          {/* <TouchableOpacity style={{ flex: 1 }}>
            <Text style={this.state.isHome ? styles.colorBLue : styles.colorBlack} onPress={() => this.goToHome()}>{home}</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={{ flex: 1 }} onPressIn={() => this.goToHome()}>
            <Text style={ styles.colorBLue}>{home}</Text>
          </TouchableOpacity>
            

          <TouchableOpacity style={{ flex: 1 }} onPressIn={() => this.scan()}>
            <Text style={ styles.colorBLue}>{qrcode}</Text>
          </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1 }} onPressIn={() => this.order()}>
            <Text style={styles.colorBLue }>{order}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPressIn={() => this.goToProfile()}>
            <Text style={styles.colorBLue}>{user}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  colorBLue: {
    color: '#1C47A3',
    textAlign: 'center'
  },
  colorBlack: {
    color: 'black',
    textAlign: 'center'
  }
});
