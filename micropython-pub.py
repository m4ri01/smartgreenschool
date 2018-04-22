import mfrc522
from os import uname
from umqtt.simple import MQTTClient
import time
import urllib.urequest,ujson
import machine


if uname()[0] == 'WiPy':
	rdr = mfrc522.MFRC522("GP14", "GP16", "GP15", "GP22", "GP17")
elif uname()[0] == 'esp8266':
	rdr = mfrc522.MFRC522(0, 2, 4, 5, 14)
else:
	raise RuntimeError("Unsupported platform")

print ("coba")

def cek():
	f = urllib.urequest.urlopen("http://localhost") #url JSON
	json_data = f.read().decode("utf-8")
	data = ujson.loads(json_data)
	return int(data["status"])

def mesin(nilai):
	led = machine.Pin(12, machine.Pin.OUT)
	led.value(nilai)

try:
    while True:
		(stat, tag_type) = rdr.request(rdr.REQIDL)
		if stat == rdr.OK:
			(stat, raw_uid) = rdr.anticoll()
			if stat == rdr.OK:
				uid = str(raw_uid[0])+str(raw_uid[1])+str(raw_uid[2])+str(raw_uid[3])
				c = MQTTClient("umqtt_client","URL")
				c.connect()
				c.publish(topic="id",msg=uid,qos=0)
				print("publish: " + uid)
				c.disconnect()
				time.sleep(1)
				a = cek()
				mesin(a)
				time.sleep(2)
				mesin(0)


except KeyboardInterrupt:
	print("bye")
