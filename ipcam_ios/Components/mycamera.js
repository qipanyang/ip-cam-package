import React from 'react';
import {RNCamera} from 'react-native-camera';
import {StyleSheet, View, Dimensions} from 'react-native';
import {RTCIceCandidate} from 'react-native-webrtc';

class MyCamera extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos_content: [],
      modalVisible: false,
      indexState: null,
      selectedURI: null,
      showing_image: false,
    };
    this.socket = null;
  }

  componentDidUpdate(prevProps, prevState) {
    this.socket = this.props.socket;
    if (this.props.takePhoto === true) {
      // this.takePicture();
      // this.props.switchTakePhoto(false);
      this.takePicture.bind(this)();
      this.props.switchTakePhoto(false);
    } else {
      // console.log('not updating taking picture');
    }
  }
  takePicture = async () => {
    const options = {base64: true, raw: this.props.raw};
    const data = await this.camera.takePictureAsync(options);
    // CameraRoll.saveToCameraRoll(data.uri, 'photo');
    console.log('taking a picture');
    console.log(data.uri);
    this.props.socket.emit('upload', data);
  };

  render() {
    return (
      <View>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={
            this.props.isFront
              ? RNCamera.Constants.Type.front
              : RNCamera.Constants.Type.back
          }
          flashMode={
            this.props.flash
              ? RNCamera.Constants.FlashMode.on
              : RNCamera.Constants.FlashMode.off
          }
          exposureISO={this.props.exposureISO}
          exposureDuration={this.props.exposureDuration}
          autoFocus={
            this.props.autoFocus
              ? RNCamera.Constants.AutoFocus.on
              : RNCamera.Constants.AutoFocus.off
          }
          pictureSize={this.props.pictureSize}
        />
      </View>
    );
  }
}

const {width: winWidth, height: winHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    display: 'none',
    // flex: 1,
    // justifyContent: 'flex-end',
  },
});

export default MyCamera;
