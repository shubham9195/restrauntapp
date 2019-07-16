/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { 
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  CheckBox,
  ScrollView
} from 'react-native';
import axiosInstance from '../config/interceptor';
import axios from 'axios';
import Header from './Header';
import Toast from 'react-native-simple-toast';
import { Actions } from 'react-native-router-flux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import{Button, Surface } from 'react-native-paper'

export default class extends React.Component {
  state = {
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    isLoading: false,
    firstname: '',
    lastname: '',
    policies: false
  };
  onChangeText = (key, val) => {
    if (key != 'mobile') {
      this.setState({ [key]: val });
    } else {
        this.setState({ [key]: val });
    }
  };

  checkAvailibily(field, focus) {
    let val = '';
    if (field === 'mobile') {
      if (focus) this.passwordInput.focus();
      val = this.state.mobile;
    } else if (field === 'email') {
      if (focus) this.mobileInput.focus();
      val = this.state.email;
    }
    if (val.length > 0) {
      axiosInstance
      .get('user/list', {
        params: {
          search: val
        }
      })
      .then(
        r => {
          if (r.data.body.length > 0) {
            Toast.show(this.capitalizeFirstLetter(field) + ' is already registered', Toast.LONG, Toast.TOP);
          }
        },
        err => console.log(err)
      )
    }
  }

  capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  signUp = () => {
    if (!this.state.firstname) {
      Toast.showWithGravity('Firstname is required', Toast.LONG, Toast.BOTTOM);
    } else if (!this.state.lastname) {
      Toast.showWithGravity('Lastname is required', Toast.LONG, Toast.BOTTOM);
    }else  if (!this.state.mobile) {
      Toast.showWithGravity('Mobile Number  is required', Toast.LONG, Toast.BOTTOM);
    } else if (!this.state.password) {
      Toast.showWithGravity('Password required', Toast.LONG, Toast.BOTTOM);
    } else if (!this.state.confirmPassword) {
      Toast.showWithGravity('Confirm Password required', Toast.LONG, Toast.BOTTOM);
    } else if (this.state.password != this.state.confirmPassword) {
      Toast.showWithGravity('Password Does not Matches', Toast.LONG, Toast.BOTTOM);
    } else if (!this.state.policies) {
      Toast.show('You need to accept Terms and Conditions', Toast.SHORT, Toast.TOP);
    } else {
      this.setState({ isLoading: true });
      axiosInstance.get(`otp/send?phone=${this.state.mobile}`)
      .then(r => {
        this.setState({isLoading: false});
        if (r.data.type === 'success') {
          Actions.otp({
            email: this.state.email,
            mobile: this.state.mobile,
            password: this.state.password,
            firstname: this.state.firstname,
            lastname: this.state.lastname
          });
        } else {
          console.log(r.data)
          Toast.showWithGravity('Error occured', Toast.LONG, Toast.BOTTOM);
        }
      },
      err => {
        console.log('register error', err);
        Toast.showWithGravity('Error occured', Toast.LONG, Toast.BOTTOM);
        Actions.login();
      }); 
    }
    // Actions.otp();
  };

  _scrollToInput (reactNode) {
    // Add a 'scroll' ref to your ScrollView
    this.scroll.props.scrollToFocusedInput(reactNode)
  }

  render() {
    return (
        <ScrollView keyboardShouldPersistTaps="handled">
        <View>
          <Header showUser={false} pageName = {'Registration'}/>
        </View>
        {/* <KeyboardAwareScrollView> */}
          {
            this.state.isLoading
            ? <ActivityIndicator animating color="#4169e1" size="large" style={styles.activityIndicator} />
            : 
            
               <KeyboardAvoidingView>
                <TextInput 
                  style={styles.input}
                  placeholder="Firstname"
                  autoCapitalize="none"
                  onChangeText={(val) => this.onChangeText('firstname', val)}
                  onSubmitEditing={() => { this.lastnameInput.focus()}}
                  returnKeyType= { "next" }
                  blurOnSubmit={false}
                />
                <TextInput
                  ref={(input) => this.lastnameInput = input}
                  style={styles.input}
                  placeholder="Lastname"
                  autoCapitalize="none"
                  onChangeText={(val) => this.onChangeText('lastname', val)}
                  onSubmitEditing={() => { this.emailInpit.focus() }}
                  returnKeyType= { "next" }
                  blurOnSubmit={false}
                />
                <TextInput
                  ref={(input) => this.emailInpit = input}
                  style={styles.input}
                  placeholder="Email"
                  autoCapitalize="none"
                  onChangeText={(val) => this.onChangeText('email', val)}
                  onSubmitEditing={() => { this.checkAvailibily('email', true) }}
                  returnKeyType= { "next" }
                  blurOnSubmit={false}
                  onBlur={() => this.checkAvailibily('email', false)}
                />
                <TextInput
                  ref={(input) => this.mobileInput = input}
                  style={styles.input}
                  placeholder="Mobile Number"
                  keyboardType="numeric"
                  autoCapitalize="none"
                  onChangeText={(val) => this.onChangeText('mobile', val)}
                  onSubmitEditing={() => { this.checkAvailibily('mobile', true) }}
                  returnKeyType= { "next" }
                  blurOnSubmit={false}
                  onBlur={() => this.checkAvailibily('mobile', false)}
                />
                <TextInput
                  ref={(input) => this.passwordInput = input}
                  style={styles.input}
                  keyboardType="numeric"
                  maxLength={4}
                  placeholder="4 Digit Pin"
                  secureTextEntry={true}
                  autoCapitalize="none"
                  onChangeText={(val) => this.onChangeText('password', val)}
                  onSubmitEditing={() => { this.confirmPasswordInput.focus() }}
                  returnKeyType= { "next" }
                  blurOnSubmit={false}
                />
                <TextInput
                  ref={(input) => this.confirmPasswordInput = input }
                  style={styles.input}
                  keyboardType="numeric"
                  maxLength={4}
                  placeholder="Confirm 4 Digit Pin"
                  secureTextEntry={true}
                  autoCapitalize="none"
                  onChangeText={(val) => this.onChangeText('confirmPassword', val)}
                  // onSubmitEditing={() => this.signUp()}
                  returnKeyLabel="Submit"
                />
                <View style={{ flexDirection: 'row', marginLeft: 10 ,marginTop:30 ,height: '7%'}}>
                  <CheckBox
                    value={this.state.policies}
                    onValueChange={() => this.setState({ policies: !this.state.policies })}
                  />
                  <Text style={{ marginTop: 6 }}>I agree to 
                    <Text onPress={() => Actions.terms()} style={{fontWeight: 'bold', textDecorationLine: 'underline',textAlign:'center',alignSelf:'center'}}>
                       {' '}Terms of service and Privacy polices.
                    </Text>
                  </Text>
                </View>
                 <Button mode="contained" style={{width:'50%',alignSelf:'center',marginVertical:70}} onPress={() => this.signUp()}>Register</Button>
              </KeyboardAvoidingView>
              
          }
        {/* </KeyboardAwareScrollView> */}
        
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
    marginTop: 10,
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
  },
  surface: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    margin:35,
    alignSelf:'center'
  },

});
