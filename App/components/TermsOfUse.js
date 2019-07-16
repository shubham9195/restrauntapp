import React from 'react';
import { 
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  CheckBox,
  Platform,
  Button
} from 'react-native';
import Pdf from 'react-native-pdf';
export default class extends React.Component {
  render() {
    let yourPDFURI = {uri:'bundle-assets://documents/TermsofUse.pdf', cache: true};
    return (
      <View style={{flex: 1}}>
        <Pdf ref={(pdf)=>{this.pdf = pdf;}}
          source={yourPDFURI}
          style={{flex: 1}}
          onError={(error)=>{console.log('error', error);}}
        />
      </View>
    )
  }
}