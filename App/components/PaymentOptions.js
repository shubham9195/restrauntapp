import React, {} from 'react';
import { StyleSheet, Text, TextInput, Alert, View, Button, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import axiosInstance from '../config/interceptor';
import Toast from 'react-native-simple-toast';
import { Actions } from 'react-native-router-flux';
import Header from './Header';
import { AsyncStorage } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

export default class extends React.Component {

  constructor(props) {
    super(props);
  }

  state = {
    paymentOptions: ['Razorpay', 'Paytm'],
    user: ''
  }

  componentDidMount() {
    this.getUser(value);
  }

  payOptions(option) {
    if (option.toLowerCase() === 'razorpay') {
      this.razorpay();
    }
  }

  getUser(id) {
    axiosInstance
      .get(`user/${id}`)
      .then(res => {
        this.setState({
          user: res['data']['body']
        })
      })
      .catch(err => console.log(err));
  }

  razorpay() {
    console.log(this.state);
    var self = this;
    var options = {
      description: 'Credits towards servitor',
      currency: 'INR',
      // key: 'rzp_test_YJz3qhQIm0gqoo', // testing key
      key: 'rzp_live_MrkIa3Pjj0FsLm', // live key
      amount: this.props.totalPrice * 100,
      // amount: 1 * 100,
      name: 'Servitor',
      prefill: {
        contact: this.state.user.mobile,
        name: (this.state.user.firstname + this.state.user.lastname) || this.state.user.username 
      }
    }
    RazorpayCheckout.open(options)
      .then((data) => {
        alert(`Payment done successfully`);
        this.paymentMethodCash('online');
        Actions.home();
      })
      .catch((error) => {
        console.log('payment error', error);
        alert(`Error: ${error.code} | ${error.description}`);
        alert('Your payment was unsuccessful');
      });
    RazorpayCheckout.onExternalWalletSelection(data => {
      alert(`External wallet selected: ${data.external_wallet}`)
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Header showUser={true} />
        </View>
        <View style={styles.bodyContainer}>
          <Text style={{alignSelf: 'center'}}>Select one of the below options</Text>
          <FlatList
            data={this.state.paymentOptions}
            renderItem={({ item }) => (
              <TouchableOpacity style={{backgroundColor: '#D3D3D3', marginBottom: 3, marginTop: 3}} onPressIn={() => this.payOptions(item)}>
                <Text style={{ fontSize: 20, margin: 15 }}>{item}</Text>
              </TouchableOpacity>
            )}
          >

          </FlatList>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bbc0c4'
  },
  displayNone: {
    height: 0,
    width: 0,
    padding: 0,
    borderRadius: 0,
    borderWidth: 0
  },
  displayFlex: {
    display: 'flex',
    borderWidth: 0.5,
    padding: 2,
    margin: 10
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80
  },
  bodyContainer: {
    flex: 1,
    borderRadius: 8,
    marginTop: 5,
    padding: 10,
    backgroundColor: '#f5f5f5'
  },
  textMain: {
    color: '#ffffff',
    fontSize: 15
  },
  textSub: {
    fontSize: 24,
    color: '#ffffff'
  },
  menuText: {
    fontSize: 18,
    color: '#CFB53B'
  },
  containerMenu: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#000000',
    borderBottomWidth: 1,
    borderRadius: 8,
    padding: 10
  }
});
