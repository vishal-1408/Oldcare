#include <ArduinoJson.h>

#include <Ftp.h>
#include <Geo.h>
#include <GPRS.h>
#include <Http.h>
#include <Parser.h>
#include <Result.h>
#include <Sim800.h>

unsigned int RX_PIN = 10;
unsigned int TX_PIN = 11;
unsigned int RST_PIN = 2;

const char BEARER[] PROGMEM = "airtelgprs.com";


char response[512];

void setup() {
Serial.begin(9600);
Serial.println("started"); 
HTTP http(9600, RX_PIN, TX_PIN, RST_PIN);
http.connect(BEARER);
Serial.println("connected");
DynamicJsonDocument doc(1024);
doc["bpm"] = 75;
doc["deviceToken"]="cee28af31726";
Serial.println("requested");
Result result = http.post("https://oldage-care.herokuapp.com/device/add/bpm", serializeJson(doc, Serial), response);
Serial.println(result);
Serial.println(response);

http.disconnect();


}

void loop() {
  // put your main code here, to run repeatedly:

}
