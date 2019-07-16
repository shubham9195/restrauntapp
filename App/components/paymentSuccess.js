/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { View,Text,BackHandler} from 'react-native';
import { Actions } from 'react-native-router-flux';
import {Button, IconButton} from "react-native-paper"
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const success = <FontAwesome5 name={'thumbs-up'} size={200} color="#A8BBE6" solid />;

export default class extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      Actions.home()
      return true;
    });
  }

      render() {
    return (
        <View style={{flex: 1}}>
          <Text style={{ flex: 1, textAlign: 'center' , marginVertical: '20%'}}  >
        {success}
      </Text>
      <Text style={{ textAlign: 'center' , marginBottom: '5%', color: '#3B4357', fontSize: 40}}  >
            Payment Success!
      </Text>
      <Text style={{ textAlign: 'center' ,marginBottom: '30%', color: '#3B4357', fontSize: 20}}  >
            Your Payment for Order ID was successfully completed.
      </Text>
      {
        this.props.preOrder ? 
        <Button   style={
          {marginBottom:50,
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
               storeId : this.props.storeId,
               orderId : this.props.orderId
           })}>
               Navigate to Destination
      </Button>

        :

        <Button   style={
          {marginBottom:50,
           borderRadius: 4 ,
           backgroundColor: '#1C47A3', 
           marginLeft: '5%',
           fontColor: '#FFFFFF',
           height: 65,
           justifyContent: 'center',
           alignItems: 'center', 
           marginRight: '5%'}}
           mode="contained" 
           onPress={() => 
            Actions.menu({
               storeId: this.props.storeId, 
               search: true, 
               order: null
              })
            }>
               Explore Menu
      </Button>


      }
     
 </View>
  
    )
  }
}


