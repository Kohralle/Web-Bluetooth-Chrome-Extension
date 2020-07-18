# Web-Bluetooth-Chrome-Extension

> Experimenting with the capabilities of using Web bluetooth and tensorflow js on a Chrome extension. Using this extension you can train machine learning models on a chrome extension (not natively) to predict machine learning values of an accelerometer to predict movement behavior.


## Setup

In order to load the extension into your chrome browser navigate to chrome settings, then click more tools -> extensions, this will direct you to the extensions page. Toggle developer mode in the top right corner, then click "Load unpacked". Navigate to the extension folder and load it. Now the extension should appear in the extension bar.

This now allows you to initiate web bluetooth connections on any website (as long as it it https). Unfortunately you cannot train and predict movement values as the tensorflow js library is not available to be used inside of the chrome extension due to the Google’s  Content Security Policy (https://developer.chrome.com/extensions/contentSecurityPolicy). Because of this you need to install the following dependencies:

Express.js
Mongodb client
Tensorflow.js 

Afterwards navigate to the project folder in Terminal and do:

```cd extension
node server.js
```

This will now run a local server on localhost port 8080 allowing you to utilize all the app features
