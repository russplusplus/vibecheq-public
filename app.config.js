export default {
  "expo": {
    "name": "Vibecheq",
    "slug": "vibecheq",
    "version": "1.0.0",
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
      "googleServicesFile": process.env.GOOGLE_SERVICE_INFO_PLIST ?? "./GoogleService-Info-PROD.plist",
      "supportsTablet": false,
      "bundleIdentifier": "com.vibecheq.prod"
    },
    "android": {
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON ?? "./google-services-PROD.json",
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
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "18fa69b1-f495-4899-9793-d327be69e418"
      }
    }
  }
}
