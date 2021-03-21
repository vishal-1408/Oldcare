


#define USE_ARDUINO_INTERRUPTS true    
#include <PulseSensorPlayground.h>        

//  Variables
const int PulseWire = 0;       
const int LED13 = 13;          
int Threshold = 500;          


                               
PulseSensorPlayground pulseSensor;  

void setup() {   

  Serial.begin(9600);          

 
  pulseSensor.analogInput(PulseWire);   
  pulseSensor.blinkOnPulse(LED13);       
  pulseSensor.setThreshold(Threshold);   


   if (pulseSensor.begin()) {
    Serial.println("We created a pulseSensor Object !");  
  }
}



void loop() {

 int myBPM = pulseSensor.getBeatsPerMinute();  

if (pulseSensor.sawStartOfBeat()) {            
 Serial.println("♥  A HeartBeat Happened ! "); 
 Serial.print("BPM: ");                        
 Serial.println(myBPM);                        
}

  delay(20);                   
}

  
