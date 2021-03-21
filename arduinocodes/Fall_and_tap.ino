
#include <Wire.h>
#include <ADXL345.h>


ADXL345 adxl; //variable adxl is an instance of the ADXL345 library

void setup(){
 Serial.begin(9600);
   adxl.powerOn();

// //set activity/ inactivity thresholds (0-255)
// adxl.setActivityThreshold(75); //62.5mg per increment
// adxl.setInactivityThreshold(75); //62.5mg per increment
// adxl.setTimeInactivity(10); // how many seconds of no activity is inactive?


// //look of inactivity movement on this axes - 1 == on; 0 == off
// adxl.setInactivityX(1);
// adxl.setInactivityY(1);
// adxl.setInactivityZ(1);

 //look of tap movement on this axes - 1 == on; 0 == off
 adxl.setTapDetectionOnX(0);
 adxl.setTapDetectionOnY(0);
 adxl.setTapDetectionOnZ(1);

 //set values for what is a tap, and what is a double tap (0-255)
 adxl.setTapThreshold(60); //62.5mg per increment
 adxl.setTapDuration(30); //625μs per increment
// adxl.setDoubleTapLatency(100); //1.25ms per increment
// adxl.setDoubleTapWindow(80); //1.25ms per increment

 //set values for what is considered freefall (0-255)
 adxl.setFreeFallThreshold(6); //(5 - 9) recommended - 62.5mg per increment
 adxl.setFreeFallDuration(35); //(20 - 70) recommended - 5ms per increment

   adxl.setInterruptMapping( ADXL345_INT_SINGLE_TAP_BIT,  ADXL345_INT1_PIN );
// adxl.setInterruptMapping( ADXL345_INT_DOUBLE_TAP_BIT,  ADXL345_INT1_PIN );
 adxl.setInterruptMapping( ADXL345_INT_FREE_FALL_BIT,  ADXL345_INT1_PIN );
// adxl.setInterruptMapping( ADXL345_INT_ACTIVITY_BIT,   ADXL345_INT1_PIN );
// adxl.setInterruptMapping( ADXL345_INT_INACTIVITY_BIT,  ADXL345_INT1_PIN );

 //register interupt actions - 1 == on; 0 == off 
 adxl.setInterrupt( ADXL345_INT_SINGLE_TAP_BIT, 1);
 adxl.setInterrupt( ADXL345_INT_DOUBLE_TAP_BIT, 1);
 adxl.setInterrupt( ADXL345_INT_FREE_FALL_BIT, 1);
// adxl.setInterrupt( ADXL345_INT_ACTIVITY_BIT,  1);
// adxl.setInterrupt( ADXL345_INT_INACTIVITY_BIT, 1);
}

void loop(){

 int x,y,z; 
 adxl.readXYZ(&x, &y, &z); //read the accelerometer values and store them in variables x,y,z


 byte interrupts = adxl.getInterruptSource();
 
 // freefall
 if(adxl.triggered(interrupts, ADXL345_FREE_FALL)){
  Serial.println("freefall");
  //add code here to do when freefall is sensed
 } 
 
// //inactivity
// if(adxl.triggered(interrupts, ADXL345_INACTIVITY)){
//  Serial.println("inactivity");
//  //add code here to do when inactivity is sensed
// }
// 
// //activity
// if(adxl.triggered(interrupts, ADXL345_ACTIVITY)){
//  Serial.println("activity"); 
//  //add code here to do when activity is sensed
// }
 
 //double tap
// if(adxl.triggered(interrupts, ADXL345_DOUBLE_TAP)){
//  Serial.println("double tap");
//  //add code here to do when a 2X tap is sensed
// }
 
 //tap
 if(adxl.triggered(interrupts, ADXL345_SINGLE_TAP)){
  Serial.println("tap");
  //add code here to do when a tap is sensed
 } 


}
