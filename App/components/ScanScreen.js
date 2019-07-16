'use strict';

import React, { Component } from 'react';

import { AppRegistry, StyleSheet, Text, TouchableOpacity, Linking, Platform, View ,BackHandler} from 'react-native';
import { Actions } from 'react-native-router-flux';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import FontAwesome5 from 'react-native-vector-icons/Entypo';
import { IconButton, Caption, TextInput, Button } from 'react-native-paper';

export default class extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isTorchOn: false
    }
  }

  onSuccess(e) {
    if (e.data !== '') {
      // Actions.StoreHome({ _id: e.data });
      Actions.menu({tableId: e.data, search: false})
    }
  }

  toggleFlashLight = () => {
    this.setState({
      isTorchOn: !this.state.isTorchOn
    });
  }
  
  componentDidMount() {
    // this.setState({ cartData: this.props.data });
    BackHandler.addEventListener('hardwareBackPress', () => {
    Actions.home()
    return true;
    });
  }
  render() {
    return (
      <View style={{flex: 1}}>
      <QRCodeScanner
        showMarker={true}
        onRead={this.onSuccess.bind(this)}


        topContent={



          <Text style={{ fontSize: 20, flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: '5%'}}>
            Scan <Text style={{ fontWeight: 'bold' }}>QR code </Text>on your Table
          </Text>


        }

        bottomContent={
            <IconButton
              icon={this.state.isTorchOn ? 'flash-on' : 'flash-off'}
              color={'#000'}
              style={{ alignSelf: 'center', marginBottom: '-10%' }}
              size={30}

              onPress={() => this.toggleFlashLight()}
            />
        }

        cameraProps={{ flashMode: this.state.isTorchOn ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off }}
      />
      </View>


    );
  }
}

const styles = StyleSheet.create({
  centerText: {
    flexDirection: 'row',
    flex: 1,
    fontSize: 18,
    height: 180,
    padding: 5,
    color: '#777'
  },


  buttonTouchable: {
    padding: 16,
    height: 180
  }
});
