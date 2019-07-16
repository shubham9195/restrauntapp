/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { View, Button, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axiosInstance from '../config/interceptor';
import Header from './Header';
import { Actions } from 'react-native-router-flux';
import Toast from 'react-native-simple-toast';
import { AsyncStorage } from 'react-native';
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: undefined,
      confirmpassword: undefined,
      isLoading: false,
      resetToken: this.props.resetToken,
    };
  }

  componentDidMount() {
    
  }
  
  onChangeText = (key, val) => {
    this.setState({ [key]: val });
  };

  reset = () => {
    const self = this;
    this.setState({ isLoading: true });
    const resetToken = this.state.resetToken;
    if (self.state.password === self.state.confirmpassword) {
      axiosInstance
      .post('/user/reset', {
        password: self.state.password,
        resetToken,
      })
      .then(function(response) {
        self.setState({ isLoading: false });
        Toast.showWithGravity('Password reset successfully. Please login.', Toast.LONG, Toast.TOP);
        Actions.login();
      })
      .catch(function(error) {
        console.log('reset error', error);
      });
    } else {
      Toast.showWithGravity('Both passwords should match', Toast.LONG, Toast.BOTTOM);
    }
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

                <TextInput
                  style={styles.input}
                  placeholder="Enter new 4 digit Pin"
                  autoCapitalize="none"
                  secureTextEntry={true}
                  keyboardType='numeric'
                  maxLength={4}
                  onChangeText={(val) => this.onChangeText('password', val)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="confirm your 4 digit pin"
                  autoCapitalize="none"
                  secureTextEntry={true}
                  keyboardType='numeric'
                  maxLength={4}
                  onChangeText={(val) => this.onChangeText('confirmpassword', val)}
                />
                <TouchableOpacity onPressIn={() => this.reset()}>
                  <View style={styles.center}>
                    <Text style={styles.LoginText}>Reset Password</Text>
                  </View>
                </TouchableOpacity>
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
    backgroundColor: '#1C47A3',
    borderRadius: 3,
    color: '#ffff',
    fontSize: 14,
    overflow: 'hidden',
    padding: 8,
    textAlign: 'center'
  }
});
