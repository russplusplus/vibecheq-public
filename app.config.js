export default {
  "expo": {
    "name": "Vibecheq",
    "slug": "vibecheq",
    "version": "1.0.11",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "cover",
      "backgroundColor": "#303841"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "googleServicesFile": process.env.GOOGLE_SERVICE_INFO_PLIST ?? "./GoogleService-Info.plist",
      "supportsTablet": true,
      "bundleIdentifier": "com.vibecheq.prod"
    },
    "android": {
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#303841"
      },
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ],
      "package": "com.vibecheq.prod"
    },
    "androidStatusBar": {
      "translucent": "false"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Vibecheq to use your camera"
        }
      ],
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ],
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-3618369904609105~5934697428",
          "iosAppId": "ca-app-pub-3618369904609105~8748563025"
        }
      ],
      "expo-font"
    ],
    "extra": {
      "eas": {
        "projectId": "18fa69b1-f495-4899-9793-d327be69e418"
      }
    }
  }
}
