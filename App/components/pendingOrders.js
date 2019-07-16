/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, BackHandler } from 'react-native';
import Header from '../components/Header'
import { AsyncStorage } from 'react-native';
import axiosInstance from '../config/interceptor';
import {TouchableOpcacity, Button} from 'react-native-paper'
import Toast from 'react-native-simple-toast';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const icon = <FontAwesome5 name={'redo'} size={18} color="#ffffff" />;
import { Actions } from 'react-native-router-flux';
const dish = <FontAwesome5 name={'concierge-bell'} size={250} color="#A8BBE6" solid />;


export default class extends React.Component {
  
  constructor(props) {
    super(props);
  }

  
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.profile()
      return true;
    });
    console.disableYellowBox = true;
    var self = this;
      self.getOrder();
  }


  componentWillUnmount() {
    clearInterval(this.interval);
  }



  state = {
    storeId: '',
    orderItems: [],
    isLoading: true
  };

  checkForNewOrder(orders) {
    let count = 0;
    orders.forEach(order => {
      if (order.status == 'order-initiated') {
        count++;
      }
    });

    }
  
  getOrder = async () => {
    var self = this;
    self.setState({ isLoading: true });
    axiosInstance
      .get('order/list', {
        params: {
          perPage: 10,
          userId: self.props.userId,
          status: 'order-accepted',
          // notStatus: 'order-completed'
          
        }
      })
      .then(function(response) {
        self.setState({ isLoading: false });
        self.setState({
          orderItems: []
        });
        self.setState({
          orderItems: [...self.state.orderItems, ...response.data.body] // assuming response.data is an array and holds new records
        });
        self.checkForNewOrder(response.data.body);
      })
      .catch(function(error) {
        console.log('error ', error)
        self.setState({ isLoading: false });
      })
      .then(function() {
        // always executed
      });
  };




  returnOrder() {
    return this.state.orderItems.map((item, index) => {
      return (
        <View
        
          key={item._id}
          style={{ padding: 10, margin: 10, backgroundColor: '#ffffff', borderRadius: 8 }}
        >
          <Text style={{ flex: 1, fontSize: 22, width: '100%', marginLeft: '35%', marginRight: '35%', color: "#c90404", fontWeight: '500', marginBottom: '2%' }}>
              {item.storeId.name}
            </Text>
          
          <View style={{ marginTop: 10}}>
            <Text style={{ flex: 1, fontSize: 16 }}>
              {'ORDER : ' + item.orderId}
            </Text>
            <Text style={{ flex: 1, fontSize: 16 }}>
              {'STATUS: ' + item.status}
            </Text>
          </View>

          <View style={{ marginTop: 10}}>

            <Text style={{ flex: 1, fontSize: 16 }}>
              {'TOTAL PRICE : ₹ ' + item.totalPrice}
            </Text>

            {
              !item.tableId
              ?    <Text style={{ flex: 1, fontSize: 16, marginRight: '5%', marginTop: 2 }}>
                  ORDER TYPE : Pre-Order
                </Text>
              : <Text style={{ flex: 1, fontSize: 16, textAlign: 'center', marginRight: '5%' }}>
              
              {item.tableId.name}
            </Text>
           
            }

          </View>

          <View style={{ marginTop: 10}}>
                     {
                       item.totalPricePayed ?
                       <Text style={{ flex: 1, fontSize: 16 }}>
                          PAYMENT :  Done
                      </Text>
                   :
                      <Text style={{ flex: 1, fontSize: 16 }}>
                         {"PAYMENT  : pending"}
                      </Text>
                    }
                    {
                      item.paymentType ?
                      <Text style={{ flex: 1, fontSize: 16 }}>
                     {'PAYMENT MODE :  ' + item.paymentType}
                      </Text>
                      :
                      <Text style={{ flex: 1, fontSize: 16 }}>
                     {'PAYMENT MODE : -'}
                   </Text>
                    }
                   
           </View>
           
           {
              item.preOrder ?
              <Button   style={
          {
            marginTop: 20,
           borderRadius: 4 ,
           backgroundColor: '#1C47A3', 
           marginLeft: '5%',
           fontColor: '#FFFFFF',
           height: 65,
           justifyContent: 'center',
           alignItems: 'center', 
           marginRight: '5%'}}
           mode="contained" 
           onPress={() => Actions.preordertracking({
               userId  : this.props.userId,
               storeId : item.storeId._id,
               orderId : item._id
           })}
           >
               Navigate to Destination
      </Button>
              : null
           }


              
        </View>
      );
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View><Header pageName={"Pending Order"}></Header></View>
        <View>
          {this.state.isLoading ? <ActivityIndicator animating color="#4169e1" size="large" style={styles.activityIndicator} /> : null}
        </View>
        <ScrollView>
        {
          this.state.orderItems.length ? <View style={{ marginBottom: 50 }}>{this.returnOrder()}</View>
          :  
          <View>
          <Text style={{ flex: 1, textAlign: "center", marginTop: '30%' }}>{dish}</Text>
          <Text style={{ flex: 1, textAlign: "center", marginTop: '3%', fontWeight: '500', fontSize: 25 }}>Seems like orders completed</Text>
          <Text style={{ flex: 1, textAlign: "center", marginTop: '3%', fontWeight: '300', fontSize: 15 }}>Refresh below if not updated!</Text>
          </View>
        }
        </ScrollView>
        <TouchableOpacity
          onPressIn={() => this.getOrder()}
          style={{
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            position: 'absolute',
            bottom: 65,
            right: 10,
            height: 60,
            elevation: 20,
            backgroundColor: '#1C47A3',
            borderRadius: 100
          }}
        >
          <Text>{icon}</Text>
        </TouchableOpacity>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2'
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    height: 80
  }
});
