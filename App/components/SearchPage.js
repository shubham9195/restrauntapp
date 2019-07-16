import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TouchableWithoutFeedback, Image,BackHandler} from 'react-native';
import { Searchbar, Caption, Card, Title, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import { Actions } from 'react-native-router-flux';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import axiosInstance from '../config/interceptor';
const icon = <FontAwesome5 name={'angle-left'} size={18} color="#ffffff" />;
const user = <FontAwesome5 name={'user-circle'} size={18} color="#ffffff" solid />;
const binocular = <FontAwesome5 name={'binoculars'} size={66} color="#4169E1" solid />;
const leftArrow = <FontAwesome5 name={'arrow-left'} size={18} solid />
const search = <FontAwesome5 name={'search'} solid />
export default class extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    results: [],
    showLoader:false
  };
 
  
  searchForResturants(name) {
    this.setState({showLoader:true})
    if (name.length > 2) {
      setTimeout(() => {
        axiosInstance.get(`store/list?search=${name}`)
          .then(res => {
            if (res.data.body.length < 1) {
              this.searchForDishes(name);
              
            } else {
              this.setState({
                results: res.data.body,
                showLoader:false,
                searched: true
              });
            }
          })
      }, 600);
    }
  }

  searchForDishes(name) {
    setTimeout(() => {
      axiosInstance.get(`menu/list?search=${name}`)
        .then(res => {
          this.setState({
            results: res.data.body,
            searched: true
          });
        })
        .catch(err => console.log('err', err));
    }, 600);
  }

  goToStore(_id) {
    Actions.menu({ storeId: _id, search: true, order: {} })
  }

  goBack = async () => {
    Actions.pop();
  };
  goToProfile = async () => {
    if (Actions.currentScene !== 'profile') {
      Actions.profile();
    }
  };
  componentDidMount() {
    // this.setState({ cartData: this.props.data });
    BackHandler.addEventListener('hardwareBackPress', () => {
    Actions.home()
    return true;
    });
  }


  render() {
    return (
      <View style={{flex:1}} >
        <Searchbar
          placeholder="Search for Restraunts or dishes"
          onChangeText={query => this.searchForResturants(query)}
          icon={this.state.searched ? 'arrow-back' : 'search'}
          onIconPress={() => this.state.searched ? Actions.pop() : null}
        // value={firstQuery}
        />
        <View style={{flex:1,justifyContent:'center'}}>
        {
          this.state.results && this.state.results.length && this.state.showLoader==false
            ?
            <FlatList
              keyExtractor={item => item._id}
              data={this.state.results}
              renderItem={({ item }) =>
                <TouchableWithoutFeedback onPressIn={() => this.goToStore(item._id)}>
                  <Card style={{marginVertical:10,elevation:8,width:'90%',alignSelf:'center'}}>
                    <Card.Content>
                      {
                        item.storeId
                        ? <Title>{item.storeId.name}</Title>
                        : <Title>{item.name}</Title>
                      }
                      <Paragraph>{item.address || Object.keys(item).includes('address') ? item.address : item.storeId.address}</Paragraph>
                      <Caption>{(item.cuisine && item.cuisine.length) || Object.keys(item).includes('cuisine') ? item.cuisine + ' ' : item.storeId.cuisine + ' '}</Caption>
                    </Card.Content>
                    {/* <Text>{item.name}</Text> */}
                    {/* <Text>{item.address}</Text> */}
                    {/* <Caption>{item.cuisine + ' '}</Caption> */}
                  </Card>
                </TouchableWithoutFeedback>
              }></FlatList>
            : null
            
        }
        
        {/* TODO: Shubham center the following horizontally and vertically. This will be shown when no matching resturant is found */}
        {
          this.state.results && !this.state.results.length && this.state.searched
            ? <View style={{alignItems:'center', justifyContent: 'center' }}>
              <View><Image source = {require('../images/No-result.png')} /></View>
              <View style={{marginVertical:50}}>
              <Text style={{textAlign:'center',fontSize:20}}>Sorry!{"\n"} We Could't find the resturant</Text>
              </View>
              <Button mode="contained" onPress={()=>{
                Actions.home()
              }}>Home</Button>
            </View>
            : 
            <View>
              {
                !this.state.showLoader && !this.state.results?
            <Text style={{fontWeight:'bold'}}>Search The Restraunts</Text>:
            <ActivityIndicator animating={this.state.showLoader}
            
            />
              }
            </View>
        }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
