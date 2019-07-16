import axios from 'axios';
import { AsyncStorage } from 'react-native';
import { SERVER_URL } from 'react-native-dotenv';
let axiosInstance = axios.create({
  // baseURL: 'http://servitor.in/api/'
  baseURL:'https://servitor-backend.herokuapp.com/api/'
  // baseURL: 'http://10.170.22.58:1337/api/'
  // baseURL: 'http://192.168.43.10:1337/api/'
});
state = {
  token: ''
};

axiosInstance.interceptors.request.use(
  (config) => {
    if (!this.state.token) {
      this._retrieveData();
    }

    console.log('token', this.state.token);
    config.headers.authorization = 'Bearer ' + this.state.token;

    // console.warn('Interceptor config', config);

    return config;
  },
  (error) => Promise.reject(error)
);

_retrieveData = async () => {
  if ((this.state && !this.state.token) || this.state.token == '') {
    const value = await AsyncStorage.getItem('servitor-token');
    this.state.token = value;
    console.log('retrieve interceptor', this.state, value);
  }
};

this._retrieveData();

export default axiosInstance;
