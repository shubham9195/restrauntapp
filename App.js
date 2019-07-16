/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, SafeAreaView, View,AsyncStorage } from 'react-native';
import { DefaultTheme,  Provider as PaperProvider } from 'react-native-paper';
import Routes from './App/config/routes';
import SplashScreen from 'react-native-splash-screen';
import { Actions } from 'react-native-router-flux';

const theme = { 
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1C47A3'
  }
}


export default class App extends Component {

  

  async componentDidMount() {
    const userId = await AsyncStorage.getItem('servitor-user');
    SplashScreen.hide();
    if(!userId){
      return(Actions.onboarding())
    }else{
      return(
      Actions.home());
    }
    
  }
 
  render() {
    return (
      <PaperProvider theme={theme}>
        <View style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <Routes />
          </SafeAreaView>
        </View>
      </PaperProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4F6D7A'
  }
});
