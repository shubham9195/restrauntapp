/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet,AsyncStorage, Text, TextInput, Alert, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import axiosInstance from '../config/interceptor';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-simple-toast';
import cloneDeep from 'lodash/cloneDeep';
const refresh = <FontAwesome5 name={'redo'} size={16} color="#ffffff" />;
const left = <FontAwesome5 name={'angle-double-left'} size={12} color="#ffffff" />;
const right = <FontAwesome5 name={'angle-double-right'} size={12} color="#ffffff" />;
const user = <FontAwesome5 name={'user-circle'} size={18} color="#ffffff" solid />;
import { Actions } from 'react-native-router-flux';
import{Button,Surface} from 'react-native-paper'
import Header from './Header';
export default class extends React.Component {
  state = {
    orderData: {},
    isLoading: false,
    additionalInfo: '',
    page: 0,
    price: 0,
    isRefreshing: false
  };
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    this.getOrder();
    this.interval = setInterval(() => this.getOrder(), 15000);
  }
  
  componentWillUnmount() {
    clearInterval(this.interval);
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

  updateOrder(data) {
    this.setState({ isLoading: true });
    var self = this;
    axiosInstance
      .put('/order/' + self.props.orderId, {
        data: {
          storeId: self.state.orderData.storeId,
          tableId: self.state.orderData.tableId,
          userId: self.state.orderData.userId,
          status: 'order-initiated',
          additionalInfo: data.additionalInfo,
          totalPrice: self.state.orderData.price,
          items: self.state.orderData.items
        }
        // _id: self.props.orderId,
      })
      .then(function(response) {
        self.setState({ isLoading: false });
        self.getOrder();
        Toast.showWithGravity('Order Placed Succesfully', Toast.LONG, Toast.TOP);
      })
      .catch(function(error) {
        self.setState({ isLoading: false });
        Toast.showWithGravity(error.response.data.message, Toast.LONG, Toast.BOTTOM);
      });
  }

  addMore() {
    const order = this.state.orderData;
    const storeId = this.state.orderData.storeId;
    const tableId = this.state.orderData.tableId;
    if (order && storeId && tableId) {
      Actions.menu({ storeId: storeId, tableId: this.state.table_id, order: order });
    }
  }

  calculatePrice() {
    var priceVariable = 0;
    this.state.orderData.items.map((data, index) => {
      if (data.status !== 'order-cancelled') {
        if (data.selectedModifiers) {
          let modifierPrice = this.calculateModifierPrice(data);
          if (modifierPrice) {
            priceVariable = priceVariable + (parseInt(data.price) + parseInt(modifierPrice)) * data.noOfItems;
          } else {
            priceVariable = priceVariable + data.price * data.noOfItems;
          }
        } else {
          priceVariable = priceVariable + data.price * data.noOfItems;
        }
      }
    });
    setTimeout(() => {
      this.setState({ price: priceVariable });
    }, 10);
  }

  calculateModifierPrice(data) {
    var modifierPrice = 0;
    data.selectedModifiers.map((modifier) => {
      modifierPrice = parseInt(modifierPrice) + parseInt(modifier.price);
    });
    return modifierPrice;
  }

   async removeItemValue() {
    try {
      await AsyncStorage.removeItem('cartData').then(()=> {
        setTimeout(() => {
          if (this.state.price) {
            Actions.payment({
              orderId: this.props.orderId,
              totalPrice: this.state.price,
              storeId: this.state.orderData.storeId,
              preOrder: this.props.preOrder
            });
          }
        }, 18);
      });
    }
    catch(exception) {
      console.log('error in removing cart cache ',exception)
    }
  }

  goToConfirm() {
    this.calculatePrice();
    this.removeItemValue(); // for removing cartdata

    // Alert.alert(
    //   'Payment Method',
    //   'Please Choose Your Payment Method',
    //   [{ text: 'Cash', onPress: () => {} }, { text: 'Online', onPress: () => {} }],
    //   { cancelable: false }
    // );
  }
  refresh() {
    this.setState({ isLoading: true });
    this.getOrder();
  }
  menu = async () => {
    Actions.menu({ storeId: this.state.store_id, tableId: this.state.table_id });
  };
  returnItems() {
    if (this.state.orderData.items) {
      return this.state.orderData.items.map((order, index) => {
        return (
          <View key={index} style={{ flexDirection: 'row' }}>
            <Text style={{ flex: 1, fontSize: 18, textAlign: 'left' }}>{order.name}</Text>
            {/* <Text style={{ flex: 1, fontSize: 18, textAlign: 'left' }}>{order.status}</Text> */}
            {
              order.status === 'order-cancelled'
              ?
              <View>
              <Text style={{ flex: 1, fontSize: 18, textAlign: 'left', marginRight: '5%'}}>{'Order Rejected due to \n' + order.reason || +' some reason'}</Text>
              <Text style={{ flex: 1, fontSize: 18, textAlign: 'left' }}>{}</Text>
              </View> 
              : null
            }
            {
              order.status === 'order-initiated'
              ? <Text style={{ flex: 1, fontSize: 18, textAlign: 'left' }}>Order Placed</Text>
              : null
            }
            {
              order.status === 'order-accepted'
              ? <Text style={{ flex: 1, fontSize: 18, textAlign: 'left' }}>Preparing</Text>
              : null
            }
            {
              order.status === 'order-completed'
              ? <Text style={{ flex: 1, fontSize: 18, textAlign: 'left' }}>Order Ready</Text>
              : null
            }
          </View>
        );
      });
    }
  }
  additionalInfoPlaceOrder() {
    if (this.state.additionalInfo) {
      let additionalInfoData = cloneDeep(this.state.orderData);
      let newInfo = cloneDeep(this.state.additionalInfo);
      this.setState({ additionalInfo: '' });
      additionalInfoData.additionalInfo = additionalInfoData.additionalInfo + '\n' + newInfo;
      this.updateOrder(additionalInfoData);
    }
  }
  goToProfile = async () => {
    if (Actions.currentScene !== 'profile') {
      Actions.profile();
    }
  };

  goToOreOrderTracking = async () => {
    if(this.state.orderData.userId && this.state.orderData.storeId && this.props.orderId) {
      Actions.preordertracking({
        userId   : this.state.orderData.userId,
        store_id : this.state.orderData.storeId,
        orderId  : this.props.orderId
      })
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Header showUser={true} />
        </View>
        <View style={styles.bodyContainer}>
          <ScrollView>
            {/* <Text style={{ fontSize: 22, textAlign: 'center', width: '100%' }}>HAPPY DINING</Text> */}
            <View style={{ padding: 10, backgroundColor: '#ffffff', borderRadius: 8 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 20,
                    textAlign: 'left',
                    marginBottom: 5,
                    color: '#262626'
                  }}
                >
                  ITEM
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 20,
                    marginBottom: 5,
                    textAlign: 'left',
                    color: '#262626'
                  }}
                >
                  STATUS
                </Text>
              </View>
              <View>{this.returnItems()}</View>
            </View>
            <View style={{ padding: 10, backgroundColor: '#ffffff', borderRadius: 8, marginTop: 20 }}>
              <Text style={{ padding: 5, color: '#262626' }}>Additional Info : </Text>
              <Text style={{ padding: 5 }}>{this.state.orderData.additionalInfo}</Text>
              <Text style={{ padding: 5 }}>Token number: {this.state.orderData.tokenNumber}</Text>

            </View>

            
          </ScrollView>
          {/* <View>
            {this.state.isLoading ? <ActivityIndicator animating color="#4169e1" size="large" style={styles.activityIndicator} /> : null}
          </View> */}
          <View>
            <View style={{ flexDirection: 'row' }}>
              <Text
                onPress={() => this.refresh()}
                style={[
                  {
                    flex: 1,
                    borderColor: '#4169e1',
                    backgroundColor: '#4169e1',
                    borderWidth: 0.5,
                    padding: 3,
                    margin: 5,
                    textAlign: 'right',
                    borderRadius: 6,
                    paddingLeft: 8,
                    paddingRight: 8,
                    color: '#ffffff',
                    textAlign: 'center'
                  }
                ]}
              >
                <Text style={{ paddingRight: 10 }} onPress={() => this.refresh()}>
                  {refresh}
                </Text>{' '}
                Refresh
              </Text>
              <Text
                onPress={() => this.addMore()}
                style={[
                  {
                    flex: 1,
                    borderColor: '#4169e1',
                    backgroundColor: '#4169e1',
                    borderWidth: 0.5,
                    padding: 3,
                    margin: 5,
                    textAlign: 'right',
                    borderRadius: 6,
                    paddingLeft: 8,
                    paddingRight: 8,
                    color: '#ffffff',
                    textAlign: 'right'
                  }
                ]}
              >
                <Text onPress={() => this.addMore()}>{left}</Text> ADD MORE ITEMS <Text onPress={() => this.addMore()}>{right}</Text>
              </Text>
            </View>
            
            <TextInput
              placeholder="Additional Requirements"
              style={{ borderColor: '#4169e1', borderWidth: 1, marginBottom: 75, textAlignVertical: 'top' }}
              multiline={true}
              ref={(el) => {
                this.additionalInfo = el;
              }}
              onChangeText={(additionalInfo) => this.setState({ additionalInfo })}
              value={this.state.additionalInfo}
              numberOfLines={4}
            />
            <View style={{ position: 'absolute', right: 10, width: '25%' }}>
              <Text
                style={{
                  borderColor: '#4169e1',
                  backgroundColor: '#4169e1',
                  borderWidth: 0.5,
                  padding: 3,
                  margin: 5,
                  textAlign: 'center',
                  borderRadius: 6,
                  paddingLeft: 8,
                  paddingRight: 8,
                  color: '#ffffff'
                }}
                onPress={() => {
                  this.additionalInfoPlaceOrder();
                }}
              >
                Submit
              </Text>
 
            </View>
          </View>
        </View>
        {
          this.state.orderData.paymentStatus === 'pending' && this.state.orderData.status === 'order-accepted'
          ? <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
              <View style={{ height: 50, padding: 10, backgroundColor: '#4169e1', alignItems: 'center' }}>
                <Text
                  onPress={() => {
                    this.goToConfirm();
                  }}
                  style={{ color: '#ffffff', fontSize: 18 }}
                >
                  PROCEED TO PAYMENT
                </Text>
              </View>
            </View>
          : null
        }
    </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bbc0c4'
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
  },
 });
