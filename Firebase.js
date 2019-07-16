import * as firebase from 'firebase';
import 'firebase/firestore';
import {Platform} from 'react-native';

const config = {
    apiKey: "AIzaSyAXt4DF4WIBmxs4W7FlXrsnIM2693asoxs",
    authDomain: "fire-store-try.firebaseapp.com",
    databaseURL: "https://fire-store-try.firebaseio.com",
    projectId: "fire-store-try",
    storageBucket: "",
    messagingSenderId: "342318368909",
    appId: "1:342318368909:web:6b972140120cabd3"
}

// if (Platform.OS !== 'web') {
//     window = undefined;
// }

var app = firebase.initializeApp(config);

const db =  firebase.firestore();

module.exports = {
    db
};