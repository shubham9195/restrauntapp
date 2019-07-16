/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList,ScrollView, AsyncStorage, Button, BackHandler} from 'react-native';
import Footer from './Footer';
import Toast from 'react-native-simple-toast';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import { Actions } from 'react-native-router-flux';
import { Card,Caption,Title,Paragraph,IconButton,Divider,List,Chip } from 'react-native-paper';
const binocular = <FontAwesome5 name={'binoculars'} size={66} color="#4169E1" solid />;
import cloneDeep from 'lodash/cloneDeep';

import axiosInstance from '../config/interceptor';
const cart = <FontAwesome5 name={'shopping-cart'} size={20} color="#ffffff" />;

const user = <FontAwesome5 name={'user-circle'} size={18} color="#ffffff" solid />;
const star = <FontAwesome5 name={'star'} size={20} color="gold" solid/>
const money =<FontAwesome5 name={'dollar-sign'} size={20} color="grey" solid/>
const clock =<FontAwesome5 name={'clock'} size={20} color="grey" solid/>
const location =<Entypo name={'location'} size={20} color="#FF2626" solid/>
const heart =<FontAwesome5 name={'heart'} size={24} color="#FF2626"/>
const solidHeart =<FontAwesome5 name={'heart'} size={24} color="#FF2626" solid/>


export default class Nearby extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    nearby: this.props.restos,
    isNearby: this.props.nearby,
    headingText: '',
    favs: 'empty'
  };
  backCount = 0;

  _retriveData = async () => {
    return await AsyncStorage.getItem('myFav');
  }

  async componentDidMount() {
    tempData = cloneDeep(this.state.nearby)  
    const val = await this._retriveData();
    if(val) {
      this.setState({
        favs: val,
        nearby: tempData
      })
    }
 
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.backCount++;
      setTimeout(() => {
        this.backCount=0;
      },1000);
      if (this.backCount == 2) {
          BackHandler.exitApp();
      } else {
        Toast.show('Press back again to exit!', Toast.SHORT, Toast.TOP);
        return true;
      }
  });

    if (this.props.nearby) {
      this.setState({
        headingText: 'Nearby'
      });
    } else {
      this.setState({
        headingText: 'All Resturants'
      });
    }
  };
   async favUpdate(item, index, update) {
    let value = await AsyncStorage.getItem('myFav')
    tempData = cloneDeep(this.state.nearby)  

        if(!update) {
            await AsyncStorage.setItem('myFav', value.replace(this.props.restos.body[index]._id, '') ).then( () => {
              tempData = cloneDeep(this.state.nearby)  
              tempData.body[index].isFav = false              
             this.setState({favs: value.replace(this.props.restos.body[index]._id, ''),  nearby: tempData});
        }) 
        } else {
          await AsyncStorage.setItem('myFav', value+ ',' + this.props.restos.body[index]._id).then( () => {
            tempData = cloneDeep(this.state.nearby)  
            tempData.body[index].isFav = true              
            this.setState({favs: value+ ',' + this.props.restos.body[index]._id,  nearby: tempData});
          })
        }

  }

  render() {
    return (
      <ScrollView style={styles.container}>

          <List.Subheader style={{fontWeight:'600'}}>{this.state.headingText}</List.Subheader>

          {
            this.state.isNearby
            ? <View>
                {
                  this.state.nearby.body && this.state.nearby.length > 0
                  ? <Text style={{padding:10 }}>{this.state.nearby.totalCount} resturant(s) availible around you</Text>
                  : <Text style={{padding:10 }}>No resturants found near you.</Text>
                }
              </View>
            : null
          }

          <FlatList
            data={this.state.nearby.body}
            renderItem={({ item, index }) => (

              <Card 
                onPress={()=>Actions.menu({storeId: item._id, search: true, order: this.props.order, storeName: item.name})}
              >



                <Card.Content>
                 <View style={{flex: 1, flexDirection: 'row'}}>
                 <Title style={{ fontSize: 20 }}>{item.name}</Title>
                 {
                     !this.state.favs.includes(item._id) ? 
                     <TouchableOpacity style={{position: 'absolute', right: 10}} onPress= {() => {this.favUpdate(item, index, true)}}>{heart}</TouchableOpacity>
                    : <TouchableOpacity style={{position: 'absolute', right: 10}} onPress= {() => {this.favUpdate(item, index, false)}}>{solidHeart}</TouchableOpacity>

                 }
                </View>

                  {/* <Caption>{item.cuisine + ' '}</Caption> */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}>
                    {item.cuisine.map(c => <Chip>{c}</Chip>)}
                  </View>

            
              {/* <TouchableOpacity onPressIn={() => Actions.StoreHome({_id: item._id, search: true})}> */}

                 <Card.Cover
              source={{
                uri:
                  "https://images.pexels.com/photos/1268558/pexels-photo-1268558.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              }}
            />


                {/* <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}> */}
                  {/* {
                    item.cuisine
                    ? item.cuisine.map(c => <Text style={{ flex: 1 }}>{c}</Text>)
                    : null
                  } */}
                  {/* {
                    item.cuisine.map((c, index) => <Text key={index} style={{ flex: 1 }}>{c}</Text>)
                  } */}
                {/* </View> */}
            {/* </TouchableOpacity> */}

              </Card.Content>

              <Divider
            style={{
              borderBottomWidth: 2,
              marginHorizontal: 25,
              marginTop: 5,
              borderBottomColor: "#eee"
            }}
          />
           <View style={{ flexDirection: "row", paddingHorizontal:10, }}>
            {/* <View style={{ flex: 1, flexDirection: "row", padding: 10,justifyContent:'space-around' }}>
              <Text>{star}</Text>
              <Caption>4.5/5.0</Caption>
            </View>
            <View style={{ flex: 1, flexDirection: "row", padding: 10,justifyContent:'space-around' }}>
              <Text>{clock}</Text>
              <Caption>15 to 20 mins</Caption>
            </View>
            <View style={{ flex: 1, flexDirection: "row", padding: 10,justifyContent:'space-around' }}>
              <Text>{money}</Text>
              <Caption>Rs 1000 for 2</Caption>
            </View> */}
            <View style={{ flex: 1, flexDirection: "row", justifyContent:'flex-start', marginTop: 15 }}>
              <Text>{location }</Text>
              <Caption style={{ fontWeight: 'bold' }}>{' ' + item.address}</Caption>
            </View>
          </View>
                  </Card>
            )}
            keyExtractor={item => item._id}
            onRefresh={this.props.refreshAction}
          />
          {/* {
            !this.state.nearby.body.length
            ? <View style={{ justifyContent: 'center' }}>
                <Text>We couldn't find anything like that</Text>
                <Text>{binocular}</Text>
              </View>
            : null
          } */}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    backgroundColor: '#f2f2f2',
    // padding: 5
  },
  bodyContainer: {
    // height: Dimensions.get('window').height - 120,
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
  resturantName: {
    fontSize: 20
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
