/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, Alert, View, Button, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import axiosInstance from '../config/interceptor';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-simple-toast';
import cloneDeep from 'lodash/cloneDeep';
// const refresh = <FontAwesome5 name={'redo'} size={16} color="#ffffff" />;
// const left = <FontAwesome5 name={'angle-double-left'} size={12} color="#ffffff" />;
// const right = <FontAwesome5 name={'angle-double-right'} size={12} color="#ffffff" />;
const coupon = <FontAwesome5 name={'ticket-alt'} size={18} color="#000000" solid />;
import { Actions } from 'react-native-router-flux';
import Header from './Header';
import RazorpayCheckout from 'react-native-razorpay';
import { AsyncStorage } from 'react-native';
export default class extends React.Component {
  state = {
    isLoading: false,
    couponActive: false,
    totalPrice: '',
    updatedTaxPrice: 0,
    discoutPrice: 0,
    couponData: '',
    orderData: {}
  };
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    this.getStore();
    this.getOrder();
    this._retrieveData();
  }

  getOrder() {
    var self = this;
    axiosInstance
      .get('/order/' + self.props.orderId)
      .then(function(response) {
        self.setState({ isLoading: false });
        self.setState({ orderData: response.data.body });
      })
      .catch(function(error) {
        // handle error
      });
  }

  _retrieveData = async () => {
    self = this;
    try {
      const value = await AsyncStorage.getItem('servitor-user');
      this.getUser(value);
    } catch (error) {
      // Error retrieving data
      console.log('value', error);
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

  getStore() {
    var self = this;
    axiosInstance
      .get('/store/' + self.props.storeId)
      .then(function(response) {
        // console.warn(response.data.body.tax);
        self.setState({ isLoading: false });
        self.calculateTax(response.data.body.tax);
      })
      .catch(function(error) {
        self.setState({ isLoading: false });
      });
  }

  calculateTax(tax) {
    // console.warn(tax);
    let taxPrice = (parseInt(this.props.totalPrice) / 100) * parseInt(tax);
    // console.warn('tax', taxPrice);
    this.setState({ updatedTaxPrice: taxPrice });
    let price = parseInt(this.props.totalPrice) + parseInt(taxPrice);
    // console.warn('PRICE', price);
    this.setState({ totalPrice: price });
  }
  paymentMethodCash(type) {
    // console.warn(type);
    this.setState({ isLoading: true });
    var self = this;
    axiosInstance
      .put('/order/' + self.props.orderId, {
        data: {
          storeId: self.state.orderData.storeId,
          tableId: self.state.orderData.tableId,
          userId: self.state.orderData.userId,
          additionalInfo: self.state.orderData.additionalInfo,
          totalPrice: self.state.orderData.price,
          items: self.state.orderData.items,
          paymentType: type,
          tax:self.state.updatedTaxPrice,
          totalPricePayed: self.state.totalPrice,
          discountPrice: self.state.discoutPrice,
          paymentStatus: 'done'
        }
        // _id: self.props.orderId,
      })
      .then(function(response) {
        // console.warn('response', response);
        if(this.props.preOrder) {
          Actions.preordertracking({
            storeId: this.state.orderData.storeId,
            userId: this.state.orderData.userId,
            orderId: this.props.orderId,
          });
        } else {
          Actions.paymentsuccess({
            storeId: this.state.orderData.storeId,
            tableId: this.state.orderData.tableId,
            userId: this.state.orderData.userId,
            orderId: this.props.orderId,
            preOrder: this.props.preOrder          
          });
        }
        // self.setState({ isLoading: false });

        // self.getOrder();
      })
      .catch(function(error) {
        // console.warn('error', error);
        self.setState({ isLoading: false });
        Toast.showWithGravity(error.response.data.message, Toast.LONG, Toast.BOTTOM);
      });
  }

  goToConfirm() {
    // Alert.alert(
    //   'Payment Method',
    //   'Please Choose Your Payment Method',
    //   [
    //     {
    //       text: 'Cash',
    //       onPress: () => {
    //         {
    //           this.paymentMethodCash('cash');
    //         }
    //       }
    //     },
    //     {
    //       text: 'Online',
    //       onPress: () => {
    //         {
    //           this.paymentMethodCash('online');
    //         }
    //       }
    //     }
    //   ],
    //   { cancelable: false }
    // );
    var self = this;
    var options = {
      description: 'Credits towards servitor',
      currency: 'INR',
      key: 'rzp_test_YJz3qhQIm0gqoo',
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
        if(this.props.preOrder) {
          Actions.preordertracking({
            storeId: this.state.orderData.storeId,
            userId: this.state.orderData.userId,
            orderId: this.props.orderId,
          });
        } else {
          Actions.paymentsuccess({
            storeId: this.state.orderData.storeId,
            tableId: this.state.orderData.tableId,
            userId: this.state.orderData.userId,
            orderId: this.props.orderId,
            preOrder: this.props.preOrder          
          });
        }
      })
      .catch((error) => {
        console.log('payment error', error);
        // alert(`Error: ${error.code} | ${error.description}`);
        alert('Your payment was unsuccessful');
      });
    RazorpayCheckout.onExternalWalletSelection(data => {
      alert(`External wallet selected: ${data.external_wallet}`)
    });
  }

  updateOrder(type) {}

  applyCoupon() {
    if (this.state.couponActive == false) {
      this.setState({ couponActive: true });
    } else {
      this.setState({ couponActive: false });
    }
  }

  couponValidate(text) {
    var self = this;
    axiosInstance
      .get('/discount/' + text + '/validate')
      .then(function(response) {
        // console.warn(response.data);
        if (response.data.body.isActive == true) {
          self.updateOrderPrice(response.data.body.percentage);
        }
        // self.setState({ isLoading: false });
        // self.setState({ orderData: response.data.body });
        // self.calculateTax(response.data.body.totalPrice);
      })
      .catch(function(error) {
        self.setState({ isLoading: false });
      });
  }

  updateOrderPrice(value) {
    // console.warn('discoutPrice');
    let discoutPrice = (parseInt(this.props.totalPrice) / 100) * parseInt(value);
    // console.warn('discoutPrice', discoutPrice);
    this.setState({ discoutPrice: discoutPrice });
    let price = parseInt(this.props.totalPrice) - parseInt(discoutPrice);
    price = price + parseInt(this.state.updatedTaxPrice);
    // console.warn('PRICE', price);
    this.setState({ totalPrice: price });
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Header showUser={true} />
        </View>
        <View style={styles.bodyContainer}>
          <View style={{ backgroundColor: '#ffffff' }}>
            <Text onPress={() => this.applyCoupon()} style={{ fontSize: 18, margin: 10 }}>
              {coupon} {''}APPLY COUPON
            </Text>
            <View style={[this.state.couponActive == false ? styles.displayNone : styles.displayFlex]}>
              <View
                style={{
                  flexDirection: 'row',
                  margin: 10,
                  height: 40,
                  //   padding: 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  //   borderWidth: 0.5,
                  borderColor: '#888',
                  //   borderRadius: 2,
                  backgroundColor: '#fff'
                }}
              >
                <View style={{ flex: 4 }}>
                  <TextInput
                    onChangeText={(textEntry) => {
                      this.setState({ couponData: textEntry });
                    }}
                    style={{ backgroundColor: 'transparent' }}
                    onSubmitEditing={() => {
                      this.onSubmit(this.state.couponData);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, color: '#4169e1' }} onPress={() => this.couponValidate(this.state.couponData)}>
                    APPLY
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 10, backgroundColor: '#ffffff' }}>
            <Text style={{ margin: 10, fontSize: 14, color: '#262626' }}>Restaurant Bill</Text>
            <View style={{ flexDirection: 'row', padding: 5, justifyContent: 'center' }}>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 14 }}> Item Total</Text>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 16 }}>{this.props.totalPrice}</Text>
            </View>
            <View style={{ flexDirection: 'row', padding: 5, justifyContent: 'center' }}>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 14 }}>Tax</Text>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 16 }}>{this.state.updatedTaxPrice}</Text>
            </View>
            <View style={{ flexDirection: 'row', padding: 5, justifyContent: 'center' }}>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 12 }}>Discount Applied</Text>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 16 }}>{this.state.discoutPrice}</Text>
            </View>
            <View style={{ borderTopColor: '#000', borderTopWidth: 0.5, margin: 10 }} />
            <View style={{ flexDirection: 'row', padding: 5, justifyContent: 'center' }}>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 12 }}>To Pay</Text>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 16 }}>{this.state.totalPrice}</Text>
            </View>
          </View>
        </View>
        <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
          <View style={{ height: 50, padding: 10, backgroundColor: '#4169e1', alignItems: 'center' }}>
            <Text
              onPress={() => {
                this.goToConfirm();
              }}
              style={{ color: '#ffffff', fontSize: 18 }}
            >
              PAY NOW
            </Text>
          </View>
        </View>
      </View>
    );
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
