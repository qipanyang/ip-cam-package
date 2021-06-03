import engineio
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, VideoStreamTrack
from aiortc.contrib.media import MediaBlackhole, MediaPlayer, MediaRecorder
import asyncio
import cv2
import socketio
import base64

pc_config = {
    "iceServers": [
        { "urls": "stun:stun4.l.google.com:19302" },
        {
            "urls": "turn:numb.viagenie.ca",
            "username": "bingyujiang2021@u.northwestern.edu",
            "credential": "8983121"
        },
    ]
}

class IPcam:
	def __init__(self, ip_address_, roomid_, pc_config_ = pc_config):
		self.ip_address = ip_address_
		self.pc_config = pc_config_
		self.roomid = roomid_
		self.sio = None
		self.pc = None
		self.local_video = None
		self.initiator = None
		self.candidates = []
		self.isplaying = False

    # set up socket
	async def createSIO(self):
		print("create a new async sio client")
		self.sio = socketio.AsyncClient()
		print("connect to a server")
		await self.sio.connect(self.ip_address)

		@self.sio.on("on-connect")
		def on_connect(data):
			self.initiator = data["initiator"]
			print("on-connect: is the", "caller" if self.initiator else "callee")

		@self.sio.on("established")
		async def established():
			print('connection established')

		@self.sio.on("offer-or-answer")
		async def offerOrAnswer(sdp):
			print("offer-or-answer", sdp["type"])
			if sdp["type"] == 'offer':
				await self.pc.setRemoteDescription(RTCSessionDescription(sdp['sdp'], sdp['type']))
				# print(self.pc.remoteDescription)
				answer = await self.pc.createAnswer()
				# print('answer:', answer)
				await self.pc.setLocalDescription(answer)
				await self.sendToPeer("offer-or-answer", {'sdp': self.pc.localDescription.sdp, 'type': self.pc.localDescription.type})
		@self.sio.on("candidate")
		async def addCandidate(candidate):
			self.candidates.append(candidate)
			# decode the candidate info
			split_candidate = candidate["candidate"].split(" ")
			sdpMLineIndex = candidate["sdpMLineIndex"]
			sdpMid = candidate["sdpMid"]
			foundation = split_candidate[0].split(":")[-1]
			component = int(split_candidate[1])
			protocol = split_candidate[2]
			priority = int(split_candidate[3])
			ip = split_candidate[4]
			port = int(split_candidate[5])
			candidate_type = split_candidate[7]
			tcp_type = split_candidate[9]
			new_candidate = RTCIceCandidate(component = component, foundation = foundation, ip = ip, port = port, priority = priority, protocol = protocol, type = candidate_type, sdpMid = sdpMid, sdpMLineIndex = sdpMLineIndex, tcpType = tcp_type)
			await self.pc.addIceCandidate(new_candidate)
			print("successfully add new candidate")

    # wrapper for socketio emit
	async def sendToPeer(self, message, data):
		await self.sio.emit(message, data)

	async def siowait(self):
		await self.sio.wait()

	async def sioclose(self):
		print("socketio disconnet")
		await self.sio.disconnect()

	async def pcclose(self):
		if self.pc:
			await self.pc.close()
		else:
			print("There is no peer connection")

	async def joinRoom(self):
	    await self.createSIO()
	    await self.sendToPeer('join', {"roomId": self.roomid})

	async def takePhoto(self, name):
		if self.pc and self.pc.connectionState == "connected":
			print("close pc before")
			await self.pc.close()
		await self.sio.emit("take-photo", name)

	async def playpreview(self):
		print("transfer to frame")
		if not self.local_video:
			print("no local video")
			return
		print("Video stream exists.")
		self.isplaying = True
		while True:
			frame = await self.local_video.recv()
			img = frame.to_ndarray(format="bgr24")
			cv2.imshow("video", img)
			key = cv2.waitKey(1)
			if key == ord('a'):
				break
		self.isplaying = False
		cv2.destroyWindow("video")
		cv2.waitKey(1) # must add a another waitKey to close the window
		await self.pcclose()
		await self.sio.emit("close")

    # set up WebRTC peer connection
	async def setupPC(self):
		print("new peer connection")
		self.pc = RTCPeerConnection()
		@self.pc.on("connectionstatechange")
		async def on_connectionstatechange():
			print("Connection state is", self.pc.connectionState)
			# check isplaying to avoid repeatedly playing the preview
			if self.pc.connectionState == "connected" and not self.isplaying:
				await self.playpreview()
			elif self.pc.connectionState == "failed" and self.pc:
				await self.pc.close()
			elif self.pc.connectionState == "disconnect":
				print("The webrtc connection has been closed.")
		# @self.pc.on("iceconnectionstatechange")
		# async def on_iceconnectionstatechange():
		# 	print("ICE connection state is", self.pc.iceConnectionState)
		# 	if self.pc.iceConnectionState == "failed" and self.pc:
		# 		print("close pc")
		# 		await self.pc.close()

		# triggered when a stream track is added in the ios end
		@self.pc.on("track")
		async def on_track(track):
			print("Track received")
			self.local_video = track
			# local_video = VideoTransformTrack(track)
			# self.pc.addTrack(local_video)
			# print("add transform track")
			@track.on("ended")
			async def on_ended():
				log_info("Track %s ended", track.kind)

	# Trigger the establish of the webrtc peer connection
	async def onConnection(self):
		await self.sio.emit("on-connect")

	# Set up the webrtc connection then play the video automatically. User can press 'a' to stop the preview and the webrtc connection will be closed
	async def playVideo(self):
		await self.setupPC()
		await self.onConnection()

    # change the ios camera settings remotely.
	async def cameraSetting(self, settings):
		print("change camera settings")
		await self.sio.emit("setting", settings)

    # Send a picture to the ios device and display it on the screen.
	async def displayImage(self, image_path):
		print("pass the image", image_path)
		if image_path != "":
		    img = cv2.imread(image_path)
		    encoded_string = base64.b64encode(cv2.imencode('.jpeg', img)[1]).decode("utf-8") # have to add this decode
		else:
		    encoded_string = None
		await self.sio.emit("display", encoded_string)

	async def checkPeerState(self):
		await self.sio.emit("check-peer-state")


