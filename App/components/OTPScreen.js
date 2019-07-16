/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator, PermissionsAndroid ,ScrollView} from 'react-native';
import axiosInstance from '../config/interceptor';
import Header from './Header';
import Toast from 'react-native-simple-toast';
import { Actions } from 'react-native-router-flux';
import SmsListener from 'react-native-android-sms-listener';
import OTPInputView from 'react-native-otp-input'
import TimerCountdown from "react-native-timer-countdown";
import CodeInput from './CodeInput';
import {Button} from "react-native-paper"
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      otp: undefined,
      username: this.props.username,
      email: this.props.email,
      mobile: this.props.mobile,
      password: this.props.password,
      timer: 3000 * 60,
      firstname: this.props.firstname,
      lastname: this.props.lastname
    };
  }

  componentDidMount() {
    // this.requestReadSmsPermission();
    // let smsListerner = SmsListener.addListener(message => {
    //   console.log('message', typeof message.body);
    //   if (message.originatingAddress.includes('SRVTOR')) {
    //     console.log('inside');
    //     let smsOtp = Number(message.body.split(' ').pop());
    //     console.log(smsOtp);
    //     this.setState({
    //       otp: smsOtp.toString()
    //     });
    //     this.submitOtp();
    //   }
    //   smsListerner.remove();
    // });
  }

  // async requestReadSmsPermission() {
  //   try {
  //     var granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.READ_SMS, {
  //         title: 'Auto Verification OTP',
  //         message: 'need access to read sms, to verify OTP'
  //       }
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       // alert('READ_SMS permissions granted', granted);
  //       console.log('READ_SMS permissions granted', granted);
  //       granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.RECEIVE_SMS, {
  //           title: 'Receive SMS',
  //           message: 'Need access to receive sms, to verify OTP'
  //         }
  //       );
  //       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //         // alert('RECEIVE_SMS permissions granted', granted);
  //         console.log('RECEIVE_SMS permissions granted', granted);
  //       } else {
  //         // alert('RECEIVE_SMS permissions denied');
  //         console.log('RECEIVE_SMS permissions denied');
  //       }
  //     } else {
  //       // alert('READ_SMS permissions denied');
  //       console.log('READ_SMS permissions denied');
  //     }
  //   } catch (err) {
  //     // alert(err);
  //     console.log(err);
  //   }
  // }

  submitOtp = () => {
    this.setState({
      isLoading: true
    })
    if (this.state.otp && this.state.otp.length < 4) {
      Toast.showWithGravity('Please enter full OTP', Toast.LONG, Toast.BOTTOM);
    } else if (!this.state.otp) {
      Toast.showWithGravity('Please enter otp', Toast.LONG, Toast.BOTTOM);
    }
    let reqUrl = '';
    if (this.props.resetToken) {
      reqUrl = `otp/verify?phone=${this.state.mobile}&otp=${this.state.otp}&reset=true`
    } else {
      reqUrl = `otp/verify?phone=${this.state.mobile}&otp=${this.state.otp}`
    }
    
    axiosInstance.get(reqUrl)
    .then(res => {
      if (res.data.type === 'success') {
        if (this.props.resetToken) {
          Actions.forgotpass({
            phone: this.state.mobile,
            resetToken: this.props.resetToken
          });
        } else if (res.data.message === 'already_verified') {
          this.registerUser();
        } else {
          this.registerUser();
        }
      } else {
        Toast.showWithGravity('Wrong OTP. Try again', Toast.LONG, Toast.BOTTOM);
        this.setState({ isLoading: false});
      }
    })
  }

  registerUser = () => {
    var self = this;
    axiosInstance
        .post('/user/post', {
          username: this.state.username,
          email: this.state.email,
          mobile: this.state.mobile,
          password: this.state.password,
          firstname: this.state.firstname,
          lastname: this.state.lastname
        })
        .then(function(response) {
          self.setState({ isLoading: false });
          Toast.showWithGravity('User Registered Please Login', Toast.LONG, Toast.BOTTOM);
          Actions.login();
        })
        .catch(function(error) {
          console.log('register user error',error);
          if(error.response.data.message){
            Toast.showWithGravity(error.response.data.message, Toast.LONG, Toast.BOTTOM);
            self.setState({ isLoading: false });
          } else if(error.response.data.code == 11000){
            Toast.showWithGravity('User Already Exist', Toast.LONG, Toast.BOTTOM);
            self.setState({ isLoading: false });
          } else {
            Toast.showWithGravity('Some Error Occured', Toast.LONG, Toast.BOTTOM);
            self.setState({ isLoading: false });
          }
        });
  }

  resendOTP = () => {
    axiosInstance
      .get('otp/resend')
      .then(r => {
        if (r.data.type === 'success') {
          Toast.showWithGravity('OTP successfully resent', Toast.LONG, Toast.BOTTOM);
          // this.setState({
          //   timer: 3000 * 60
          // });
        } else {
          Toast.showWithGravity('Error occured. Please try again after sometime.', Toast.LONG, Toast.BOTTOM);
        }
      })
      .catch(err =>  console.log(err));
  }

  codeFilled = () => {

  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View>
          <Header showUser={false} />
        </View>
        {
          // Have some text instead of loader her
          this.state.isLoading
          ? <ActivityIndicator animating color="#4169e1" size="large" style={styles.activityIndicator} />
          : <View style={{flexDirection: 'column', flex: 1, justifyContent: 'center',margin:25}}>
              <Text style={{flex: 1, alignSelf: 'center', marginTop: 25,textAlign:'center'}}>A 4 digit verification code has been sent to {this.state.mobile}</Text>
              {/* <OtpInputs 
                handleChange={code => this.setState({otp: code})} /> */}
              {/* <OTPInputView
                pinCount={4}
                code={this.state.otp}
                onCodeFilled = {(code => {
                  console.log('code is', code);
                  this.setState({
                    otp: code
                  });
                })}
                style={{flex: 1, margin: 15}}
              /> */}
              <CodeInput
                secureTextEntry
                autoFocus={false}
                activeColor='rgba(49, 180, 4, 1)'
                inactiveColor='rgba(49, 180, 4, 1.3)'
                space={9}
                codeLength={4}
                keyboardType="numeric"
                size={50}
                inputPosition='left'
                onFulfill={(code) => this.setState({otp: code})}
                containerStyle={{ flex: 1, alignSelf: 'center' }}
                codeInputStyle={{ borderWidth: 1.5 }}
                activeColor="blue"
                className="border-circle"
                code={this.state.otp}
                
              />
              {/* <Text style={{flex: 1, alignSelf: 'center', color: 'blue'}} onPress={() => this.setState({ otp: undefined })}>Clear</Text> */}
              <Text onPress={() => this.resendOTP()} style={{color: '#4169e1',alignSelf:'center',fontSize:20,padding:25}}>Resend OTP</Text>
            
             {/* <Text style={{flex: 1, alignSelf: 'center'}}>OTP sent will be valid for: </Text> */}
              {/* <TimerCountdown
                initialMilliseconds={this.state.timer}
                style={{flex: 1, alignSelf: 'center', color: 'blue', fontSize: 18}} 
              /> */}
              {/* <TouchableOpacity style={{flex: 1}} onPressIn={() => this.submitOtp()}>
                <View style={styles.center}>
                  <Text style={styles.LoginText}>Verify</Text>
                </View>
              </TouchableOpacity> */}
                <Button style={{marginTop:20}} mode="contained" uppercase={false} onPress={() => this.submitOtp()}>
    Verify
  </Button>
              <View style={{ alignItems: 'center', marginBottom: 25}}>
                {/* <Text>Didn't receive OTP.</Text> */}
                {/* <Text onPress={() => this.resendOTP()} style={{color: '#4169e1'}}>Click here to resend.</Text> */}
              </View>
            </View>
        }
        
      </ScrollView>
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
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2'
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
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    top: 50
  }
});
