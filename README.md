# Ip-cam-package
## Summary
This ip-cam package is a software support for doing deflectometry on apple device like iPhone or iPad. The apple device will be used as an external camera as well as a screen to display pattern image. All the control and settings will be left to a client on a laptop. We made the laptop client a python class as a supplement for [Merlin’s open source framework](https://github.com/merlzbert/SkinScan).

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

9. On the iPhone, setting->general->Device Management

10. Click the run button in the top menu in Xcode to build and run

### 
## Acknowledgements
This project is led by Panyang Qi (Computer Science MS, Northwestern University) and Bingyu Jiang (Electronic Engineer MS, Northwestern University) with the assistance of Dr. Oliver Cossairt, Dr. Florian Willomitzer, Florian Schiffers and others from the Computational Photography Lab at Northwestern University.
