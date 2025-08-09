#include "SECRETS.h"
#include <MqttAHT.h>

WifiInfo wifiInfo{
    SSID,
    PASSWORD};
MqttInfo mqttInfo{
    SERVER, PORT, TOPIC};
int SCL_pin = 4;
int SDA_pin = 5;

MqttAHT mqttAHT(wifiInfo, mqttInfo, SDA_pin, SCL_pin);

unsigned int lastMessage = 0;
unsigned int frequency = 10000; //10 seconds

//----------------------------------------------------
void setup()
{
   Serial.begin(115200);
  mqttAHT.begin();
}

void loop()
{
  unsigned long now = millis();
  mqttAHT.loop();
  if (now - lastMessage > frequency){
    SensorData data = mqttAHT.readSensor();
    mqttAHT.publishToTopic(data);
    lastMessage = millis();
  }
  delay(2000);

}
