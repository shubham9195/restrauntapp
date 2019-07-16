/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, TouchableOpacity,BackHandler } from 'react-native';
import Footer from './Footer';
import Header from './Header';
import { Actions } from 'react-native-router-flux';
import { AsyncStorage } from 'react-native';
import Toast from 'react-native-simple-toast';
import axiosInstance from '../config/interceptor';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Divider, Surface, Title, Button, Avatar, IconButton, Paragraph } from 'react-native-paper';
const visited = <FontAwesome5 name={'glass-martini-alt'} size={24} color="green" />;
const favourites = <FontAwesome5 name={'gratipay'} size={24} color="#f50057" />;
const history = <FontAwesome5 name={'history'} size={24} color="blue" />;
const restaurants = <FontAwesome5 name={'utensils'} size={24} color="#FF6F61" />;
const pending = <FontAwesome5 name={'list-alt'} size={24} color="gold" />;
const chevronbtn = <FontAwesome5 name={'chevron-right'} size={20} color="#1C47A3" />;
const logout = <FontAwesome5 name={'sign-out-alt'} size={24} color="brown" />;
const password = <FontAwesome5 name={'key'} size={24} color="purple" />;





export default class extends React.Component {
  state = {
    userId: '',
    username: '',
    email: '',
    mobile: '',
    redirectPayNowPage: false,
    isLoading: false,
    firstname: '',
    lastname: ''
  };

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.home()
      return true;
      });
    console.disableYellowBox = true;
    this._retrieveData();
    this.setState({ isLoading: true });
  }
  pending = async () => {
    Actions.pendingorders({
      userId: this.state.userId
    });
  }

  goToOrders = async () => {
    if (this.state.userId) {
      Actions.orders({ userId: this.state.userId, paynow: this.state.redirectPayNowPage });
    }
  };
  goToChangePassword = async () => {
    Actions.changePassword({ userId: this.state.userId, paynow: this.state.redirectPayNowPage });
  };
  goToVisitedRestaurants = async () => {
    Actions.visitedRestaurants({ userId: this.state.userId, paynow: this.state.redirectPayNowPage });
  };
  returnFooter() {
    if (this.state.redirectPayNowPage == true) {
      return <Footer camera="false" />;
    } else {
      return <Footer />;
    }
  }
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('servitor-user');
      if (value !== null) {
        this.setState({ userId: value });
        this.getUser(value);
        this.getOrder(value);
      } else {
        Actions.home();
      }
    } catch (error) {
      // Error retrieving data
      Actions.home();
    }
  };
  getUser(id) {
    var self = this;
    axiosInstance
      .get('/user/' + id)
      .then(function (response) {
        self.setState({ username: response.data.body.username });
        self.setState({ email: response.data.body.email });
        self.setState({ mobile: response.data.body.mobile });
        self.setState({ isLoading: false });
        self.setState({ firstname: response.data.body.firstname, lastname: response.data.body.lastname })
      })
      .catch(function (error) {
        console.log('profile error', error);
        self.setState({ isLoading: false });
      });
  }
  getOrder = async (id) => {
    var self = this;
    axiosInstance
      .get('order/list', {
        params: {
          userId: id,
          status: 'order-initiated',
          perPage: 0
        }
      })
      .then(function (response) {
        if (response.data.body.length > 0) {
          self.setState({ redirectPayNowPage: true });
          self.setState({ isLoading: false });
        }
      })
      .catch(function (error) {
        // handle error
      })
      .then(function () {
        // always executed
      });
  };
  signOut = async () => {
    AsyncStorage.clear();
    Actions.login();
  };

  gotoConstruction() {
    Toast.showWithGravity('Stay tuned 😀 we are under construction', Toast.LONG, Toast.CENTER);
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.headContainer}>
          <Avatar.Icon size={110} icon="person" color='grey' style={{ backgroundColor: '#eee' }} />
          <Text style={styles.textSub}>{this.state.firstname + ' ' + this.state.lastname}</Text>
        </View>
        <View>
          {this.state.isLoading ? <ActivityIndicator animating color="#4169e1" size="large" style={{ marginTop: 15 }} />
           :           
          <View>
        {/* <TouchableOpacity onPress={() => this.gotoConstruction()}>
        <Surface style={styles.surface}>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', padding: 10, alignItems: 'center' }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              {favourites}
              <Text style={{ marginLeft: 25, fontWeight: '500', fontSize: 20, width:'100%'}}>Favourites</Text>
            </View>
            <Text >{chevronbtn}</Text>
          </View>
          </Surface>
          </TouchableOpacity> */}
          <TouchableOpacity onPress={() => this.goToVisitedRestaurants()}>
          <Surface style={styles.surface}>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', padding: 10, alignItems: 'center' }}>
            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
              {visited}
              <Text style={{ marginLeft: 25, fontWeight: '500', fontSize: 20, width:'100%' }}>Visited Restaurants</Text>
            </View>
            {chevronbtn}
          </View>
          </Surface>
          </TouchableOpacity>
          <TouchableOpacity 
              onPress={() => this.pending()}
              >
          <Surface style={styles.surface}>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', padding: 10, alignItems: 'center' }}>
            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
              {pending}
              <Text style={{ marginLeft: 25, fontWeight: '500', fontSize: 20, width:'100%' }}>Order Updates</Text>
            </View>
            {chevronbtn}
          </View>
          </Surface>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.goToOrders()}>
          <Surface style={styles.surface}>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', padding: 10, alignItems: 'center' }}>
            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
              {history}
              <Text style={{ marginLeft: 25, fontWeight: '500', fontSize: 20, width:'100%' }}>Order History</Text>
            </View>
            {chevronbtn}
          </View>
          </Surface>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=> this.goToChangePassword()} >
          <Surface style={styles.surface}>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', padding: 10, alignItems: 'center' }}>
            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
              {password}
              <Text style={{ marginLeft: 25, fontWeight: '500', fontSize: 20, width:'100%' }}>Change Password</Text>
            </View>
            {chevronbtn}
          </View>
          </Surface>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.signOut()}>
          <Surface style={styles.surface}>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', padding: 10, alignItems: 'center' }}>
            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
              {logout}
              <Text style={{ marginLeft: 25, fontWeight: '500', fontSize: 20, width:'100%' }}>Log Out</Text>
            </View>
            {chevronbtn}
          </View>
          </Surface>
          </TouchableOpacity>
         </View>    
          }
        </View>
        <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>{this.returnFooter()}</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  bodyContainer: {
    padding: 20
  },
  headContainer: {
    alignItems: 'center',
    backgroundColor: '#1C47A3',
    padding: 50
  },
  textMain: {
    fontSize: 25,
    color: '#2e2e1f'
  },
  textSub: {
    paddingTop: 10,
    fontSize: 22,
    color: '#ffffff'
  },
  textSubMain: {
    fontSize: 16,
    padding: 2,
    color: '#ffffff'
  },
  textHead: {
    paddingLeft: 15,
    paddingTop: 10,
    fontSize: 18,
    color: '#2e2e1f'
  },
  textGreen: {
    fontSize: 18,
    color: '#4169e1'
  },
  surface: {
    padding: 15,
    height: 55,
    width: '95%',
    elevation: 0.5,
    alignSelf: 'center',
    borderRadius: 5,
    margin: 6,
    marginHorizontal: 10,
    alignItems: 'center'


  },
});
