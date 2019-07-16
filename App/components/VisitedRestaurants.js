/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { NativeModules, StyleSheet, Text, View, LayoutAnimation, FlatList, ActivityIndicator,BackHandler } from 'react-native';
import{List, Divider,Portal,Paragraph, Button,  Headline, Title, Dialog, Caption,Surface,Avatar} from "react-native-paper"
import { Actions } from 'react-native-router-flux';

import Header from './Header';
import axiosInstance from '../config/interceptor';
const { UIManager } = NativeModules;


UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
export default class extends React.Component {
  state = {
    storeData: [],
    isLoading: false,
    page: 0,
    isRefreshing: false,
    modalVisible: false,
    isHidden: true,
    readMoreId: '',
    visible: false,

  };
  

  _showDialog = () => this.setState({ visible: true });

  _hideDialog = () => this.setState({ visible: false });

  storeId;
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.setState({ isLoading: true });
    this.getStore();
    BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.profile()
      return true;
      });
      
  }
 

  handleLoadMore = () => {
    this.setState(
      {
        page: this.state.page + 1
      },
      () => {
        this.getStore();
      }
    );
  };



  getStore = async () => {
    if (this.props.userId) {
      var self = this;
      axiosInstance
        .get('order/visitedRestaurant', {
          params: {
            userId: self.props.userId,
          }
        })
        .then(function(response) {
          self.setState({ isLoading: false });
          self.setState({
            storeData: [...self.state.storeData, ...response.data.body] // assuming response.data is an array and holds new records
          });
        })
        .catch(function(error) {
          self.setState({ isLoading: false });
          // handle error
          console.log('error in getting order' , error);
        })
    }
  };


  render() {
    const { storeData } = this.state;
    return (
      <View style={styles.container}>
        <View>
          <Header showUser={false} pageName = {'Visited Places'}/>
        </View>
        <View style={styles.bodyContainer}>
          <View style={styles.container}>
            {this.state.isLoading ? <ActivityIndicator animating color="#4169e1" size="large" style={styles.activityIndicator} /> : null}
          </View>
          <List.Subheader> Filtered based on your previous experienced </List.Subheader>
          <Divider/>

          <FlatList
          data={this.state.storeData}
          renderItem={({ item, index }) => (       
            <View>
                {
                  item.isVeg ?
                  <Surface style={styles.surface1}>
              <View>
              <Avatar.Image size={28} source={require('../images/foodyicon.png')} />
                <Title style={{color:'#a52a2a',}}>{item.name}</Title>
              </View>
              <View>
              <Title style={{color:'#003300', fontSize: 16, width: '20%'}}>Address :  </Title>
                <Title style={{color:'#696969', fontSize: 14}}>{item.address.replace(/(\r\n|\n|\r)/gm, "")}</Title>
              </View>

              <View style={{ flexDirection: 'row'}}>
              <Title style={{color:'#003300', fontSize: 16, width: '20%'}}>Email :  </Title>
                <Title style={{color:'#696969', fontSize: 14}}>{item.email}</Title>
              </View>

              <View style={{ flexDirection: 'row'}}>
              <Title style={{color:'#003300', fontSize: 16, width: '20%'}}>Contact :  </Title>
                <Title style={{color:'#696969', fontSize: 14}}>{item.number}</Title>
              </View>
              </Surface>
              :
              <Surface style={styles.surface}>
              <View style={{ flexDirection: 'row'}}>
              <Avatar.Image size={28} source={require('../images/foodyicon.png')} />
                <Title style={{color:'#a52a2a', marginLeft: '5%'}}>{item.name}</Title>
              </View>
              <View style={{ flexDirection:'row',flex:1,justifyContent:'space-between',alignSelf:'flex-start'}}>
              <Title style={{color:'#003300', fontSize: 16,}}>Address :  </Title>
                <Title style={{color:'#696969', fontSize: 14}}>{item.address.replace(/(\r\n|\n|\r)/gm, "")}</Title>
              </View>

              <View style={{ flexDirection: 'row'}}>
              <Title style={{color:'#003300', fontSize: 16,}}>Email :  </Title>
                <Title style={{color:'#696969', fontSize: 14}}>{item.email}</Title>
              </View>

              <View style={{ flexDirection: 'row'}}>
              <Title style={{color:'#003300', fontSize: 16,}}>Contact :  </Title>
                <Title style={{color:'#696969', fontSize: 14}}>{item.number}</Title>
              </View>
              </Surface>
                }
            </View>
          )}
        />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    height: 80
  },
  displayNone: {
    height: 0,
    width: 0
  },
  displayFlex: {
    display: 'flex'
  },
  bodyContainer: {
    borderRadius: 2,
    margin: 5,
    padding: 5,
    marginBottom: 100,
    backgroundColor: '#ffffff'
  },

  surface: {
    padding: 8,
    width: '95%',
    backgroundColor: '#fff5f5',
    // justifyContent: 'center',
    alignSelf:'center',
    marginVertical:10,
    elevation: 2,
    borderRadius:1
  },
  surface1: {
    padding: 8,
    width: '95%',
    backgroundColor: '#f7ffe6',
    // justifyContent: 'center',
    alignSelf:'center',
    marginVertical:10,
    elevation: 2,
    borderRadius:1
  },
  textBig: {
    fontSize: 18
  },
  textSmall: {
    color: '#4169e1',
    fontSize: 14
  },
  text: {
    textAlign: 'right',
    color: '#3f2949',
    marginTop: 10
  }
});
