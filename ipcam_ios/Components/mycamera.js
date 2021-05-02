import React from 'react';
import {RNCamera} from 'react-native-camera';
import {StyleSheet, View, Dimensions} from 'react-native';

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
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.takePhoto === true) {
      // console.log('update taking picutre.');
      // this.takePicture();
      // this.props.switchTakePhoto(false);
      this.takePicture.bind(this)();
      this.props.switchTakePhoto(false);
    } else {
      // console.log('not updating taking picture');
    }
  }
  takePicture = async () => {
    const options = {base64: true};
    const data = await this.camera.takePictureAsync(options);
    // CameraRoll.saveToCameraRoll(data.uri, 'photo');
    console.log('taking a picture');
    console.log(data.uri);
    // const sizes = await this.camera.getAvailablePictureSizes();
    // console.log('available sizes: ', sizes);
    this.props.socket.emit('upload', data);
    // }
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
  modalContainer: {
    paddingTop: 20,
    flex: 1,
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  bottomToolbar: {
    width: winWidth,
    position: 'absolute',
    height: 100,
    bottom: 0,
  },
  captureBtn: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 60,
    borderColor: '#ffffff',
  },
  captureBtnActive: {
    width: 80,
    height: 80,
  },
  captureBtnInternal: {
    width: 76,
    height: 76,
    borderWidth: 2,
    borderRadius: 76,
    backgroundColor: 'red',
    borderColor: 'transparent',
  },
  imageView: {
    width: winWidth,
    height: winHeight / 2,
    flex: 1,
    flexWrap: 'wrap',
    // alignSelf: 'stretch',
    // width: undefined,
    // height: undefined,
    resizeMode: 'stretch',
  },
});

export default MyCamera;
