/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, BackHandler,Image ,ScrollView} from 'react-native';
import { Actions } from 'react-native-router-flux';
import axiosInstance from '../config/interceptor';
import Toast from 'react-native-simple-toast';
import { AsyncStorage } from 'react-native';
import OtpInputs from 'react-native-otp-inputs'
import{Button } from 'react-native-paper'

export default class extends React.Component {
  state = {
    username: '',
    password: '',
    isLoading: false,
    email: ''
  };
  backCount=0;
  constructor(props) {
    super(props);
    this._retrieveData();
  }
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.backCount++;
      setTimeout(() => {
        this.backCount=0;
      },1000);
      if (this.backCount == 2) {
          BackHandler.exitApp();
      } else {
        Toast.show('Press back again to exit!', Toast.SHORT, Toast.TOP);
        return true;
      }
  });
  }
  _retrieveData = async () => {
    self = this;
    try {
      const value = await AsyncStorage.getItem('servitor-token');
      if (value !== null) {
        Actions.home();
        return '';
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  onChangeText = (key, val) => {
    this.setState({ [key]: val });
  };
  login = async () => {
    var self = this;
    let email = this.state.username;
    let password = this.state.password;
    if (!email) {
      Toast.showWithGravity('Mobile or email is required', Toast.LONG, Toast.BOTTOM);
    } else if (!password) {
      Toast.showWithGravity('Password required', Toast.LONG, Toast.BOTTOM);
    } else {
      this.setState({ isLoading: true });
      axiosInstance
        .post('/auth/login', {
          email: email,
          password: password
        })
        .then(function(response) {
          self.setState({ isLoading: false });
          Toast.showWithGravity('Succesfully Logged in', Toast.LONG, Toast.TOP);
          self._storeData(response.data.token);
          self._storeData2(response.data.user);
          axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.token;
          axiosInstance.defaults.headers.post['Authorization'] = 'Bearer ' + response.data.token;
          axiosInstance.defaults.headers.get['Authorization'] = 'Bearer ' + response.data.token;
          Actions.home();
        })
        .catch(function(error) {
          console.log('login error', error);
          self.setState({ isLoading: false });
          if (error.response) {
            Toast.showWithGravity(error.response.data.message, Toast.LONG, Toast.BOTTOM); 
          } else {
            Toast.showWithGravity('Something went wrong. Please tryagain later', Toast.LONG, Toast.BOTTOM);
          }
        });
    }
  };
  _storeData = async (token) => {
    try {
      await AsyncStorage.setItem('servitor-token', token);
    } catch (error) {
      // Error saving data
      console.log('async error', error);
    }
  };

  _storeData2 = async (user) => {
    try {
      await AsyncStorage.setItem('servitor-user', user._id);
    } catch (error) {
      // Error saving data
    }
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        
          
            {/* <Text style={{ fontSize: 45, textAlign: 'center', color: '#4169e1' }}>Servitor</Text> */}
            <Image
          source={require('../images/logo.jpeg')}
          style={{width:'100%',top:-100}}
          resizeMode="contain"

        />
        <View style={{marginTop:-170,marginHorizontal:30}}>



            {this.state.isLoading ? <ActivityIndicator animating color="#4169e1" size="large" style={styles.activityIndicator} /> : null}
          
          {
            !this.state.isLoading
            ? 
            
            <TextInput
                style={styles.formInput}
                placeholder="Mobile Number"
                keyboardType={'numeric'}
                maxLength={10}
                autoCapitalize="none"
                onChangeText={(val) => this.onChangeText('username', val)}
              />
            : null
          }
          {
            !this.state.isLoading
            ? 
            // <TextInput
            //     style={styles.formInput}
            //     placeholder="Password"
            //     keyboardType={'numeric'}
            //     maxLength={4}
            //     secureTextEntry={true}
            //     autoCapitalize="none"
            //     onChangeText={(val) => this.onChangeText('password', val)}
            //   />
            <OtpInputs
            style={{width:'50%'}}
            handleChange={(val) => this.onChangeText('password', val)} numberOfInputs={4} secureTextEntry={true}
            
            />
            : null
          }
          {
            !this.state.isLoading

            ? 
            <View style={{marginVertical:30}}>
            {/* <TouchableOpacity onPressIn={() => this.login()}>
                <View style={styles.center}>
                  <Text style={styles.LoginText}>Login</Text>
                </View>
              </TouchableOpacity> */}
              <Button mode="contained" onPress={() => this.login()}>Login</Button>
              </View>
            : null
          }
          {
            !this.state.isLoading
            ? 
            // <TouchableOpacity>
            //     <Text style={styles.forgotPasswordText} onPress={() => Actions.forgot()}>
            //       Forgot Password
            //     </Text>
            //   </TouchableOpacity>
            <Button mode="outlined" uppercase={false} style={{width:'70%',alignSelf:'center'}}onPress={() => Actions.forgot()}>Forgot Password</Button>

            : null
          }
          {
            !this.state.isLoading
            ? 
            // <TouchableOpacity>
            //     <Text style={styles.registerText} onPress={() => Actions.register()}>
            //       New user Register Here
            //     </Text>
            //   </TouchableOpacity>
            <Button mode="text" uppercase={false} onPress={() => Actions.register()}>New user Register Here</Button>

            : null
          }
          </View>
          {
            !this.state.isLoading
            ? <TouchableOpacity>
                <Text style={styles.registerText} onPress={() => Actions.home()}>
                  Skip and Explore
                </Text>
              </TouchableOpacity>
            : null
          }
          <TouchableOpacity>
            <View style={{bottom:0,marginVertical:20}}>
              <Text style={{ textAlign: 'center' }}>
                By logging in agree to Servitors
                <Text onPress={() => Actions.terms()} style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}>
                 {' '}Terms of service and Privacy polices
                </Text>
              </Text>
            </View>
          </TouchableOpacity>
        
        </ScrollView>
      
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 10,
    
    backgroundColor: '#f2f2f2',
    opacity: 50
    
  },
  bodyContainer: {
    width: '100%',
    flex: 1,
    height: '100%',
    marginTop: '35%'
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    marginTop: 15
  },
  center: {
    marginTop: 10,
    alignItems: 'center'
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
  },
  bottomText: {
    fontSize: 12,
    color: '#728575',
    margin: 5,
    position: 'absolute',
    bottom: '5%',
    left: 0,
    right: 0,
    width: '100%',
    // marginTop: 50,
    justifyContent: 'center',
    textAlign: 'center'
  },
  forgotPasswordText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight:'bold',
    color:'purple',
    justifyContent:'space-around',
    
    
  },
  registerText: {
    textAlign: 'center',
    fontSize: 16,
    paddingTop: 5,
    fontWeight:'bold'
  },
  formInput: {
    height: 40,
    alignSelf: 'stretch',
    color: '#728575',
    margin: 10,
    marginTop: '15%',
    fontSize: 14,
    padding: 10,
    borderBottomColor: '#728575',
    borderBottomWidth: 0.5,
    
  }
});
