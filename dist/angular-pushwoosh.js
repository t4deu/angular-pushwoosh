(function(angular) {
  'use strict';
  angular.module('pushwooshNotification', [])
  .provider('$pushNotification', function() {
    var settings = {
      appId: null,
      appName: null,
      gcmProjectNumber: null,
      onPushNotification: null,
      onRegisterSuccess: null,
      onRegisterError: null
    };
    var registerSettings = {
      android: {},
      ios: {
        alert: true,
        badge: true,
        sound: true
      }
    };
    var api = {
      isAvailable: function() {
        return (typeof window.plugins !== 'undefined')
                && (typeof window.plugins.pushNotification !== 'undefined');
      },
      getTags: function() {}
    };

    api.pushNotification = api.isAvailable() ? window.plugins.pushNotification : null;

    var registerPushwoosh = function(params, callback) {
      try {
      //set push notifications handler
      document.addEventListener('push-notification', function(e) {
        console.log(JSON.stringify(e.notification));
        if (settings.onPushNotification)          
         settings.onPushNotification(e);
      });

      //start register
      console.log('try to register for push');
      api.pushNotification.onDeviceReady(params);

      //!!! Please note this is an API for PGB plugin. This code is different in CLI plugin!!!
      api.pushNotification.registerDevice(function(status) {
        var token = null;
        console.log(typeof status);
        if (typeof status == 'string') {//android
          token = status;
        } else {//ios
          token = status['deviceToken'];
        }
        console.warn('push token: ' + token);
        if (settings.onRegisterSuccess)
          onRegisterSuccess(token);
      }, function(status) {
        console.warn(JSON.stringify(['failed to register ', status]));
        if (settings.onRegisterError)
          settings.onRegisterError(status);
      });
      //if (callback) callback();
      } catch(err) {
        console.log(err.message);
      }
    };

    this.register = function(params) {
      angular.extend(settings, params);
      try {
        registerSettings.android.projectid = settings.gcmProjectNumber,
        registerSettings.android.appid = settings.appId;
        registerSettings.ios.pw_appid = settings.appId;

        console.log(JSON.stringify(settings));
        console.log('is available', api.isAvailable());
        if (api.isAvailable()) {
          if(device.platform == "Android") {
            registerPushwoosh(registerSettings.android);
          }
          if(device.platform == "iPhone" || device.platform == "iOS") {
            registerPushwoosh(registerSettings.ios, function() {
              //reset badges on start
              pushNotification.setApplicationIconBadgeNumber(0);
            });
          }
        }
      } catch(err) {
        console.log(err.message);
      }
    };

    this.$get = function() {
      return api; 
    }
  });
}(angular));
