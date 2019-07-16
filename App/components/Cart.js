/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, BackHandler } from 'react-native';
import Header from './Header';
import cloneDeep from 'lodash/cloneDeep';
import axiosInstance from '../config/interceptor';
import Toast from 'react-native-simple-toast';
import { AsyncStorage } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const plus = <FontAwesome5 name={'plus'} size={16} color="#495057" light />;
const minus = <FontAwesome5 name={'minus'} size={16} color="#495057" light />;
const left = <FontAwesome5 name={'angle-double-left'} size={12} color="#ffffff" />;
const right = <FontAwesome5 name={'angle-double-right'} size={12} color="#ffffff" />;
import { Actions } from 'react-native-router-flux';
import { Dialog, Paragraph, Button, RadioButton, TouchableRipple } from 'react-native-paper'

export default class extends React.Component {
  state = {
    cartData: this.props.data,
    isLoading: false,
    page: 0,
    price: 0,
    additionalInfo: '',
    userId: '',
    isRefreshing: false,
    counter: 0,
    visible: false,
    method: "Dine-in"
  };


  constructor(props) {
    super(props);
    this._retrieveData();
  }
  componentDidMount() {
    // this.setState({ cartData: this.props.data });
    BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.home()
      return true;
    });
    this.calculatePrice();
  }

  async increaseCounter(index) {
    AsyncStorage.removeItem('cartData');
    const tempData = this.state.cartData;
    tempData[index].noOfItems = tempData[index].noOfItems + 1;
    this.calculatePrice()

    let myCartData = ({
      cartItems: tempData,
      storeId: this.props.storeId,
      tableId: this.props.tableId,
      preOrder: this.props.preOrder,
      storeName: this.props.storeName
    });
    await AsyncStorage.setItem('cartData', JSON.stringify(myCartData)).then(() => {
      this.setState({ cartData: tempData });
    });
  }
  async decreaseCounter(index) {
    AsyncStorage.removeItem('cartData');
    const tempData = this.state.cartData;
    tempData[index].noOfItems = tempData[index].noOfItems - 1;
    if (tempData.length > 1) {
      this.calculatePrice()
      if (tempData[index].noOfItems == 0) {
        tempData.splice(index, 1);
      }

      let myCartData = ({
        cartItems: tempData,
        storeId: this.props.storeId,
        tableId: this.props.tableId,
        preOrder: this.props.preOrder,
        storeName: this.props.storeName
      });
      await AsyncStorage.setItem('cartData', JSON.stringify(myCartData)).then(() => {
        this.setState({ cartData: tempData });
      });
    } else {
      this.goToEmpty()
    }
  }

  async calculatePrice() {
    var priceVariable = 0;
    if (this.props.data && this.props.data.lenght > 0) {
      this.props.data.map((data, index) => {
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
      });
      this.setState({ price: priceVariable })
    }
    else if (AsyncStorage.getItem('cartData')) {
      let cartData = JSON.parse(await AsyncStorage.getItem('cartData'));
      this.props.data.map((data, index) => {
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
      });
      this.setState({ price: priceVariable })
    }
    setTimeout(() => {
      this.setState({ price: priceVariable });
    }, 10);
  }

  checkMethod() {
    if (this.state.method === "Dine-in") {

    }
    else {

    }
  }

  calculateModifierPrice(data) {
    var modifierPrice = 0;
    data.selectedModifiers.map((modifier) => {
      modifierPrice = parseInt(modifierPrice) + parseInt(modifier.price);
    });
    return modifierPrice;
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('servitor-user');
      if (value !== null) {
        this.setState({ userId: value });
        this.getUser();
      }
    } catch (error) {
      // Error retrieving data
    }
  };
  setStatus(type) {
    const self = this;
    if (this.props.data.length != 0) {
      var statusVariable = cloneDeep(this.props.data);
      statusVariable.map((item, index) => {
        if (!item['status']) {
          item['status'] = 'order-initiated';
        }
        delete item['rating'];
      });
      this.setState({ cartData: statusVariable });

      this.placeOrder(statusVariable, type);
    } else {
      this.setState({ isLoading: false });
      Toast.showWithGravity('No Items in Cart', Toast.LONG, Toast.BOTTOM);
    }
  }
  _hideDialog = () => this.setState({ visible: false });

  goToConfirm() {
    // this.setState({ isLoading: true });
    // this.setStatus();
    if (this.props.preOrder) {
      this.setState({ visible: true });
    } else {
      this.setStatus('dine-in');
    }
  }

  placeOrder(data, type) {
    var self = this;
    if (this.state.userId) {
      if (!this.props.data.orderId) {
        axiosInstance
          .post('/order/post', {
            storeId: self.props.storeId,
            tableId: self.props.tableId,
            userId: self.state.userId,
            status: 'order-initiated',
            additionalInfo: self.state.additionalInfo,
            totalPrice: self.state.price,
            items: data,
            paymentStatus: 'pending',
            preOrder: self.props.preOrder,
            parcel: type === 'take-away' ? true : false
          })
          .then(function (response) {
            self.setState({ isLoading: false });
            Actions.paynow({ orderId: response.data.body._id, preOrder: self.props.preOrder });
            Toast.showWithGravity('Order Placed Succesfully', Toast.LONG, Toast.TOP);
          })
          .catch(function (error) {
            self.setState({ isLoading: false });
            Toast.showWithGravity(error.response.data.message, Toast.LONG, Toast.BOTTOM);
          });
      } else {
        axiosInstance
          .put('/order/' + this.props.orderId, {
            storeId: self.props.storeId,
            tableId: self.props.tableId,
            userId: self.state.userId,
            status: 'order-initiated',
            additionalInfo: self.state.additionalInfo,
            totalPrice: self.state.price,
            items: data,
            preOrder: self.props.preOrder,
            parcel: type === 'take-away' ? true : false
          })
          .then(function (response) {
            self.setState({ isLoading: false });
            Actions.paynow({ orderId: response.data.body._id, preOrder: self.props.preOrder });
            Toast.showWithGravity('Order Placed Succesfully', Toast.LONG, Toast.TOP);
          })
          .catch(function (error) {
            Toast.showWithGravity(error.response.data.message, Toast.LONG, Toast.BOTTOM);
          });
      }
    } else {
      Toast.showWithGravity('SignIn in to order', Toast.LONG, Toast.BOTTOM);
      Actions.home();
    }

  }

  selectedModifier(item) {
    if (item.selectedModifiers) {
      return item.selectedModifiers.map((data, index) => {
        return <Text>{data.name}</Text>;
      });
    }
  }

  goBack = async () => {
    Actions.pop();
  };

  async goToEmpty() {
    await AsyncStorage.removeItem('cartData').then(() => {
      Actions.emptycart()
    })
  }
  returnIncreaseCounter(item, index) {
    if (!item.status) {
      return (
        <Text
          onPress={() => {
            this.increaseCounter(index);
          }}
          style={{ flex: 1, textAlign: 'right' }}
        >
          {plus}
        </Text>
      );
    }
  }

  returnDecreaseCounter(item, index) {
    if (!item.status) {
      return (
        <Text
          onPress={() => {
            this.decreaseCounter(index);
          }}
          style={{ flex: 1, textAlign: 'right' }}
        >
          {minus}
        </Text>
      );
    }
  }

  returnCartData() {
    if (this.state.cartData) {
      return this.state.cartData.map((item, index) => {
        return (
          <View>
            <View style={styles.containerMenu}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ flex: 1, fontSize: 18 }}>{item.name}</Text>
                <View>{this.returnIncreaseCounter(item, index)}</View>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ flex: 1, fontSize: 16, color: '#4169e1' }}>{'₹' + item.price * item.noOfItems}</Text>
                <Text style={{ flex: 1, fontSize: 24, textAlign: 'right' }}>{item.noOfItems}</Text>
              </View>
              <View>{this.selectedModifier(item)}</View>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, textAlign: 'right' }}>{this.returnDecreaseCounter(item, index)}</View>
              </View>
            </View>
          </View>
        );
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Header showUser={true} />
        </View>
        {this.state.visible?<Dialog
            visible={this.state.visible}
            onDismiss={this._hideDialog}>
            <Dialog.Title>Select one of the Option</Dialog.Title>
            <Dialog.Content>
              {/* <Paragraph>This is simple dialog</Paragraph> */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Button mode="outlined" onPress={() => this.setStatus('dine-in')}> Dine I </Button>
                  <Button mode="outlined" onPress={() => this.setStatus('take-away')}> Take Away </Button>

                </View>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={this._hideDialog}>Dismiss</Button>
            </Dialog.Actions>
          </Dialog>:
        <ScrollView style={styles.bodyContainer}>
          <Text style={{ fontSize: 20, color: '#a30d0d', fontWeight: '500' }}>{this.props.storeName}</Text>
          <View>{this.returnCartData()}</View>
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#000' }}>Total Price</Text>
              <Text >{'₹ ' + this.state.price}</Text>
            </View>
          </View>

          
          <View>

            <KeyboardAvoidingView behavior="height">


              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Text
                  onPress={() => this.goToEmpty()}
                  style={[
                    {
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
                  <Text onPress={() => this.goToEmpty()}>{left}</Text> Clear Cart <Text onPress={() => this.goToEmpty()}>{right}</Text>
                </Text>
              </View>
            </KeyboardAvoidingView>

            <TextInput
              placeholder="Additional Requirements"
              style={{ borderColor: '#4169e1', borderWidth: 1, marginBottom: 50, textAlignVertical: 'top' }}
              multiline={true}
              ref={(el) => {
                this.additionalInfo = el;
              }}
              onChangeText={(additionalInfo) => this.setState({ additionalInfo })}
              value={this.state.additionalInfo}
              numberOfLines={4}
            />
          </View>
        </ScrollView>}
        <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
          <View>
            {this.state.isLoading ? <ActivityIndicator animating color="#4169e1" size="large" style={styles.activityIndicator} /> : null}
          </View>
          <View style={{ height: 50, padding: 10, backgroundColor: '#4169e1', alignItems: 'center' }}>
            <Text
              style={{ textAlign: 'center' }}
              onPress={() => {
                this.goToConfirm();
              }}
              style={{ color: '#ffffff', fontSize: 18 }}
            >
              CONFIRM ORDER
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
    // alignItems: 'center',
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
    borderRadius: 3,
    marginTop: 5,
    padding: 10,
    backgroundColor: '#ffffff'
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
    // margin: 10,
    borderBottomColor: '#000000',
    borderBottomWidth: 1,
    borderRadius: 8,
    padding: 10
  }
});
