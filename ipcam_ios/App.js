import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Dimensions,
  TextInput,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import 'react-native-gesture-handler';
import io from 'socket.io-client';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc';
import MyCamera from './Components/mycamera';

const Stack = createStackNavigator();
const pc_config = {
  iceServers: [
    {urls: 'stun:stun4.l.google.com:19302'},
    {
      urls: 'turn:numb.viagenie.ca',
      username: 'bingyujiang2021@u.northwestern.edu',
      credential: '8983121',
    },
  ],
};
const constraints = {
  video: {
    width: {min: 160, ideal: 640, max: 1280},
    height: {min: 120, ideal: 360, max: 720},
  },
};
class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: 'Welcome'}}
          />
          <Stack.Screen
            name="Video"
            component={VideoScreen}
            options={{header: () => null}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roomId: null,
      ipAddress: null,
    };
  }
  setRoomID(id) {
    this.setState({roomId: id});
  }
  setIPAddress(ip) {
    this.setState({ipAddress: ip});
  }

  render() {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{fontSize: 20}}>
          Please the enter the socket.io room id and the ip address of the
          server
        </Text>
        <TextInput
          style={styles.input}
          onChangeText={this.setRoomID.bind(this)}
          placeholder="place enter the room id"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          onChangeText={this.setIPAddress.bind(this)}
          placeholder="place enter the ip address"
        />
        <Button
          onPress={() =>
            this.props.navigation.navigate('Video', {
              // roomid: this.state.roomId,
              roomid: 111,
              ipAddress: this.state.ipAddress,
            })
          }
          title="connect"
        />
      </View>
    );
  }
}

class VideoScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      takePhoto: false,
      isFront: false,
      flash: true,
      exposureDuration: -1,
      exposureISO: -1,
      autoFocus: true,
      pictureSize: 'Photo',
    };
    this.roomId = this.props.route.params.roomid;
    this.ipaddress = 'http://' + this.props.route.params.ipAddress;
    // this.ipaddress = 'http://10.105.122.70:3000';
    this.socket = null;
    this.pc = null;
    this.candidates = {};
    this.initiator = false;
    this.localStream = null;
  }
  componentDidMount() {
    // const roomId = 111;
    this.socket = io.connect('http://10.105.122.70:3000');
    this.socket.emit('join', {roomId: this.roomId});
    this.socket.on('app-to-connect', data => {
      console.log('ios set up pc!');
      this.setupPC();
    });

    this.socket.on('on-connect', data => {
      this.initiator = data.initiator;
      this.setState({connected: true});
      console.log(`on-connect: is the ${data.initiator ? 'caller' : 'callee'}`);
    });

    this.socket.on('established', () => {
      console.log('established!!!!!!!!!!!!!');
      this.createOffer();
    });

    this.socket.on('offer-or-answer', sdp => {
      // if (!this.state.connected) return;
      // set sdp as remote description
      console.log(`received an ${sdp.type}`);
      this.pc
        .setRemoteDescription(new RTCSessionDescription(sdp))
        .then(() => {
          console.log('received answer');
          console.log(this.pc.remoteDescription);

          if (sdp.type === 'offer') {
            this.createAnswer();
          }
        })
        .catch(e => console.log(e));
      // console.log(this.pc.currentRemoteDescription);
    });

    this.socket.on('candidate', candidate => {
      console.log('From Peer... ', JSON.stringify(candidate));
      this.pc
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.log(e));
    });

    this.socket.on('receive-setting', data => {
      // console.log(data);
      if ('flash' in data) {
        console.log('Set flash to', data.flash);
        this.setState({flash: data.flash});
      }
      if ('isFront' in data) {
        console.log('Set camera type to', data.isFront ? 'front' : 'back');
        this.setState({isFront: data.isFront});
      }
      if ('exposureISO' in data) {
        console.log('Set exposureISO to', data.exposureISO);
        this.setState({exposureISO: data.exposureISO});
      }
      if ('exposureDuration' in data) {
        console.log('Set exposure duration to', data.exposureDuration);
        this.setState({exposureDuration: data.exposureDuration});
      }
      if ('autoFocus' in data) {
        console.log('Set autoFocus to', data.autoFocus);
        this.setState({autoFocus: data.autoFocus});
      }
      if ('pictureSize' in data) {
        console.log('Set picture size to', data.pictureSize);
        this.setState({pictureSize: data.pictureSize});
      }
    });

    this.socket.on('take-photo', () => {
      // console.log('Take a Photo');
      // if (this.localStream) {
      //   console.log('release stream before taking photo');
      //   this.releaseStream();
      // }
      this.switchTakePhoto(true);
      // this.getLocalStream();
    });

    this.socket.on('check-peer-state', () => {
      console.log('check-peer-state');
      console.log(this.localStream == null);
      console.log(this.pc);
      if (this.pc) {
        console.log(this.pc.connectionState);
      }
    });
  }

  setupPC() {
    // create an RTCPeerConnection
    console.log('create peer connection');
    this.pc = new RTCPeerConnection(pc_config);

    // triggered when there is a change in connection state
    this.pc.onconnectionstatechange = e => {
      console.log('Connection state is', this.pc.connectionState);
      if (this.pc.connectionState === 'disconnected') {
        this.setState({connected: false});
        this.releaseStream();
        this.pc.close();
      }
    };

    // triggered when a new candidate is returned
    this.pc.onicecandidate = e => {
      // send the candidates to the remote peer
      if (e.candidate) {
        // console.log(JSON.stringify(e.candidate))
        this.sendToPeer('candidate', e.candidate);
      }
    };

    // this.pc.ontrack = e => {
    //   console.log(`Add remote track: ${JSON.stringify(e)}`);
    //   console.log(e.streams.length);
    //   // get the remote video stream
    //   this.localStream = e.streams[0];
    // };

    mediaDevices.enumerateDevices().then(sourceInfos => {
      let videoSourceId = null;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (
          sourceInfo.kind === 'videoinput' &&
          sourceInfo.facing === (this.state.isFront ? 'front' : 'environment')
        ) {
          videoSourceId = sourceInfo.deviceId;
          console.log('source info: ' + JSON.stringify(sourceInfo));
        }
      }

      // called when getUserMedia() successfully returns
      const success = stream => {
        console.log('local stream: ' + typeof stream.getTracks()[0]);
        this.localStream = stream;
        // add this stream to the RTCPeerConnection
        this.pc.addStream(stream);
      };

      const constraints = {
        video: {
          // width: {min: 160, ideal: 640, max: 1280},
          // height: {min: 120, ideal: 360, max: 720},
          width: 1280,
          height: 720,
          facingMode: this.state.isFront ? 'user' : 'environment',
          optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
        },
        audio: false,
      };
      mediaDevices
        .getUserMedia(constraints)
        .then(success)
        .then(res => {
          this.socket.emit('on-connect');
        })
        .catch(e => {
          console.log('getUserMedia Error: ', e);
        });
    });
  }

  releaseStream() {
    // this.setState({connected: false});
    if (this.localStream != null) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    console.log('Stream is released');
  }

  sendToPeer(messageType, data) {
    this.socket.emit(messageType, data);
  }

  createOffer() {
    console.log('Create offer: initiator is ' + this.initiator);
    // initiates the creation of SDP
    this.pc
      .createOffer()
      .then(sdp => {
        // console.log(JSON.stringify(sdp))
        // set offer sdp as local description
        this.pc.setLocalDescription(sdp);
        console.log('created offer');
        console.log(this.pc.localDescription);
        this.sendToPeer('offer-or-answer', sdp);
      })
      .catch(e => console.log(e));
  }

  // creates an SDP answer to an offer received from remote peer
  createAnswer() {
    console.log('Create answer: initiator is ' + this.initiator);
    this.pc
      .createAnswer()
      .then(sdp => {
        // console.log(JSON.stringify(sdp))
        // set answer sdp as local description
        this.pc.setLocalDescription(sdp).catch(e => console.log(e));
        this.sendToPeer('offer-or-answer', sdp);
      })
      .catch(e => console.log(e));
  }

  switchTakePhoto = state => {
    // console.log('to take a photo is ', this.state.takePhoto);
    this.setState({takePhoto: state});
  };

  render() {
    return (
      <View style={styles.container}>
        <MyCamera
          style={{
            display: 'none',
          }}
          socket={this.socket}
          takePhoto={this.state.takePhoto}
          isFront={this.state.isFront}
          flash={this.state.flash}
          exposureISO={this.state.exposureISO}
          exposureDuration={this.state.exposureDuration}
          autoFocus={this.state.autoFocus}
          pictureSize={this.state.pictureSize}
          switchTakePhoto={this.switchTakePhoto}
        />
      </View>
    );
  }
}
const {width: winWidth, height: winHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homepage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: winWidth,
    height: winHeight,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
  },
  imageView: {
    // display: 'none',
    width: winWidth,
    height: winHeight,
    flex: 1,
    flexWrap: 'wrap',
    resizeMode: 'stretch',
  },
});

export default App;
