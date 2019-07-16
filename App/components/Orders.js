/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { NativeModules, StyleSheet, Text, View, LayoutAnimation, FlatList, ActivityIndicator,BackHandler } from 'react-native';
import{List, Divider, Headline, Title, Paragraph, Caption,Surface,Avatar} from "react-native-paper"
import { Actions } from 'react-native-router-flux';
import Header from './Header';
import StarRating from 'react-native-star-rating';
import axiosInstance from '../config/interceptor';
import cloneDeep from 'lodash/cloneDeep';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const down = <FontAwesome5 name={'caret-down'} solid size={20}/>
const history = <FontAwesome5 name={'history'} solid size={16} />
const star =<FontAwesome5 name={'star'} solid size={20} color="gold"/>
const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
export default class extends React.Component {
  state = {
    menuItems: [],
    isLoading: false,
    page: 0,
    isRefreshing: false,
    modalVisible: false,
    isHidden: true,
    readMoreId: '',
    starCount: 3.5,
  };
  storeId;
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.setState({ isLoading: true });
    this.getOrder();
    BackHandler.addEventListener('hardwareBackPress', () => {
    Actions.profile()
    return true;
});
}

  handleLoadMore = () => {
    this.setState(
      {
        page: this.state.page + 1
      },
      () => {
        this.getOrder();
      }
    );
  };

  onStarRatingPress(rating, itemId, orderId, orderIndex, itemIndex) {
    let tempData = cloneDeep(this.state.menuItems);
    tempData[orderIndex].items[itemIndex]['rating'] = rating;
    this.setState({ menuItems: tempData, rating: rating });
    this.state.menuItems.forEach((e) => {
      this.storeId =  e.storeId._id;
    })
    axiosInstance
      .put('order/rateProduct', {
        orderId: orderId,
        itemId: itemId,
        rating: rating,
        userId : this.props.userId,
        storeId: this.storeId
      })
      .then(function(response) {})
      .catch(function(error) {
        console.log('error in rating item' ,error);
      });
  }
  returnStarRating(item, orderId, orderIndex, itemIndex) {
    if (item.rating) {
      starCount = item.rating;
      return (
        <StarRating
          disabled={true}
          maxStars={5}
          rating={starCount}
          starSize={30}
          fullStarColor={'#f7a727'}
          selectedStar={(rating) => this.onStarRatingPress(rating, item._id, orderId, orderIndex, itemIndex)}
        />
      );
    } else {
      starCount = 0;
      return (
        <StarRating
          disabled={false}
          maxStars={5}
          rating={starCount}
          starSize={30}
          selectedStar={(rating) => this.onStarRatingPress(rating, item._id, orderId, orderIndex, itemIndex)}
        />
      );
    }
  }

  getOrder = async () => {
    if (this.props.userId) {
      var self = this;
      console.log('order page', self.props.userId, self.state.page);
      axiosInstance
        .get('order/list', {
          params: {
            userId: self.props.userId,
            page: self.state.page,
            status: 'order-completed'
          }
        })
        .then(function(response) {
          self.setState({ isLoading: false });
          self.setState({
            menuItems: [...self.state.menuItems, ...response.data.body] // assuming response.data is an array and holds new records
          });
        })
        .catch(function(error) {
          self.setState({ isLoading: false });
          // handle error
          console.log('error in getting order' , error);
        })
    }
  };
  readMore = (id) => {
    LayoutAnimation.easeInEaseOut();
    if (this.state.readMoreId == id) {
      if (this.state.isHidden === true) {
        this.setState({ isHidden: false });
      } else {
        this.setState({ isHidden: true });
      }
    } else {
      this.setState({ readMoreId: id });
      this.setState({ isHidden: false });
    }
  };

  retutnData(data, orderIndex) {
    return data.items.map((item, itemIndex) => {
      if (itemIndex !== 0) {
        return (
          <View style={{ paddingLeft: 5, paddingTop: 5 }}>
            <Text style={{ textAlign: 'left', fontSize: 16 ,color:'#003300'}}>{item.name}</Text>
            <View style={{ flex:1}}>
              <Caption>₹{item.price}</Caption>
              <View style={{ paddingHorizontal: 60, marginTop: 3 }}>{this.returnStarRating(item, data._id, orderIndex, itemIndex)}</View>
            </View>
          </View>
        );
      }
    });
  }

  showViewItems(item) {
    if (item.items.length > 1) {
      return (
        <Text onPress={() => this.readMore(item._id)} style={{ textAlign: 'right',color:'grey',padding:5}}>
        {down}
        </Text>
      );
    }
  }
  showRatingOptionBox(){
    if(!item.items.rating){
      return(
        <StarRating
          disabled={true}
          maxStars={5}
          rating={starCount}
          starSize={25}
          fullStarColor={'#f7a727'}
          selectedStar={(rating) => this.onStarRatingPress(rating, item._id, orderId, orderIndex, itemIndex)}
        />
      )
    }
  }
  returnOrders() {
    if (this.state.menuItems && this.state.menuItems.length !== 0) {
      return (
        <FlatList
          data={this.state.menuItems}
          renderItem={({ item, index }) => (       
            <View>
              <Surface style={styles.surface}>
              <View style={{ flexDirection: 'row' ,justifyContent:'space-between'}}>
              <Avatar.Image size={28} source={require('../images/foodyicon.png')} />
                {/* <Text style={[styles.textBig, { textAlign: 'left' }]}>ODR-{item.storeId.name}</Text> */}
                <Title style={{color:'#a52a2a'}}>ODR-{item.storeId.name}</Title>
                <View>{this.showViewItems(item)}</View>

              </View>
              <View style={{ flexDirection: 'row', justifyContent:'space-between',padding:10 }}>
                <Text style={{fontSize:16,color:'#003300'}}>{item.items[0].name}</Text>
                <Caption style={{fontSize:16}}>₹{item.items[0].price}</Caption>
                <Text>{star} {item.items[0].rating || 0}/5</Text>
              </View>              
                <View style={{ paddingHorizontal: 60, marginTop: 3 }}>{this.returnStarRating(item.items[0], item._id, index, 0)}</View>

              
                <View>
                {
                  item.items.length < 2 ?
                  <View>

                  <Text style={{fontWeight: '500', color: '#000', marginBottom: '2%'}}>Billing Details</Text>
                  <View style={styles.billText}>
                  <Text >{'Token Number : '}</Text>
                  <Text >{'ORD-'+item.tokenNumber }</Text>
                  </View>
                  
                  <View style={styles.billText}>
                  <Text>{'Payment Method : '}</Text>
                  <Text>{item.paymentType }</Text>
                  </View>

                  <View style={styles.billText}>
                  <Text>{'Total Price : '}</Text>
                  <Text>{'₹ '+item.totalPrice+'.00'}</Text>
                  </View>

                  {
                    item.tax ?  
                    <View style={styles.billText}>
                    <Text>{'Tax : '}</Text>
                    <Text>{'₹ ' + (item.totalPrice * (item.tax/100)).toFixed(2)}</Text>
                    </View>
                      :         
                    <View style={styles.billText}>
                    <Text>{'Tax : '}</Text>
                    <Text>{'₹ 0'}</Text>
                    </View>
                  }
                  <Divider
                    />
                  {
                    item.totalPricePayed ? 
                    <View style={styles.billText}>
                    <Text>{'Amount Payed : '}</Text>
                    <Text>{'₹ ' +item.totalPricePayed + '.00'}</Text>
                    </View>
                    :
                    <View style={styles.billText}>
                    <Text>{'Amount Payed : '}</Text>
                    <Text>{'₹ 0 '}</Text>
                    </View>
                  }
                  </View>
                  : null 
                }
              </View>
              <View style={[this.state.readMoreId != item._id ? styles.displayNone : styles.displayFlex]}>
                <View style={[this.state.isHidden ? styles.displayNone : styles.displayFlex]}>{this.retutnData(item, index)}</View>
              </View>
              <View>
                {
                  item.items.length > 1 ?
                  <View>

                  <Text style={{fontWeight: '500', color: '#000', marginBottom: '2%', marginTop: '2%'}}>Billing Details</Text>
                  <View style={styles.billText}>
                  <Text >{'Token Number : '}</Text>
                  <Text >{'ORD-'+item.tokenNumber }</Text>
                  </View>
                  
                  <View style={styles.billText}>
                  <Text>{'Payment Method : '}</Text>
                  <Text>{item.paymentType }</Text>
                  </View>

                  <View style={styles.billText}>
                  <Text>{'Total Price : '}</Text>
                  <Text>{'₹ '+item.totalPrice+'.00'}</Text>
                  </View>

                  {
                    item.tax ?  
                    <View style={styles.billText}>
                    <Text>{'Tax : '}</Text>
                    <Text>{'₹ ' + item.tax}</Text>
                    </View>
                      :         
                    <View style={styles.billText}>
                    <Text>{'Tax : '}</Text>
                    <Text>{'₹ 0'}</Text>
                    </View>
                  }
                  <Divider
                    />
                  {
                    item.totalPricePayed ? 
                    <View style={styles.billText}>
                    <Text>{'Amount Payed : '}</Text>
                    <Text>{'₹ ' +item.totalPricePayed + '.00'}</Text>
                    </View>
                    :
                    <View style={styles.billText}>
                    <Text>{'Amount Payed : '}</Text>
                    <Text>{'₹ 0 '}</Text>
                    </View>
                  }
                  </View>
                  : null 
                }
              </View>
              </Surface>
            </View>
          )}
          extraData={this.state}
          keyExtractor={(item) => item._id}
          onEndReached={this.handleLoadMore}
          onEndReachedThreshold={0.4}
        />
      );
    } else {
      return <Text style={{ fontSize: 16, paddingVertical: '50%', textAlign: 'center' }}>You are yet to make an order</Text>;
    }
  }

  render() {
    const { menuItems } = this.state;
    return (
      <View style={styles.container}>
        <View>
          <Header showUser={false} />
        </View>
        <View style={styles.bodyContainer}>
          <View style={styles.container}>
            {this.state.isLoading ? <ActivityIndicator animating color="#4169e1" size="large" style={styles.activityIndicator} /> : null}
          </View>
          {/* <Text style={{fontSize: 20}}>Order History</Text> */}
          <List.Subheader>{history} Order History  </List.Subheader>
          <Divider/>
          {this.returnOrders()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    height: 80
  },
  displayNone: {
    height: 0,
    width: 0
  },
  displayFlex: {
    display: 'flex'
  },
  bodyContainer: {
    borderRadius: 2,
    margin: 5,
    padding: 5,
    marginBottom: 100,
    backgroundColor: '#ffffff'
  },

  surface: {
    padding: 8,
    width: '95%',
    justifyContent: 'center',
    alignSelf:'center',
    marginVertical:10,
    elevation: 4,
    borderRadius:5
  },
  textBig: {
    fontSize: 18
  },
  textSmall: {
    color: '#4169e1',
    fontSize: 14
  },
  text: {
    textAlign: 'right',
    color: '#3f2949',
    marginTop: 10
  },
  billText: {
    marginRight: '2%',
    marginLeft: '2%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
