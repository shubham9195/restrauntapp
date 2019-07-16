/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView ,Image} from 'react-native';
import Footer from './Footer';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { NetInfo,BackHandler, DeviceEventEmitter} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { AsyncStorage } from 'react-native';
import axiosInstance from '../config/interceptor';
import Toast from 'react-native-simple-toast';
import Location from './Location';
import Nearby from './Nearby';
const cart = <FontAwesome5 name={'shopping-cart'} size={20} color="#ffffff" />;
import Dimensions from 'Dimensions';
const user = <FontAwesome5 name={'user-circle'} size={18} color="#ffffff" solid />;
import { Appbar,List,Card,Caption,Title,Paragraph,IconButton,Divider,Surface, Snackbar, ActivityIndicator, Button } from 'react-native-paper';
import Swiper from "react-native-swiper";
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";


LocationServicesDialogBox.checkLocationServicesIsEnabled({
  message: "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
  ok: "YES",
  cancel: "NO",
  enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
  showDialog: true, // false => Opens the Location access page directly
  openLocationServices: true, // false => Directly catch method is called if location services are turned off
  preventOutSideTouch: false, // true => To prevent the location services window from closing when it is clicked outside
  preventBackClick: false, // true => To prevent the location services popup from closing when it is clicked back button
  providerListener: false,// true ==> Trigger locationProviderStatusChange listener when the location state changes

}).then(function(success) {
}).catch((error) => {
});

BackHandler.addEventListener('hardwareBackPress', () => { //(optional) you can use it if you need it
 //do not use this method if you are using navigation."preventBackClick: false" is already doing the same thing.
 LocationServicesDialogBox.forceCloseDialog();
});

DeviceEventEmitter.addListener('locationProviderStatusChange', function(status) { // only trigger when "providerListener" is enabled
});

export default class extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    redirectPayNowPage: false,
    order: {},
    nearby: {},
    isLoading: false,
    lat: 0.0,
    lng: 0.0,
    showUser: false,
    isConnected: true,
    snackBarVisible: false,
    snackBarConnectionError: false,
    showRetryButton: false,
    allResturants: {},
    cartData: '',
    cartPending: false,
    data: '',
    storeId: '',
    tableId: ''
  };

  componentWillMount() {
    this._retrieveData();
    this._retrieveData2();
    LocationServicesDialogBox.stopListener(); // Stop the "locationProviderStatusChange" listener
  }
  
  componentDidMount() {
    this.checkInternetConnection();
    this._interval = setInterval(() => {
      if (!this.state.lat) {
        this.getLocation();
      } else {
        clearInterval(this._interval);
      }
    },1000);
    // this.setState({ isLoading: true });
  }

  componentWillUnmount() {
    clearInterval(this._interval);
  }

  checkInternetConnection = () => {
    const self = this;
    NetInfo.isConnected.fetch().then(isConnected => {
      self.setState({
        isConnected: isConnected,
        snackBarVisible: !isConnected
      });
      if (isConnected) {
        this.setState({ isLoading: true });
        this.getLocation();
        this.getAllresturants();
      }
    });
  }

  scan = () => {
    if (!this.state.showUser) {
      Toast.show('Please login to continue ordering', Toast.LONG, Toast.TOP);
      Actions.login();
      return;
    }
    NetInfo.isConnected.fetch().then((isConnected) => {
      if (isConnected) {
        if (this.state.redirectPayNowPage == false) {
          Actions.ScanScreen();
        } else {
          Toast.showWithGravity('You have a pending order', Toast.LONG, Toast.BOTTOM);
        }
      } else {
        Toast.showWithGravity('Please Check Your Internet Connection', Toast.LONG, Toast.BOTTOM);
      }
    });
  };
  goToProfile = async () => {
    if (Actions.currentScene !== 'profile') {
      Actions.profile();
    }
  };
  goToSearch =async () => {
    if(Actions.currentScene!== 'search'){
      Actions.search();
    }
  }
  _retrieveData = async () => {
    this.setState({ isLoading: true });
    var self = this;
    try {
      const value = await AsyncStorage.getItem('servitor-user');
      if (value !== null) {
        self.getOrder(value);
        self.setState({
          showUser: true,
          isLoading: false
        });
      }
      this.asDatas = JSON.parse(await AsyncStorage.getItem('cartData'))
      if(this.asDatas) { 
        await this.setState({
          cartData: this.asDatas.cartItems,
          cartPending: true,
          storeId: this.asDatas.storeId,
          tableId: this.asDatas.tableId,
          preOrder: this.asDatas.isPreOrder,
          storeName: this.asDatas.storeName
      })
      } else {
        this.setState({
          cartPending: false
        })
      }
    } catch (error) {
      // Error retrieving data
      self.setState({
        isLoading: false,
      });
    }
  };

  _retrieveData2 = async () => {
    var self = this;
    try {
      const value = await AsyncStorage.getItem('servitor-user');
      if (value !== null) {
        this.setState({
          showUser: true
        });
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  goToPayNow() {
    Actions.paynow({ orderId: this.state.order._id});
  }
  goToPending() {
    Actions.cart({
      data: this.state.cartData,
      storeId:  this.state.storeId,
      tableId: this.state.tableId,
      preOrder: this.state.preOrder,
      storeName: this.state.storeName
    });
  }
  getOrder = async (id) => {
    var self = this;
    axiosInstance
      .get('order/list', {
        params: {
          userId: id,
          status: 'order-initiated',
          perPage: 0
        }
      })
      .then(function(response) {
        if (response.data.body.length > 0) {
          let lastOrder = response.data.body[response.data.body.length - 1];
          self.setState({ order: lastOrder });
          self.setState({ redirectPayNowPage: true });
        } else {
          // self.getOrder2(id);
        }
        self.setState({ isLoading: false });
      })
      .catch(function(error) {
        // handle error
        self.setState({ isLoading: false });
      })
      .then(function() {
        // always executed
      });
  };

  getOrder2 = async (id) => {
    var self = this;
    axiosInstance
      .get('order/list', {
        params: {
          userId: id,
          status: 'order-accepted',
          perPage: 0
        }
      })
      .then(function(response) {
        if (response.data.body.length > 0) {
          let lastOrder = response.data.body[response.data.body.length - 1];
          self.setState({ order: lastOrder });
          self.setState({ redirectPayNowPage: true });
        } else  {
          self.getPayPending(id);
        }
        self.setState({ isLoading: false });
      })
      .catch(function(error) {
        // handle error
        self.setState({ isLoading: false });
      })
      .then(function() {
        // always executed
      });
  };

  getPayPending = async (id) => {
    var self = this;
    axiosInstance
      .get('order/list', {
        params: {
          userId: id,
          paymentStatus: 'pending',
          perPage: 0
        }
      })
      .then(function(response) {
        if (response.data.body.length > 0) {
          let lastOrder = response.data.body[response.data.body.length - 1];
          self.setState({ order: lastOrder,
            redirectPayNowPage: true
          });
          
        }
        self.setState({ isLoading: false });
      })
      .catch(function(error) {
        // handle error
        self.setState({ isLoading: false });
      })
      .then(function() {
        // always executed
      });
  }

  getNearby = () => {
    // this.setState({ isLoading: true });
    axiosInstance
      .get('store/nearby', {
        params: {
          lat: this.state.lat,
          lng: this.state.lng
        }
      })
      .then(res => {
        this.setState({
          nearby: res.data,
          isLoading: false
        });
      })
      .catch(err => {
        this.setState({
          isLoading: false,
          snackBarConnectionError: !this.state.snackBarConnectionError,
          showRetryButton: !this.state.showRetryButton
        });
      });
  }

  getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        this.getNearby(this.state.lat, this.state.lng);
      },
      error => {
      },
      { enableHighAccuracy: false, timeout: 20000 }
    )
  }

  retry() {
    this.setState({
      snackBarConnectionError: false,
      showRetryButton: false
    });
    this.getNearby();
    this.getAllresturants();
  }

  getAllresturants() {
    const self = this;
    axiosInstance.get('store/list')
    .then(res => {self.setState({
        allResturants: res.data,
        isLoading: false
      });
    })
    .catch(err => console.log('error in all store list', err));
  }

  goToLocationScreen() {
    Actions.locationScreen();
  };

  goToLoginScreen() {
    Toast.show('Please login to view profile', Toast.LONG, Toast.TOP);
    Actions.login();
  }

  renderHeader() {
    return (
      <View>
        {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ flex: 1 }} onPressIn={() => this.goToLocationScreen() }>
            <Location lat={this.state.lat} lng={this.state.lng} ></Location>
          </TouchableOpacity>
          
          <Text style={{ flex: 1, fontSize: 18, textAlign: 'center', color: '#ffffff' }}>Servitor</Text>
          {
            this.state.showUser
            ? <TouchableOpacity style={{ flex: 1 }} onPressIn={() => this.goToProfile()}>
                <Text style={{ flex: 1, textAlign: 'right', marginRight: 10 }}>{user}</Text>
              </TouchableOpacity>
            : <TouchableOpacity style={{ flex: 1 }} onPressIn={() => this.goToLoginScreen()}>
                <Text style={{ flex: 1, textAlign: 'right', marginRight: 10 }}>{user}</Text>
              </TouchableOpacity>
          }
        </View> */}
        <Appbar.Header>
        
        <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPressIn={() => {/* this.goToLocationScreen() */} }>
            {
              this.state.lat && this.state.lng
              ? <Location lat={this.state.lat} lng={this.state.lng} ></Location>
              : null 
            }
          </TouchableOpacity>

        <Appbar.Content
          
          // subtitle="Subtitle"
        />
        <Appbar.Action icon="search" onPress={() => this.goToSearch()} />
        {/* <Appbar.Action icon="person" onPress={this._openProfile} /> */}

        {/* <Appbar.Action icon="more-vert" onPress={this._onMore} /> */}
      </Appbar.Header>
      </View>
    );
  }
  returnPayNow() {
    if (this.state.redirectPayNowPage == true) {
      return (
        <TouchableOpacity
          onPressIn={() => this.goToPayNow()}
          style={{
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            position: 'absolute',
            bottom: 15,
            right: 10,
            height: 60,
            backgroundColor: '#4169e1',
            borderRadius: 100
          }}
        >
          <Text>{cart}</Text>
        </TouchableOpacity>
      );
    } else if(this.state.cartPending) {
      return (
        <TouchableOpacity
          onPressIn={() => this.goToPending()}
          style={{
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            position: 'absolute',
            bottom: 15,
            right: 10,
            height: 60,
            backgroundColor: '#4169e1',
            borderRadius: 100
          }}
        >
          <Text>{cart}</Text>
        </TouchableOpacity>
      );
    }
  }
  returnFooter() {
    if (this.state.redirectPayNowPage == true) {
      return <Footer loggedIn={this.state.showUser} camera="false" orderId={this.state.order._id} />;
    } else {
      return <Footer loggedIn={this.state.showUser} camera="true" />;
    }
  }
  render() {
    return (
      <View style={styles.container}>
          <View>{this.renderHeader()}</View>

        <SafeAreaView style={{ flex: 1 }}>
          <View>
            {/* {this.state.isLoading ? <ActivityIndicator animating color="#4169e1" size="large" style={styles.activityIndicator} /> : null} */}
          </View>
          <ScrollView style={styles.container}>
            <View>
              <View style={styles.bodyContainer}>
                <View style={{height:220}}>
              <Swiper height={200} horizontal={true} showsPagination={true} autoplay={true}>
            <View style={{ flex: 1 }}>
              <Image
                style={{ height: 220 }}
                source={{
                  uri:
                  "https://images.pexels.com/photos/326279/pexels-photo-326279.jpeg?auto=format%2Ccompress&cs=tinysrgb&dpr=2&h=650&w=940"
                    
                }}
              />
               <View style={{alignSelf:'flex-start',position:'absolute',padding:20,marginTop:80}}>
          <Text style={{fontSize:24,color:'#fff',fontWeight:'500'}}>Servitor</Text>
          <Text style={{fontSize:18,color:'#fff',fontWeight:'500'}}>Redefining the way you dine out</Text>
        </View>
            </View>
            <View style={{ flex: 1 }}>
              <Image
                style={{ height: 220, resizeMode: "cover" }}
                source={{
                  uri:
                    "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=format%2Ccompress&cs=tinysrgb&dpr=2&h=650&w=940"

                }}
              />
                <View style={{alignSelf:'flex-start',position:'absolute',padding:20,marginTop:80}}>
          <Text style={{fontSize:24,color:'#fff',fontWeight:'500'}}>Servitor</Text>
          <Text style={{fontSize:18,color:'#fff',fontWeight:'500'}}>Redefining the way you dine out</Text>
        </View>
            </View>
            <View style={{ flex: 1 }}>
              <Image
                style={{ height: 220, resizeMode: "cover" }}
                source={{
                  uri:
                    "https://cdn.pixabay.com/photo/2017/01/26/02/06/platter-2009590_960_720.jpg"
                }}
              />
                <View style={{alignSelf:'flex-start',position:'absolute',padding:20,marginTop:80}}>
          <Text style={{fontSize:24,color:'#fff',fontWeight:'500'}}>Servitor</Text>
          <Text style={{fontSize:18,color:'#fff',fontWeight:'500'}}>Redefining the way you dine out</Text>
        </View>
            </View>
          </Swiper>
          </View>
          

                {
                  this.state.nearby.body
                  ? <Nearby refereshAction={this.getNearby} nearby={true} restos={this.state.nearby} order={this.state.order} />
                  : <View>
                      {/* <Text style={{ fontSize: 45, textAlign: 'center', color: '#4169e1' }}>Servitor</Text>
                      <Text style={{ fontSize: 12, textAlign: 'center', color: '#728575' }}>Redefining the way you dine out</Text> */}
                      {
                        this.state.showRetryButton ?
                        <View>
                          <Text style={{alignSelf: 'center', marginTop: 15}}>Error Occured</Text>
                          <Button onPress={() => this.retry()} style={{alignSelf: 'center', marginTop: 15}}>RETRY</Button>
                        </View>
                        : <ActivityIndicator animating={true} size={'large'} style={{ marginTop: 15 }} />
                      } 
                    </View>
                }

                {
                  this.state.allResturants.body
                  ? <Nearby restos={this.state.allResturants} nearby={false} order={this.state.order} />
                  : null
                }

                {/* <Text onPress={() => Actions.menu()}>Menu</Text>
              <Text onPress={() => Actions.StoreHome()}>StoreHome</Text> */}

                {/* <Text onPress={() => this.scan()} style={styles.textGreen}>
                  Scan The QR Code on your table >>
                </Text> */}
              </View>
            </View>
          </ScrollView>
          <View>{this.returnPayNow()}</View>
          <View>{this.returnFooter()}</View>
          {/* {
            this.state.isConnected 
            ? null
            : <Snackbar
                visible={true}
                duration={300}
                onDismiss={() => {}}
              >
                You're not connected to internet
              </Snackbar>
          } */}
          <Snackbar
            visible={this.state.snackBarVisible}
            duration={3000}
            onDismiss={() => { this.setState({ snackBarVisible: !this.state.snackBarVisible }) }}
          >
            You're not connected to internet
          </Snackbar>
          {/* <Snackbar
            visible={this.state.snackBarConnectionError}
            duration={3000}
            onDismiss={() => { this.setState({ snackBarConnectionError: !this.state.snackBarConnectionError }) }}
          >
            Something went wrong. 😞 We are fixing it.
          </Snackbar> */}
          {this.state.snackBarConnectionError?Actions.nointernet():null}
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    backgroundColor: '#f2f2f2'
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
 
  textGreen: {
    fontSize: 14,
    alignItems: 'center',
    position: 'absolute',
    marginLeft: 'auto',
    marginRight: 'auto',
    left: '20%',
    bottom: 0,
    color: '#4169e1'
  },
  surface: {
    padding: 8,
    height: 100,
    width: 100,
    borderRadius: 100 / 2,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    marginRight: 10,
    marginBottom: 10
  },

});
