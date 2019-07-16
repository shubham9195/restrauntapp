/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator,BackHandler } from 'react-native';
import axiosInstance from '../config/interceptor';
import Header from './Header';
import Toast from 'react-native-simple-toast';
import { Actions } from 'react-native-router-flux';
import { Button } from 'react-native-paper';
export default class extends React.Component {
  state = {
    currentPassword: '',
    newPassword: ''
  };
  onChangeText = (key, val) => {
    this.setState({ [key]: val });
  };
  updatePassword = () => {
    var self = this;
    if (!this.state.currentPassword) {
      Toast.showWithGravity('Your Current Pin is Required', Toast.LONG, Toast.BOTTOM);
    } else if (!this.state.newPassword) {
      Toast.showWithGravity('New Pin required', Toast.LONG, Toast.BOTTOM);
    } else {
      this.setState({ isLoading: true });
      axiosInstance
        .put('/user/updatePassword/'+this.props.userId ,{
          currentPassword: self.state.currentPassword,
          newPassword: self.state.newPassword
        })
        .then(function(response) {
          self.setState({ isLoading: false });
          Toast.showWithGravity('Pin Updated Sucessfully', Toast.LONG, Toast.BOTTOM);
          Actions.profile();
        })
        .catch(function(error) {
          self.setState({isLoading: false})
          Toast.showWithGravity('Some thing went wrong' + error.response.data.message, Toast.LONG, Toast.BOTTOM);
        });
    }
  };

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.profile()
      return true;
  });
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Header showUser={false} />
        </View>
        <View>
          {this.state.isLoading ? <ActivityIndicator animating color="#4169e1" size="large" style={styles.activityIndicator} /> : null}
        </View>
        <View style={{ padding: 15, marginTop: 40 }}>
          <Text style={{ fontSize: 18, color: '#6b6b47', textAlign: 'center' }}>Pin Updation</Text>
          <TextInput
            style={styles.input}
            keyboardType={"numeric"}
            maxLength={4}
            secureTextEntry={true}
            placeholder="Current Pin"
            autoCapitalize="none"
            onChangeText={(val) => this.onChangeText('currentPassword', val)}
          />
          <TextInput
            style={styles.input}
            placeholder="New Pin"
            secureTextEntry={true}
            autoCapitalize="none"
            keyboardType={"numeric"}
            maxLength={4}
            onChangeText={(val) => this.onChangeText('newPassword', val)}
          />
          {/* <TouchableOpacity onPressIn={() => this.updatePassword()}>
            <View style={styles.center}>
              <Text style={styles.LoginText}>Update Password</Text>
            </View>
          </TouchableOpacity> */}
          <Button mode="contained"  uppercase={false} onPress={() => this.updatePassword()} style={{width:'50%',alignSelf:'center',marginTop:20}}>
          Update Pin
          </Button>
        </View>
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
  activityIndicator: {
    flex: 1,
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80
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
  }
});
