# Web-Bluetooth-Chrome-Extension

Experimenting with the capabilities of using Web bluetooth and tensorflow js on a Chrome extension. Using this extension you can train machine learning models on a chrome extension (not natively) to predict machine learning values of an accelerometer to predict movement behavior.

# Thesis + Demo

https://drive.google.com/file/d/1EaebTqjsr5SfgEBdRg-T0TDy3W6Ndl1z/edit
https://youtu.be/_i8zOcu2s6Y

# Setup

In order to load the extension into your chrome browser navigate to chrome settings, then click more tools -> extensions, this will direct you to the extensions page. Toggle developer mode in the top right corner, then click "Load unpacked". Navigate to the extension folder and load it. Now the extension should appear in the extension bar.

Node Js dependencies also have to be install by using the following command in the home folder of the application
> npm install

This will install Express.js, Mongodb client, Tensorflow.js and extra dependencies.

Then Navigate to the server folder through terminal and do 
> node server.js

This will establish a connection to the mongodb database, this will however not connect as you need to ask me to whitelist your IP address on the mongodb website so that you can access the database.



