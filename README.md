# Ip-cam-package
## Summary
This ip-cam package is a software support for doing deflectometry on apple device like iPhone or iPad. The apple device will be used as an external camera as well as a screen to display pattern image. All the control and settings will be left to a client on a laptop. We made the laptop client a python class as a supplement for [Merlin’s open source framework](https://github.com/merlzbert/SkinScan).

See the document [here](https://docs.google.com/document/d/1KgVJtHKZcE0DcDHWDr4hRpvjTYoUDcTq3CNMbxC9PSw/edit?usp=sharing).

## Structure
This figure shows in the structure of the whole system.![image](https://github.com/qipanyang/ip-cam-package/blob/master/structure.png)

There are three parts of the package - one server and two clients. In the original design (see docs [here](https://docs.google.com/document/d/1qbk2WMBzAAgKrIKZd9SW3dWhwC-eEG1NZdktrImhsAA/edit#heading=h.dn97nq5ji83n)), one of the cilents is a web application which is replaced by a python client (the IPcam class in ipcam.py)

[WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) is for sending the video preview from iOS device to the laptop (python client) and the [socketio](https://socket.io/docs/v3) helps to establish WebRTC peer connection and other communication for signals and data between the clients through the server.


## Installation
### Enviroment setup
- Install [NodeJS](https://nodejs.org/en/download/)
- Install [Xcode](https://developer.apple.com/download/more/) (The latest version can be downloaded from Apple Store. Note that for mojave, only xcode 11.3 is available.)   
- Install cocoapods: 
```
brew install cocoapods --build-from-source && brew link --overwrite cocoapods
```
- parcel-bundler


### Deploy the iOS application on iPhone/iPad using cable ([tutorial video](https://www.youtube.com/watch?v=RBZL6PO2ytc))
1. clone this repo
```
git clone https://github.com/qipanyang/ip-cam-package
```
2. connect iPhone with the computer through a cable

3. Double click ./ip-cam-package/ipcam_ios/ios/camera.xcworkspace to open the project with Xcode

4. Product->destination select the iPhone device

5. Click the project name on the left panel

6. Select Signing & Capabilities(on the top menu) -> select team(using your Apple ID) 

7. Modify Buddle identifier. Append “ness” in the end of the identifier (even when there is already "ness")

8. Do the same thing in tests in the target on the left

9. On the iPhone, setting->general->Device Management to trust the developer

10. Click the run button in the top menu in Xcode to build and run

## Usage
The server has to be started in the first place and runs in the backend all the time. (When the system is stuck somewhere, it is always good to try restarting everything)
### Server
```
cd ./server
npm install
node index.js
```

### iOS app
```
npm install
cd ./ios pod install
```
Then set up Xcode with the Apple device connected through a cable and click the run button.

Since the interfaces the react-native-camera package provides do not fully meet our requirements, so we modified its source code written in objective-c. Check the file in ./ipcam_ios/patches for the modification of code in ./module/react-native-camera/ios/RN and implement all of them in the coordinate files. 

### Python client
The Python client can be run in a Jupyter notebook. Since more data rate is required to do image conversion, the jupyter notebook need to be started with the command below
```
jupyter notebook --NotebookApp.iopub_data_rate_limit=1.0e10
```

The IPcam class is in ./ipcam.py

An usage example is in ./ipcam-test.ipynb

## Acknowledgements
This project is led by Panyang Qi (Computer Science MS, Northwestern University) and Bingyu Jiang (Electronic Engineer MS, Northwestern University) with the assistance of Dr. Oliver Cossairt, Dr. Florian Willomitzer, Florian Schiffers and others from the Computational Photography Lab at Northwestern University.
