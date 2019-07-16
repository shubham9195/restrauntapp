# Servitor Customer app

App is built on react-native using native modules. Hence no expo.

### Development Setup

- Android SDK or Android Studio ([Install](https://developer.android.com/studio/install))
- Node.js & NPM
- Python 2 ([Install](https://www.python.org/downloads/release/python-2716/))
- JDK 8 ([Install](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html))
- React Native - `npm install -g react-native`

### Changes required for development

- Change `baseURL` in `App/config/interceptor.js`

### Changes requried for Release Build

- Change `baseURL` in `App/config/interceptor.js` to `http:\\servitor.in\api`

### Few cli commands

- Run app - `react-native run-android`
- Run logs if in emulator - `react-native log-android`
- Clean if new native module added -  `cd android && ./gradlew clean`
- Release build - `cd android && ./gradlew assembleRelease`
- Check devices - `adb devices`
- Bring react native menu on device - `adb shell input keyevent 82`
- Install app from cli - `adb install <name>.apk`
