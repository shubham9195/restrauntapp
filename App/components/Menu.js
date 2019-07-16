/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, AsyncStorage,  TouchableOpacity, Alert, ActivityIndicator, Modal, ScrollView, BackHandler} from 'react-native';
import StarRating from 'react-native-star-rating';
import Header from './Header';
import cloneDeep from 'lodash/cloneDeep';
const utensils = <FontAwesome5 name={'utensils'} size={22} color="#fff" />;
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const plus = <FontAwesome5 name={'plus'} size={16} color="#495057" light />;
const minus = <FontAwesome5 name={'minus'} size={16} color="#495057" light />;
const arrowDown = <FontAwesome5 name={'angle-down'} size={18} color="#ffffff" light />;
const icon2 = <FontAwesome5 name={'ellipsis-v'} size={18} color="#ffffff" />;
import Toast from 'react-native-simple-toast';
import axiosInstance from '../config/interceptor';
import { Actions } from 'react-native-router-flux';
import CheckBox from 'react-native-checkbox';
import { Caption, Chip, Button, IconButton, FAB } from 'react-native-paper'

export default class Menu extends React.Component {
  state = {
    menuItems: [],
    categories: [],
    modalVisible: false,
    noOfItemsModifier: 1,
    cartModifierItem: [],
    modifieredItem: {},
    isLoading: true,
    page: 0,
    price: 0,
    menuData: {},
    checked: [],
    checkBoxChecked: [],
    counter: 0,
    cartItems: [],
    noOfItems: 0,
    tempMenuSectionIndex: '',
    tempMenuDataIndex: '',
    isPreOrder: false
  };
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.home()
     return true;
    });
    if (this.props.storeId) {
      this.setState({storeId: this.props.storeId})
      this.getCategory();
    }
    this.setState({
      isLoading: true
    });
    if (!this.props.tableId) {
      this.setState({
        isPreOrder: true
      });
      this.getCategory();
    }
    if (this.props.tableId) {
      this.getStoreId();
    }
  }


  getStoreId() {
    const self = this;
    axiosInstance
      .get(`table/${this.props.tableId}`)
      .then((res) => {
        self.setState({ storeId: res.data.body.storeId}, () => self.getCategory());   
      })
      .catch(err => console.log(err));
  }

  getCategory = async () => {
    this.setState({ isLoading: true });
    var self = this;
    axiosInstance
      .get('category/menuDataList', {
        params: {
          perPage: 0,
          storeId: self.props.storeId || this.state.storeId
        }
      })
      .then(function (response) {
        self.setState({ isLoading: false });
        self.setState({ menuItems: response.data.body });
      })
      .catch(function (error) {
        console.log('error loading menu', error);
      })
  };

  changeButton(index, section, item) {
    if (item.modifierId) {
      this.setState({ tempMenuSectionIndex: section['index'] });
      this.setState({ tempMenuDataIndex: index });
      item['noOfItems'] = 1;
      this.setState({ modifieredItem: item });
      this.setState({ modalVisible: true });
    } else {
      let tempData = cloneDeep(this.state.menuItems);
      tempData[section['index']].data[index]['noOfItems'] = 1;
      this.setState({ menuItems: tempData });
      this.setState({ cartItems: [...this.state.cartItems, tempData[section['index']].data[index]] });
      setTimeout(() => {
        this.calculatePrice();
      }, 10);
    }
  }

  increaseCounter(item, index, section) {
    if (item.modifierId) {
      let tempItem = {};
      let flag = false;
      this.state.cartItems.map((data, index) => {
        if (data._id == item._id) {
          tempItem = item;
          flag = true;
        }
      });
      if (flag) {
        this.showMessage(tempItem, index, section.index);
      } else {
        this.setState({ modifieredItem: item });
        this.setState({ modalVisible: true });
      }
    } else {
      let tempData = cloneDeep(this.state.menuItems);
      tempData[section['index']].data[index]['noOfItems'] = parseInt(tempData[section['index']].data[index]['noOfItems']) + 1;
      this.setState({ menuItems: tempData });
      this.state.cartItems.map((data, subindex) => {
        if (data._id == tempData[section['index']].data[index]._id) {
          let tempCartData = cloneDeep(this.state.cartItems);
          tempCartData[subindex].noOfItems = tempCartData[subindex].noOfItems + 1;
          this.setState({ cartItems: tempCartData });
        }
      });
      setTimeout(() => {
        this.calculatePrice();
      }, 15);
    }
  }

  decreaseCounter(item, index, section) {
    let tempData = cloneDeep(this.state.menuItems);
    if (!tempData[section['index']].data[index]['noOfItems'] == 0) {
      tempData[section['index']].data[index]['noOfItems'] = parseInt(tempData[section['index']].data[index]['noOfItems']) - 1;
      this.setState({ menuItems: tempData });
      this.state.cartItems.map((data, subindex) => {
        if (data._id == tempData[section['index']].data[index]._id) {
          let tempCartData = cloneDeep(this.state.cartItems);
          tempCartData[subindex].noOfItems = tempCartData[subindex].noOfItems - 1;
          if (tempCartData[subindex].noOfItems == 0) {
            tempCartData.splice(subindex, 1);
          }
          this.setState({ cartItems: tempCartData });
        }
      });
      setTimeout(() => {
        this.calculatePrice();
      }, 15);
    }
  }
  showMessage(item, index, section) {
    Alert.alert(
      'Do you want to repeat the same',
      '',
      [
        {
          text: 'No',
          onPress: () => this.addAnItemWithNewModifier(item, index, section),
          style: 'cancel'
        },
        { text: 'OK', onPress: () => this.increaseCountOfCartItemWithSameModifier(item, index, section) }
      ],
      { cancelable: false }
    );
  }
  increaseCountOfCartItemWithSameModifier(item, index, section) {
    let tempMenuData = cloneDeep(this.state.menuItems);
    tempMenuData[section].data[index]['noOfItems'] = 1;
    this.setState({ menuItems: tempMenuData });
    this.state.cartItems.map((data, index) => {
      if (data._id == item._id) {
        let tempData = cloneDeep(this.state.cartItems);
        tempData[index].noOfItems = tempData[index].noOfItems + 1;
        this.setState({ cartItems: tempData });
      }
    });
    setTimeout(() => {
      this.calculatePrice();
    }, 10);
  }
  addAnItemWithNewModifier(item) {
    item['noOfItems'] = 1;
    this.setState({ modifieredItem: item });
    this.setState({ modalVisible: true });
  }

  goToCart() {
    if (this.state.cartItems.length > 0) {
      this.setState({ isLoading: true });
      const cartDatas = ({
        cartItems: this.state.cartItems,
        cartModifierItem: this.state.cartModifierItem,
        price: this.state.price,
        storeId: this.props.storeId || this.state.storeId,
        tableId: this.props.tableId,
        isPreOrder: this.state.isPreOrder,
        storeName: this.props.storeName
      })
      AsyncStorage.setItem('cartData', JSON.stringify(cartDatas)).then( ()=> {
        Actions.cart({
          data: this.state.cartItems,
          cartModifier: this.state.cartModifierItem,
          price: this.state.price,
          storeId: this.props.storeId || this.state.storeId,
          tableId: this.props.tableId,
          preOrder: this.state.isPreOrder,
          storeName: this.props.storeName
        });
      })
    } else {
      Toast.show('Please add items in cart to continue', Toast.SHORT);
    }
  }
  toggleModal() {
    if (this.state.modalVisible == false) {
      this.setState({ modalVisible: true });
    } else {
      this.setState({ modalVisible: false });
    }
  }

  increaseCounterModifier() {
    let increaseVariable = cloneDeep(this.state.modifieredItem);
    increaseVariable['noOfItems'] = increaseVariable['noOfItems'] + 1;
    this.setState({ modifieredItem: increaseVariable });
  }
  decreaseCounterModifier() {
    let decreaseVariable = cloneDeep(this.state.modifieredItem);
    if (!decreaseVariable['noOfItems'] == 0) {
      decreaseVariable['noOfItems'] = decreaseVariable['noOfItems'] - 1;
      this.setState({ modifieredItem: decreaseVariable });
    }
  }
  addItemModifier() {
    if (this.state.modifieredItem['noOfItems'] == 0) {
      Toast.showWithGravity('Atleast 1 Item Should Be Added', Toast.LONG, Toast.TOP);
    } else {
      this.setState({ modalVisible: false });
      let flag = false;
      this.state.cartItems.map((data, index) => {
        if (data._id == this.state.modifieredItem._id) {
          flag = true;
        }
      });
      if (flag == false) {
        let tempData = cloneDeep(this.state.modifieredItem);
        tempData['selectedModifiers'] = this.state.checkBoxChecked;
        this.setState({ cartItems: [...this.state.cartItems, tempData] });
        let tempDataMenu = cloneDeep(this.state.menuItems);
        tempDataMenu[this.state.tempMenuSectionIndex].data[this.state.tempMenuDataIndex]['multiple'] = true;
        this.setState({ menuItems: tempDataMenu });
      } else {
        let tempData25 = cloneDeep(this.state.modifieredItem);
        tempData25['multiple'] = true;
        tempData25['selectedModifiers'] = this.state.checkBoxChecked;
        this.setState({ cartItems: [...this.state.cartItems, tempData25] });
      }
      this.setState({ checkBoxChecked: [] });
      this.setState({ modifieredItem: {} });
      this.setState({ tempMenuSectionIndex: '' });
      this.setState({ tempMenuDataIndex: '' });

      setTimeout(() => {
        this.calculatePrice();
      }, 15);
    }
  }

  checkBoxChanged(data) {
    if (data._id) {
      let flag = false;
      this.state.checkBoxChecked.map((item, index) => {
        if (item._id == data._id) {
          flag = true;
          let tempData = cloneDeep(this.state.checkBoxChecked);
          tempData.splice(index, 1);
          this.setState({ checkBoxChecked: tempData });
        }
      });
      if (!flag) {
        this.setState({ checkBoxChecked: [...this.state.checkBoxChecked, data] });
      }
    }
  }

  modifierList() {
    if (this.state.modifieredItem.modifierId) {
      return this.state.modifieredItem.modifierId.map((data, index) => {
        return (
          <View style={{ flexDirection: 'row', marginTop: 15 }}>
            {/* <CheckBox 
              // value={this.state.checkBoxChecked[data._id]} 
              // onPress={() => this.checkBoxChanged(data)} 
              onCheck={() => this.testfunction()}
              // value={this.state.trycheck}
              // onValueChange={() => this.setState({ checked: !this.state.trycheck })}
            /> */}
            <CheckBox label="" onChange={(checked) => this.checkBoxChanged(data, checked)} />
            <Text style={{ color: 'grey', flex: 1, fontSize: 16, textAlign: 'left' }}> {data.name}</Text>
            <Text style={{ color: 'grey', flex: 1, fontSize: 16, textAlign: 'center' }}>₹ {data.price}</Text>
          </View>
        );
      });
    }
  }
  calculatePrice() {
    var priceVariable = 0;
    this.state.cartItems.map((data, index) => {
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

  returnModal() {
    return (
      <Modal animationType="slide" transparent={false} visible={this.state.modalVisible} onRequestClose={() => { }}>
        <View style={{ width: '100%' }}>
          <View style={{ paddingTop: 12, paddingBottom: 12, backgroundColor: '#4169e1' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={{ flex: 1 }} onPressIn={() => this.toggleModal()}>
                <Text style={{ flex: 1, textAlign: 'left', marginLeft: 10 }}>{arrowDown}</Text>
              </TouchableOpacity>
              <Text style={{ flex: 1, fontSize: 18, textAlign: 'center', color: '#ffffff' }}>Servitor</Text>
              <Text style={{ flex: 1, textAlign: 'right', marginRight: 10 }}>{}</Text>
            </View>
          </View>
        </View>
        <View style={styles.containerMenu}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ flex: 1, fontSize: 18 }}>{this.state.modifieredItem.name}</Text>
            <Text
              onPress={() => {
                this.increaseCounterModifier();
              }}
              style={{ flex: 1, textAlign: 'right' }}
            >
              {plus}
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ flex: 1, fontSize: 16, color: '#4169e1' }}>₹ {this.state.modifieredItem.price}</Text>
            <Text>{this.state.modifieredItem.noOfItems}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text
              onPress={() => {
                this.decreaseCounterModifier();
              }}
              style={{ flex: 1, textAlign: 'right' }}
            >
              {minus}
            </Text>
          </View>
          {this.modifierList()}
        </View>
        <View style={{ width: '100%' }}>
          <TouchableOpacity
          onPress={() => {
            this.addItemModifier();
          }}
          >
          <View style={{ height: 50, padding: 10, backgroundColor: '#4169e1', alignItems: 'center' }}>
            <Text
              
              style={{ color: '#ffffff', fontSize: 18 }}
            >
              ADD ITEM
            </Text>
          </View>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  returnData() {
    var self = this;
    return this.state.menuItems.map((mainItem, index) => {
      return (
        <View>
          {/* <Text style={styles.title}>{mainItem.title}</Text> */}
          <Chip mode="outlined" style={{ backgroundColor: '#fff', 
          alignItems: 'center', fontSize: 8,
          marginVertical: 10, marginHorizontal: 10, 
          width: 120, marginLeft:'3%', marginRight: '3%' }}>{mainItem.title}</Chip>
          {self.renderSubContent(mainItem.data, mainItem)}
        </View>
      );
    });
  }
  renderSubContent(category, mainIndex) {
    return category.map((item, index) => {
      if (item.isActive == true) {
        return (
          <View>
            
            <View style={styles.containerBody}>
              <ScrollView>
                <View style={styles.content}>
                  <View style={styles.contentHeader}>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={[styles.textBig, { flex: 1, textAlign: 'left'}]}>{item.name}</Text>
                      <StarRating
                        disabled={true}
                        maxStars={5}
                        rating={item.rating}
                        starSize={15}
                        fullStarColor={'#f7a727'}
                        selectedStar={(rating) => this.onStarRatingPress(rating, item._id, orderId, orderIndex, itemIndex)}
                      />
                      <View style={{ flex: 1, textAlign: 'right' }}>
                        <View style={[item.noOfItems > 0 ? styles.displayNone : styles.displayFlex]}>
                          {
                            this.props.order && this.props.order._id
                              ? null
                              : <Button mode='outlined' uppercase={false} style={{ width: 50, height: 25, justifyContent: 'center', alignSelf: 'flex-end' }} onPress={() => { this.changeButton(index, mainIndex, item); }}>Add</Button>
                          }
                        </View>
                        <View style={[!item.noOfItems ? styles.displayNone : styles.displayFlex]}>
                          <View style={[item.multiple ? styles.displayNone : styles.displayFlex]}>

                            <View style={{ flex: 1, flexDirection: 'row', marginLeft: 40 }}>
                              <IconButton
                                icon="remove"
                                color='grey'
                                size={15}
                                style={{ backgroundColor: '#eee', borderRadius: 5 }}
                                onPress={() => this.decreaseCounter(item, index, mainIndex)}

                              />
                              <Text style={{ marginTop: 10 }}>{item.noOfItems}</Text>
                              <IconButton
                                icon="add"
                                color='grey'
                                size={15}
                                style={{ backgroundColor: '#eee', borderRadius: 5 }}
                                onPress={() => this.increaseCounter(item, index, mainIndex)}
                              />
                            </View>
                          </View>
                        </View>
                        <View style={[!item.noOfItems ? styles.displayNone : styles.displayFlex]}>
                          <View style={[!item.multiple ? styles.displayNone : styles.displayFlex]}>
                            <Text
                              onPress={() => this.increaseCounter(item, index, mainIndex)}
                              style={[
                                {
                                  borderColor: '#4169e1',
                                  borderWidth: 0.5,
                                  padding: 3,
                                  textAlign: 'center',
                                  borderRadius: 6,
                                  paddingLeft: 8,
                                  paddingRight: 8,
                                  color: '#4169e1'
                                }
                              ]}
                            >
                              Item Added
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', paddingLeft: 5 }}>
                      <Text style={{ textAlign: 'left', fontSize: 14, color: '#4169e1' }}>₹{item.price}</Text>
                      {/* <View style={{ paddingLeft: 10, marginTop: 3 }}>{this.returnStarRating(item)}</View> */}
                    </View>
                    <View style={{ flexDirection: 'row', paddingLeft: 5 }}>
                      {/* <Text style={[styles.textSmall, { textAlign: 'left', color: '#003300' }]}>{item.description}</Text> */}
                      <Caption>{item.description}</Caption>
                    </View>
                  </View>
                </View>

              </ScrollView>
            </View>
          </View>
        );
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Header showUser={true} />
        </View>
        <View>
          {
            this.state.isLoading
              ? <ActivityIndicator animating color="#4169e1" size="large" style={styles.activityIndicator} />
              : null
          }
        </View>
        <View style={{ bottom:0 }}>
          {
            this.props.order && this.props.order._id
              ? <Text style={{ padding: 15 }}>You already have items pending on your cart</Text>
              : null
          }
          <ScrollView style={{height: '80%'}}>{this.returnData()}</ScrollView>
          </View>
        {
          this.props.order && this.props.order._id
            ? null
            : <TouchableOpacity>
              {
                this.state.isLoading
                  ? null
                  :

                  <TouchableOpacity>      
                     <TouchableOpacity style={{ padding: 15, backgroundColor: '#4169e1',
                       marginLeft:'3%', marginRight: '3%', borderRadius: 4 ,backgroundColor: '#1C47A3',
                       fontColor: '#FFFFFF', height: '43%', elevation: 5 }}>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', position: 'relative', paddingHorizontal: 15 }}>
                          <TouchableOpacity onPressIn={() => this.goToCart()} style={{ flex: 1 }}>
                            <Text  style={{ color: '#ffffff', fontSize: 12 }}>{this.state.cartItems.length} Items</Text>
                            <Text  style={{ color: '#ffffff', fontSize: 12 }}>{this.state.price} ₹</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={{ flex: 1 }} onPressIn={() => this.goToCart()}>
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                                {
                                  this.state.isPreOrder
                                  ? <Text style={{ flex: 1, textAlign: 'right', color: '#ffffff', zIndex: 1 }}>Place your Preorder</Text>
                                  : <Text style={{ flex: 1, textAlign: 'right', color: '#ffffff', zIndex: 1 }}>View Cart</Text>
                                }
                                <Text style={{ marginLeft: 10 }}>{utensils}</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      </TouchableOpacity>
                  </TouchableOpacity>

              }

            </TouchableOpacity>
        }
        <View>{this.returnModal()}</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    backgroundColor: '#fff',
    position: 'relative',
    height: '100%',
    width: '100%'


    // backgroundColor: 'red',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  textBig: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600'
  },
  textSmall: {
    fontSize: 12,
    color: '#000000'
  },
  containerBody: {
    // backgroundColor: '#bbc0c4',
    backgroundColor: '#fff',




  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    marginTop: 50
  },
  containerInner: {
    backgroundColor: '#ffffff'
  },
  titleContainer: {
    flex: 1,
    backgroundColor: '#eee',
    marginTop: 5,
    padding: 10,
    // height: Dimensions.get('screen').height - 180,
    // marginBottom: 50

  },
  title: {
    fontSize: 14,
    fontWeight: '100',
    color: '#808080'
  },
  content: {
    // flex:1,
    backgroundColor: '#ffffff',
    width: '100%',
    height: '100%'
    // paddingLeft: 10,
    // height:Dimensions.get('screen').height-180






  },
  contentHeader: {
    backgroundColor: '#ffffff',
    marginTop: 5,
    paddingHorizontal: 25,
    paddingVertical: 8,
    marginLeft: '2%',
    marginRight: '2%',
    elevation: 1,
    // borderBottomColor: '#000000',
    // borderBottomWidth: 1,
    marginVertical: 5,
    // elevation:6



  },
  name: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  displayNone: {
    display: 'none'
  },
  displayFlex: {
    display: 'flex'
  },
  containerMenu: {
    backgroundColor: '#ffffff',
    flex: 1,
    borderBottomColor: '#000000',
    borderBottomWidth: 1,
    borderRadius: 8,
    padding: 10
  }
});
