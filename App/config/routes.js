import React from 'react';
import { Router, Scene, ActionConst, Tabs, Stack } from 'react-native-router-flux';
import { Text } from 'react-native'; 
import Login from '../components/Login';
import register from '../components/Register';
import home from '../components/Home';
import StoreHome from '../components/StoreHome';
import ScanScreen from '../components/ScanScreen';
import Menu from '../components/Menu';
import Cart from '../components/Cart';
import forgotPassword from '../components/ForgotPassword';
import Profile from '../components/Profile';
import Orders from '../components/Orders';
import PayNow from '../components/PayNow';
import ChangePassword from '../components/ChangePassword';
import VisitedRestaurants from '../components/VisitedRestaurants';
import PaymentCalculation from '../components/PaymentCalculation';
import LocationScreen from '../components/LocationScreen';
import OTPScreen from '../components/OTPScreen';
import ForgotPassword from '../components/ForgotPasswordSreen';
import TermsOfUse from '../components/TermsOfUse';
import PrivacyPolicy from '../components/PrivacyPolicy';
import Header from '../components/Header';
import PreOrderTracking from '../components/PreOrderTracking';
import SearchPage from '../components/SearchPage'
import EmptyCart from '../components/EmptyCart'
import paymentSuccess from '../components/paymentSuccess'
import pendingOrder from '../components/pendingOrders'
import Onboarding from '../components/onboarding'
import NoInternet from '../components/Nointernet'

const Routes = () => {
  return (
    <Router>
      <Scene key="root">
        <Scene key="onboarding" hideNavBar component={Onboarding} title="Onboarding"/>
        <Scene key="login" hideNavBar component={Login} title="Login" />
        <Scene key="register" hideNavBar component={register} title="Register" />
        <Scene key="forgot" hideNavBar component={forgotPassword} title="Forgot" />
        <Scene key="home" hideNavBar 
        // gesturesEnabled={false} 
        initial type={ActionConst.RESET} 
        component={home} title="Home" />
        <Scene key="StoreHome" hideNavBar component={StoreHome} title="StoreHome" />
        <Scene key="ScanScreen" hideNavBar component={ScanScreen} title="ScanScreen" />
        <Scene key="menu" hideNavBar component={Menu} title="Menu" />
        <Scene key="cart" hideNavBar component={Cart} title="Cart" />
        <Scene key="profile" hideNavBar component={Profile} title="Profile" />
        <Scene key="orders" hideNavBar component={Orders} title="Orders" />
        <Scene key="paynow" hideNavBar component={PayNow} title="PayNow" />
        <Scene key="payment" hideNavBar component={PaymentCalculation} title="payment" />
        <Scene key="changePassword" hideNavBar component={ChangePassword} title="Change Password" />
        <Scene key="visitedRestaurants" hideNavBar component={VisitedRestaurants} title="Visited Restaurant" />
        <Scene key="locationScreen" hideNavBar component={LocationScreen} title="Select Location" />
        <Scene key="otp" hideNavBar component={OTPScreen} title="Phone number verification" />
        <Scene key="forgotpass" hideNavBar component={ForgotPassword} title="Enter new password" />
        <Scene key="preordertracking" hideNavBar component={PreOrderTracking} title="Tracking your order" />
        <Scene key="search" hideNavBar component={SearchPage} title="Search Page"/>
        <Scene key="emptycart" hideNavBar component={EmptyCart} title="Empty Card"/>
        <Scene key="paymentsuccess" hideNavBar component={paymentSuccess} title="Payment Success"/>
        <Scene key="pendingorders" hideNavBar component={pendingOrder} title="pending orders"/>
        <scene key="nointernet" hideNavBar component={NoInternet} title="No Internet"/>


        {/* <Scene key="terms" hideNavBar title="Terms and Conditions" default="termstab">
          <Scene
            tabs={true}
            key="termstab"
            hideNavBar={false}
            navBar={Header}
            wrap={false}
          >
            <Scene key="termsofuse" component={TermsOfUse} title="Terms of Use" />
            <Scene key="privacypolicy" component={PrivacyPolicy} title="Privacy Policies" />
          </Scene>
        </Scene> */}
        <Scene key="terms" hideNavBar title="Terms and Conditions" default="termstab">
          <Tabs
            key="tabbar"
            routeName="tabbar"
            backToInitial
            // tabBarStyle = {{ marginBottom: 25 }}
            labelStyle = {{ marginBottom: 15, fontSize: 18 }}
          >
            <Stack
              key="tab_1"
              title="Terms of Uses"
              tabBarLabel="Terms of Uses"
              inactiveBackgroundColor="#FFF"
              activeBackgroundColor="#DDD"
              navBar={Header}
            >
              <Scene key="tab_1_1" component={TermsOfUse} title="Terms of Use" />
            </Stack>
            <Stack
              key="tab_2"
              title="Privacy Policies"
              tabBarLabel="Privacy Policies"
              inactiveBackgroundColor="#FFF"
              activeBackgroundColor="#DDD"
              navBar={Header}
            >
              <Scene key="tab_1_2" component={PrivacyPolicy} title="Privacy Policies" />
            </Stack>
          </Tabs>
        </Scene>
      </Scene>
    </Router>
  );
};

export default Routes;
