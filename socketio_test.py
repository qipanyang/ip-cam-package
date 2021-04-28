import logging
import argparse

import asyncio

import ipcam

async def main():
	my_ipcam = ipcam.IPcam('http://10.105.122.70:3000', 111)
	await my_ipcam.createSIO()
	await my_ipcam.joinRoom()
	await my_ipcam.setupPC()
	await my_ipcam.onConnection()
	# print("initiator = ", ipcam.initiator)
	# await ipcam.playvideo()
	await my_ipcam.siowait()
	# time.sleep(5)
	

if __name__ == '__main__':
	parser = argparse.ArgumentParser(description="WebRTC webcam demo")
	parser.add_argument("--verbose", "-v", action="count")
	args = parser.parse_args()

	# if args.verbose:
	# 	logging.basicConfig(level=logging.DEBUG)
	# else:
	# 	logging.basicConfig(level=logging.INFO)
	
	asyncio.run(main())


