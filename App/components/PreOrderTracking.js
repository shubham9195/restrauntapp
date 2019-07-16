/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
// In this module we will track where is the user and send it to the kitchen for beeing aware of preparing order 

import React, {Component} from 'react';
import {Text, View, PermissionsAndroid, StyleSheet, Dimensions,Platform, BackHandler} from 'react-native';
import Polyline from '@mapbox/polyline';
import Toast from 'react-native-simple-toast';
const { width, height } = Dimensions.get('screen')
import getDirections from 'react-native-google-maps-directions'
import { db } from '../../Firebase';
import  {_, map, tail, times, uniq } from 'lodash';
import axiosInstance from '../config/interceptor';
import { Surface, Divider,Button,ActivityIndicator,Dialog,Paragraph } from 'react-native-paper';
import Header from './Header'
import { Actions } from 'react-native-router-flux';
const isIOS = Platform.OS === 'ios';


export default class PreOrderTracking extends Component {
   destLat =  0          //12.9109;  location of lalbag add the restaurant location
   destLong =  0             // 77.6432;
   startLat = 0;
   startLong = 0;
   vars;
   userId;
   StoreId;
   orderId;
   backCount=0
   constructor(props) {
     super(props);
     this.vars = props
     this.state = {
       coordinates : []
     }
     this.StoreId = this.props.storeId;
     this.userId = this.props.userId;
     this.orderId = this.props.orderId;
     this.getDestDirection(this.StoreId);
         
     this.getDirections = this.getDirections.bind(this);
     this.handleGetDirections = this.handleGetDirections.bind(this);
   }


   componentDidMount () {

    BackHandler.addEventListener('hardwareBackPress', () => {
      this.backCount++;
      setTimeout(() => {
        this.backCount=0;
      },1000);
      if (this.backCount == 2) {
          Actions.profile();
      } else {
        Toast.show('Press back again to go back!', Toast.SHORT, Toast.TOP);
        return true;
      }
  });

    console.disableYellowBox = true;
       // for location Permission
       this.getLocationPermission();
   }

   
   getDestDirection (id) {
    axiosInstance
      .get(`store/${id}`)
      .then(res => {
        this.destLat = res.data.body.location.coordinates[0];
        this.destLong = res.data.body.location.coordinates[1]
      })
      .catch(err => {
        console.log('no stores found', err)
      });
  }


   handleGetDirections = () => {
      const data = {
        source : {
          latitude : this.startLat,
          longitude: this.startLong,
        },
        destination : {
          latitude : this.destLat,
          longitude : this.destLong
        },
        params: [
          {
            key : "travelmode",
            value: "driving"
          },
          {
            key: "dir_action",
            value: "navigate"
          }
        ]
      }
      if(this.startLat && this.startLong)
      {
        getDirections(data);
      } else {
        alert('please wait for location')
      }
   }


   sendToFireBase (distance, currentLocation, time) {

       db.collection(this.StoreId).doc(this.orderId).set({  // change abs to store_id, cities to objectID of order ie _id 
        distance: "" + distance ,
        CurrentLocation: ""+ currentLocation,
        ETA : "" + time,
        user_id: "" + this.userId
    })
    .then(function() {
        console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
   }

   async getLocationPermission () {
    try {
            let granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                this.getCurrentLocation();
            }
            else {
              granted = 
              PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
            }
        }
        catch (err) {
            console.log('error in getting location permission' + err)  
        }
   }

   getCurrentLocation () {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.startLat = position.coords.latitude;
        this.startLong = position.coords.longitude;
        this.getDirections ("" + this.startLat + "," + ""+this.startLong, "" + this.destLat + "," + ""+this.destLong);
        this.watchPosition();          // for watching location changes
      },
      (error) => {
        console.log("Error dectecting your location" , error);
        Actions.home();
      },
      {enableHighAccuracy: false, timeout: 150000, maximumAge: 1000}
    );
   }

   watchPosition() {
    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        this.startLat = position.coords.latitude;
        this.startLong = position.coords.longitude;
        this.getDirections ("" + this.startLat + "," + ""+this.startLong, "" + this.destLat + "," + ""+this.destLong);
      },
      (error) => {
        console.log("Error dectecting your location" + error);
        Actions.home();
      },
      {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000}
    );
  }



    async getDirections(startLoc, destinationLoc) {
      try{

           let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${ startLoc }&destination=${ destinationLoc }&key=AIzaSyBYBKSRkWkATTADEO_1pSY8KoeBMDF0dUE`)
           let respJson = await resp.json();

           const response = respJson.routes[0]
           const distanceTime = response.legs[0]
           const destAddress = distanceTime.end_address;
           const startAddress = distanceTime.start_address; // current location

           const distance = distanceTime.distance.text // estimated time

           const time = distanceTime.duration.text
           
           
           // sending to the firebase on user moves
           this.sendToFireBase(distance , startAddress, time);


           let points = Polyline.decode(respJson.routes[0].overview_polyline.points);

           let coords = points.map((point, index) => {
               return  {
                   latitude : point[0],
                   longitude : point[1]
               }
           });
           const newCoords = [...this.state.coordinates, coords];
           this.setState({ coordinates: newCoords, time, destAddress, distance, startAddress});
           return coords;
           
      } catch (error) {
        alert('No Directions Found!');
        console.log('error det-------' + error)
        Actions.home()
      } 
    }


    render () {
      const {
        time,
        startAddress,
        destAddress,
        distance,
      } = this.state

      return (
        <View style={{flex:1}}>
        
          <Header  />
        
          {
            this.state.time ?
            <View style={{flex: 1,justifyContent:'center',alignItems:'center'}}>
            <Text style={{textAlign:'center',fontSize:18,fontWeight:'bold', marginTop: '5%', marginBottom: '5%', color: '#910404', width: '100%',}}>For better experience stay on this page!</Text>
              <Surface style={styles.surface}><Text style={{textAlign:'center',fontSize:18,fontWeight:'bold'}}>Destination{"\n"}<Text style={{fontWeight:'bold',textAlign:'center',fontSize:12}}>{destAddress}</Text></Text></Surface><Divider/>
              <Surface style={styles.surface}><Text style={{textAlign:'center',fontSize:18,fontWeight:'bold'}}>Start Location{"\n"}<Text style={{fontWeight:'bold',textAlign:'center',fontSize:12}}>{startAddress}</Text></Text></Surface><Divider/>
              <Surface style={styles.surface}><Text style={{textAlign:'center',fontSize:14,fontWeight:'bold'}}>Estimated Time{"\n"}<Text style={{fontWeight:'bold',textAlign:'center',fontSize:18}}>{time}</Text></Text></Surface><Divider/>
              <Surface style={styles.surface}><Text style={{textAlign:'center',fontSize:14,fontWeight:'bold'}}>Distance{"\n"}<Text style={{fontWeight:'bold',textAlign:'left',fontSize:18}}>{distance}</Text></Text></Surface>
              <View style={{flex:1,alignSelf:'center',margin:10,alignItems:'center',justifyContent:'center'}}>
                <Button 
                icon="navigation"
                size={30}
                mode="contained"
                uppercase={false}
                onPress={
                  this.handleGetDirections
                  }>
                  Navigate
                </Button>
              </View>
            </View>
            : 
            <Dialog  visible={true}>
            <Dialog.Title style={{textAlign:'center',fontSize:14}}>Hang on we are collecting data for you</Dialog.Title>
            <Dialog.Content style={{textAlign:'center'}}>
              <View style={{ flexDirection: 'row', alignItems: 'center',alignSelf:'center' }}>
                <ActivityIndicator
                  color={"blue"}
                  size={isIOS ? 'small' : 24}
                  style={{ marginRight: 16 }}
                />
                <Paragraph>Loading.....</Paragraph>
              </View>
            </Dialog.Content>
          </Dialog>
          }
        </View>
      );

  }
}
styles = StyleSheet.create({
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  surface: {
    padding: 25,
    height: '15%',
    width: '90%',
    justifyContent: 'center',
    elevation: 4,
    alignSelf:'center',
    marginTop:10,
    borderRadius:8
  },
  });


