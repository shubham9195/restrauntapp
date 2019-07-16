import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TouchableWithoutFeedback, Image} from 'react-native';
import { Searchbar, Caption, Card, Title, Paragraph, Button } from 'react-native-paper';
import { Actions } from 'react-native-router-flux';
import axiosInstance from '../config/interceptor';
export default class extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    results: []
  };
  componentDidMount() {

  };
  


  render() {
    return (
      <View style={{flex:1}} >
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <View><Image source = {require('../images/icons8-wi-fi.png')} /></View>
        <View style={{marginVertical:50}}>
              <Text style={{textAlign:'center',fontSize:20}}>Oops! No Internet{"\n"} Please Check Your Connection</Text>
        </View>
        <Button mode="contained" onPress={()=>{
                Actions.home()
              }}>Retry</Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({});

