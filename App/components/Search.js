/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback, List, ScrollView, ActivityIndicator, SafeAreaView, Button, TextInput, FlatList } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Actions } from 'react-native-router-flux';
import { AsyncStorage } from 'react-native';
import axiosInstance from '../config/interceptor';
import Toast from 'react-native-simple-toast';
import Dimensions from 'Dimensions';
const cart = <FontAwesome5 name={'shopping-cart'} size={20} color="#ffffff" />;
const user = <FontAwesome5 name={'user-circle'} size={18} color="#ffffff" solid />;
export default class extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    results: []
  };


  searchForDishes(name) {
    if (name.length > 2) {
      setTimeout(() => {
        axiosInstance.get(`menu/list?search=${name}`)
        .then(res => {
          this.setState({
            results: res.data.body
          });
        })
      }, 600);
    }
  }

  goToStore(_id) {
    Actions.menu({storeId: _id, search: true})
  }
  
  render() {
    return (
      <View>
        <TextInput
          onChangeText={(text) => this.searchForDishes(text)}  
          placeholder="Search for dishes"></TextInput> 
        {
          this.state.results && this.state.results.length
          ? 
            <FlatList
              keyExtractor={item => item._id} 
              data={this.state.results}
              renderItem={({item}) => 
                <TouchableWithoutFeedback onPressIn={() => this.goToStore(item.storeId._id)}>
                  <View>
                    <Text style={{fontSize: 20}} key={item._id}>{item.description}</Text>
                    <Text>Rs. {item.price}</Text>
                    <Text>{item.storeId.name}</Text>
                  </View>
                </TouchableWithoutFeedback>
            }></FlatList>
          : null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    backgroundColor: '#f2f2f2'
  },
  bodyContainer: {
    height: Dimensions.get('window').height - 120,
    borderRadius: 10,
    position: 'relative'
  },
  textMain: {
    color: '#2e2e1f'
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    height: 80
  },
  textSub: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    color: '#4169e1'
  },
  textGreen: {
    fontSize: 14,
    alignItems: 'center',
    position: 'absolute',
    marginLeft: 'auto',
    marginRight: 'auto',
    left: '20%',
    bottom: 0,
    color: '#4169e1'
  }
});
