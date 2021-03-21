#include <Wire.h>

#define DEVICE (0x53)    //ADXL345 device address
#define TO_READ (6)        //num of bytes we are going to read each time (two bytes for each axis)

#define offsetX   -10.5       // OFFSET values
#define offsetY   -2.5
#define offsetZ   -4.5

#define gainX     257.5        // GAIN factors
#define gainY     254.5
#define gainZ     248.5

byte buff[TO_READ] ;    //6 bytes buffer for saving data read from the device
char str[512];                      //string buffer to transform data before sending it to the serial port

int x,y,z;
int k;

int xavg, yavg,zavg, steps=0, flag=0;
int xval[15]={0}, yval[15]={0}, zval[15]={0};
int threshhold = 60.0;


void setup()
{
  Wire.begin();        // join i2c bus (address optional for master)
  Serial.begin(9600);  // start serial for output
  
  //Turning on the ADXL345
  writeTo(DEVICE, 0x2D, 0);      
  writeTo(DEVICE, 0x2D, 16);
  writeTo(DEVICE, 0x2D, 8);
}

void loop()
{
  int regAddress = 0x32;    //first axis-acceleration-data register on the ADXL345
  
  readFrom(DEVICE, regAddress, TO_READ, buff); //read the acceleration data from the ADXL345
  
   //each axis reading comes in 10 bit resolution, ie 2 bytes.  Least Significat Byte first!!
   //thus we are converting both bytes in to one int
  x = (((int)buff[1]) << 8) | buff[0];   
  y = (((int)buff[3])<< 8) | buff[2];
  z = (((int)buff[5]) << 8) | buff[4];
  
//we send the x y z values as a string to the serial port 
//  sprintf(str, "%d %d %d", x, y, z);  
//  Serial.print(str);
//  Serial.print(10, byte());
  x = ArduinoPedometer();

  Serial.println(x);
  if (x>20){
    k=x;
    Serial.print("Value of k is");
    Serial.println(k);
    x=0;
    steps=0;
    delay(20);
    }
    x=0;
    

  //It appears that delay is needed in order not to clog the port
  delay(100);
}

//---------------- Functions
//Writes val to address register on device
void writeTo(int device, byte address, byte val) {
   Wire.beginTransmission(device); //start transmission to device 
   Wire.write(address);        // send register address
   Wire.write(val);        // send value to write
   Wire.endTransmission(); //end transmission
}

//reads num bytes starting from address register on device in to buff array
void readFrom(int device, byte address, int num, byte buff[]) {
  Wire.beginTransmission(device); //start transmission to device 
  Wire.write(address);        //sends address to read from
  Wire.endTransmission(); //end transmission
  
  Wire.beginTransmission(device); //start transmission to device
  Wire.requestFrom(device, num);    // request 6 bytes from device
  
  int i = 0;
  while(Wire.available())    //device may send less than requested (abnormal)
  { 
    buff[i] = Wire.read(); // receive a byte
    i++;
  }
  Wire.endTransmission(); //end transmission
}


//Get pedometer.

int ArduinoPedometer(){
    int acc=0;
    int totvect[15]={0};
    int totave[15]={0};
    int xaccl[15]={0};
    int yaccl[15]={0};
    int zaccl[15]={0};
    for (int i=0;i<15;i++)
    {
      xaccl[i]= x;
      delay(1);
      yaccl[i]= y;
      delay(1);
      zaccl[i]= z;
      delay(1);
      totvect[i] = sqrt(((xaccl[i]-xavg)* (xaccl[i]-xavg))+ ((yaccl[i] - yavg)*(yaccl[i] - yavg)) + ((zval[i] - zavg)*(zval[i] - zavg)));
      totave[i] = (totvect[i] + totvect[i-1]) / 2 ;
      delay(150);
  
      //cal steps 
      if (totave[i]>threshhold && flag==0)
      {
         steps=steps+1;
         flag=1;
      }
      else if (totave[i] > threshhold && flag==1)
      {
          //do nothing 
      }
      if (totave[i] <threshhold  && flag==1)
      {
        flag=0;
      }
     // Serial.print("steps=");
     // Serial.println(steps);
     return(steps);
    }
  delay(100); 
 }
