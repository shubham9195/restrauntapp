/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axiosInstance from '../config/interceptor';
import Header from './Header';
import { Actions } from 'react-native-router-flux';
import Toast from 'react-native-simple-toast';
import { AsyncStorage } from 'react-native';
import{Button} from 'react-native-paper';
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phone: undefined,
      isLoading: false
    };
  }

  componentDidMount() {
    
  }
  
  onChangeText = (key, val) => {
    this.setState({ [key]: val });
  };

  reset = () => {
    this.setState({ isLoading: true });
    const self = this;
    axiosInstance.get(`otp/send?phone=${this.state.phone}`)
      .then(r => {
        if (r.data.type === 'success') {
          axiosInstance
            .post(`/auth/forgot?phone=${self.state.phone}`)
            .then(function(response) {
              self.setState({ isLoading: false });
              Actions.otp({
                mobile: self.state.phone,
                resetToken: response.data.resetToken,
              });
              Toast.showWithGravity('OTP sent', Toast.LONG, Toast.TOP);
            })
            .catch(function(error) { 
              console.log(error);
              Toast.showWithGravity('You\'re not registered with this number', Toast.LONG, Toast.TOP);
              Actions.register();
             });
        } else {
          console.log(r.data);
          Toast.showWithGravity('Error occured', Toast.LONG, Toast.BOTTOM);
        }
      },
      err => {
        console.log('otp error', err);
        Toast.showWithGravity('Error occured', Toast.LONG, Toast.BOTTOM);
        Actions.login();
      });
    // Actions.otp({
    //   phone: '',
    //   resetToken: '',
    //   username: '',
    //   email: '',
    //   password: ''
    // });
  };

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Header showUser={false} />
        </View>
        {
          this.state.isLoading
          ? <ActivityIndicator animating color="#4169e1" size="large" style={styles.activityIndicator} />
          : <View style={{ padding: 15, marginTop: 60 }}>
              <Text style={{ fontSize: 18, color: '#6b6b47', textAlign: 'center' }}>Forgot Password?</Text>
              <Text style={{ fontSize: 12, color: '#6b6b47', alignSelf: 'center' }}>
                Please enter registered mobile number
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                autoCapitalize="none"
                keyboardType={"numeric"}
                maxLength={10}
                
                onChangeText={(val) => this.onChangeText('phone', val)}
              />
              {/* <TouchableOpacity onPressIn={() => this.reset()}>
                <View style={styles.center}>
                  <Text style={styles.LoginText}>Reset Password</Text>
                </View>
              </TouchableOpacity> */}
              <Button  mode="contained" style={{width:'50%',alignSelf:'center'}} onPress={() => this.reset()}>
              Reset Password
  </Button>
            </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    alignSelf: 'stretch',
    color: '#728575',
    margin: 10,
    marginTop: 20,
    padding: 10,
    fontSize: 14,
    borderBottomColor: '#728575',
    borderBottomWidth: 0.5
  },
  center: {
    marginTop: 10,
    alignItems: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2'
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80
  },
  margint100: {
    marginTop: 100
  },
  LoginText: {
    alignItems: 'center',
    width: '75%',
    backgroundColor: '#262626',
    borderRadius: 3,
    color: '#bbc0c4',
    fontSize: 14,
    overflow: 'hidden',
    padding: 8,
    textAlign: 'center'
  }
});
