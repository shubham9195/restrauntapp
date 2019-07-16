/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const icon = <FontAwesome5 name={'angle-left'} size={18} color="#ffffff" />;
const user = <FontAwesome5 name={'user-circle'} size={18} color="#ffffff" solid />;
export default class extends React.Component {
  constructor(props) {
    super(props);
  }

  goBack = async () => {
    Actions.pop();
  };
  goToProfile = async () => {
    if (Actions.currentScene !== 'profile') {
      Actions.profile();
    }
  };

  goToSearch =async () => {
    if(Actions.currentScene!== 'search'){
      Actions.search();
    }
  }
  render() {
    return (
      <View style={{ paddingTop: 12, paddingBottom: 12, backgroundColor: '#1C47A3' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ flex: 1 }} onPressIn={() => this.goBack()}>
            <Text style={{ flex: 1, textAlign: 'left', marginLeft: 10 }}>{icon}</Text>
          </TouchableOpacity>
          {
            !this.props.pageName ? 
            <Text style={{ flex: 1, fontSize: 18, textAlign: 'center', color: '#ffffff' }}>Servitor</Text>
            :
            <Text style={{ flex: 1, fontSize: 18, textAlign: 'center', color: '#ffffff' }}>{this.props.pageName}</Text>


          }
          {
            this.props.showUser
            ? <TouchableOpacity style={{ flex: 1 }} onPressIn={() => this.goToProfile()}>
                <Text style={{ flex: 1, textAlign: 'right', marginRight: 10 }}>{user}</Text>
              </TouchableOpacity>
            : <TouchableOpacity style={{ flex: 1 }} onPressIn={() => this.goToProfile()}>
                <Text style={{ flex: 1, textAlign: 'right', marginRight: 10 }}>{}</Text>
              </TouchableOpacity>
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
