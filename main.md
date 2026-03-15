// {
//   "name": "expensetrackerapp",
//   "version": "1.0.0",
//   "main": "index.js",
//   "scripts": {
//     "start": "expo start",
//     "android": "expo start --android",
//     "ios": "expo start --ios",
//     "web": "expo start --web"
//   },
//   "dependencies": {
//     "expo": "~55.0.6",
//     "expo-status-bar": "~55.0.4",
//     "react": "19.2.0",
//     "react-native": "0.83.2"
//   },
//   "private": true
// }


app.json
{
  "expo": {
    "name": "expenseTrackerApp",
    "slug": "expenseTrackerApp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
