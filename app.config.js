export default {
  "expo": {
    "name": "vibecheq",
    "slug": "vibecheq",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "cover",
      "backgroundColor": "#303841"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "googleServicesFile": process.env.GOOGLE_SERVICE_INFO_PLIST,
      "supportsTablet": true,
      "bundleIdentifier": "com.vibecheq.dev"
    },
    "android": {
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ],
      "package": "com.vibecheq.dev"
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
          "androidAppId": "ca-app-pub-9408101332805838~7720216806",
          "iosAppId": "ca-app-pub-9408101332805838~3498696922"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "18fa69b1-f495-4899-9793-d327be69e418"
      }
    }
  }
}
