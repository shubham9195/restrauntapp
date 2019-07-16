/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import axiosInstance from '../config/interceptor';
import { Actions } from 'react-native-router-flux';
import Header from './Header';
import { AsyncStorage } from 'react-native';
import Toast from 'react-native-simple-toast';
export default class extends React.Component {
  state = {
    table_id: '',
    store_id: '',
    tableName: '',
    storeName: '',
    isLoading: false,
    menuButtonText: 'Menu',
    showLogin: false
  };
  constructor(props) {
    super(props);
    if (this.props.search) {
      this.getStore(this.props._id);
    } else {
      this.getTable(this.props._id);
    }
  }

  componentWillMount() {
    this._retrieveData();
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    this.getButtonText();
  }

  _retrieveData = async () => {
    var self = this;
    try {
      const value = await AsyncStorage.getItem('servitor-user');
      if (value === null) {
        this.setState({
          showLogin: true
        });
      }
    } catch (error) {
      // Error retrieving data
    }
  }

  getTable = async (id) => {
    var self = this;
    axiosInstance
      .get('/table/' + id)
      .then(function(response) {
        self.setState({ store_id: response.data.body.storeId, table_id: response.data.body._id, tableName: response.data.body.name });
        self.getStore(self.state.store_id);
      })
      .catch(function(error) {
        // handle error
      })
      .then(function() {
        // always executed
      });
  };

  getButtonText() {
    if (this.props._id) {
      this.setState({
        menuButtonText: 'Menu'
      })
    } else {
      this.setState({
        menuButtonText: 'Scan'
      })
    }
  }

  getStore = async (id) => {
    var self = this;
    axiosInstance
      .get('/store/' + id)
      .then(function(response) {
        self.setState({ isLoading: false });
        self.setState({ storeName: response.data.body.name });
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      })
      .then(function() {
        // always executed
      });
  };

  menu = () => {
    if (this.state.showLogin) {
      Toast.show('Please login to continue ordering', Toast.LONG, Toast.TOP);
      Actions.login();
      return;
    }

    if (this.state.table_id) {
      Actions.menu({ storeId: this.state.store_id, tableId: this.state.table_id });
    } else {
      Actions.ScanScreen();
    }
  };
  render() {
    return (
      <View style={styles.container}>
        <View>
          {this.state.isLoading ? <ActivityIndicator animating color="#4169e1" size="large" style={styles.activityIndicator} /> : null}
        </View>
        <View>
          <Header showUser={!this.state.showLogin} />
        </View>
        <Image source={require('../images/Food.png')} style={styles.backgroundImage} />
        <View style={{ position: 'absolute', top: '35%', justifyContent: 'center', width: '100%' }}>
          <View style={{ backgroundColor: 'rgba(52, 52, 52, 0.8)', margin: 30, minHeight: 100, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontSize: 22, textAlign: 'center', padding: 30 }}>{this.state.storeName}</Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: '#4169e1',
              position: 'absolute',
              left: '41%',
              top: '65%',
              borderRadius: 100,
              height: 60,
              width: 60
            }}
            onPressIn={() => this.menu()}
          >
            <View>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 14,
                  padding: 10,
                  paddingTop: 19,
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                {this.state.menuButtonText}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>{/* <Footer /> */}</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    opacity: 50
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'stretch'
  },
  textMain: {
    color: '#ffffff',
    fontSize: 15
  },
  textSub: {
    fontSize: 24,
    color: '#ffffff'
  },
  menuText: {
    fontSize: 18,
    color: '#CFB53B'
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80
  }
});
