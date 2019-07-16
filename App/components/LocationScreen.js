import React, { Component } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Geocoder from 'react-native-geocoding';
import axios from 'axios';
import Header from './Header';
import { Actions } from 'react-native-router-flux';
import { MAPS_KEY } from 'react-native-dotenv'; 

const searchLocationIcon = <FontAwesome5 size={20} name={'search-location'} color="blue" />;
const locationIcon = <FontAwesome5 size={20} name={'map-pin'} color="blue" />;

export default class LocationScreen extends Component {
  constructor(props) {
      super(props);
  }

  state = {
    results: []
  }

  componentDidMount() {
      
  }

  searchLocation(text) {
    if (text.length > 2) {
      axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${text}&inputtype=textquery&fields=formatted_address,name,geometry&key=${MAPS_KEY}`)
      .then(res => {
        this.setState({ results: res.data.candidates });
      });
    }
  }

  componentWillUpdate() {

  }

  render() {
    return (
      <View>
        <Header></Header>
        <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 15}}>
            <Text>{searchLocationIcon}</Text>
            <TextInput onChangeText={(text) => this.searchLocation(text)} placeholder="Search for your loaction" style={{padding: 10}}></TextInput>
        </View>
        <TouchableOpacity 
            style={{flexDirection: 'row', alignItems: 'center', marginLeft: 15}}
            onPressIn={() => Actions.home() }>
            <Text>{locationIcon}</Text>
            <Text style={{padding: 10}}>Use my current location</Text>
        </TouchableOpacity>
        {
          this.state.results.length > 0
          ? <FlatList 
              data={this.state.results}
              renderItem={({item}) => 
                <TouchableOpacity onPressIn={() => Actions.home({lat: item.geometry.location.lat, lng: item.geometry.location.lng})}>
                  <Text style={{marginLeft: 15, marginTop: 10}}>{item.formatted_address}</Text>
                </TouchableOpacity>
              }/>
          : null
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		flex: 1,
	},
	mapicon: {
		marginLeft: 10,
	},
	locationText: {
		marginLeft: 5,
	}
})