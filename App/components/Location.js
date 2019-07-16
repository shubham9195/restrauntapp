import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Geocoder from 'react-native-geocoding';
import axios from 'axios';
import { MAPS_KEY } from 'react-native-dotenv';
import { Snackbar } from 'react-native-paper';

const locationIcon = <FontAwesome5 size={20} name={'map-marker-alt'} color="#ffffff" />;

export default class Location extends Component {
	constructor(props) {
		super(props);
	}

	state = {
		lat: this.props.lat,
		lng: this.props.lng,
		name: '',
		displayName: '',
		upadte: false,
		snackBarLocation: false
	}

	componentDidMount() {
		this.getLocationName(this.state.lat, this.state.lng);
		// navigator.geolocation.getCurrentPosition(
      // (position) => {
				// if (this.state.lat === 0.0 && this.state.lng === 0.0) {
				// 	this.setState({
				// 		lat: position.coords.latitude,
				// 		lng: position.coords.longitude
				// 	})
				// }
				// this.setState({
					// lat: this.props.latitude,
					// lng: this.props.longitude
				// });
				// this.props.triggerParenUpdate(position.coords.latitude, position.coords.longitude);
				 
				// this.setState({name: 'test'});
      // },
      // (error) => {
      // },
      // { enableHighAccuracy: true, timeout: 2000 }
    // );
	}

	getLocationName = (lat, lng) => {
		const self = this;
		axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAPS_KEY}`)
		.then(res => {
			if (res.data.status == 'OVER_QUERY_LIMIT') {
				self.setState({
					snackBarLocation: !this.state.snackBarLocation
				});
			}
			let address = '';
			res.data.results.forEach(result => {
				let addressComponent = result.address_components;
				if (address.length == 0) {
					addressComponent.forEach(addr => {
						if (addr.types.includes("neighborhood")) {
							address = addr.short_name;
							return;
						} else if (addr.types.includes("sublocality_level_3")) {
							address = addr.short_name;
							return;
						} else if (addr.types.includes("sublocality_level_2")) {
							address = addr.short_name;
							return;
						} else if (addr.types.includes("sublocality_level_1")) {
							address = addr.short_name;
							return;
						} else if (addr.types.includes("route")) {
							address = addr.short_name;
							return;
						} 
					});
				}
			});
			this.setState({ name: address, upadte: true });
		})
		.catch(err => {
			console.log('maps error', err)
		});
	}

  render() {
    return (
      <View style={styles.container}>
        <Text style={{padding:15,marginTop:5}}>{locationIcon}</Text>
			<View style={{marginTop:20,marginLeft:-5}}>
			{
				this.state.name
				? <Text style={{ color: 'white' }}>{this.state.name}</Text> 
				: <Text style={{ color: 'white' }}>Locating...</Text>
			}
			</View>
		{/* <Snackbar
			visible={this.state.snackBarLocation}
			duration={3000}
			onDismiss={() => { this.setState({ snackBarLocation: !this.state.snackBarLocation })}}
		>
			Unable to locate. We are working on it.
		</Snackbar> */}
      </View>
    )
  }
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		flex: 1,
	},

})