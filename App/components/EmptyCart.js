/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import Header from './Header';
import cloneDeep from 'lodash/cloneDeep';
import axiosInstance from '../config/interceptor';
import Toast from 'react-native-simple-toast';
import { AsyncStorage } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const emptycart = <FontAwesome5 name={'utensils'} size={100} color="#495057" light />;
import { Card,Caption,Title,Paragraph,Button,Divider,List } from 'react-native-paper';
import { Actions } from 'react-native-router-flux'



export default class extends React.Component {
  state = {
    cartData: [],
    isLoading: false,
    page: 0,
    price: 0,
    additionalInfo: '',
    userId: '',
    isRefreshing: false,
    counter: 0
  };
  constructor(props) {
    super(props);
    
  }
 

  render() {
    return (
      <View style={styles.container}>
       <Text style={{width:200,height:200,borderWidth:5,borderColor:'grey',borderRadius:100,padding:50,justifyContent:'center'}}>{emptycart}</Text>

       <Title style={{fontSize:28,padding:50}}>Your Cart is empty.</Title>
       <Caption style={{fontSize:20,paddingHorizontal:50,paddingVertical:20,textAlign:'center'}}>Looks like you haven't made your menu yet</Caption>
       <Button   style={{marginTop:50}}mode="contained" onPress={() => Actions.home()}>
    EXPLORE RESTAURANTS
  </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    alignContent:'center',
    justifyContent:'center'
    
  },
});
