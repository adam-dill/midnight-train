/**
 * Interface with a sound detection sensor on a pi and send a post
 * message to an api with the timestamp and duration of the sound.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <curl/curl.h>
#include <time.h>
#include <unistd.h>
#include <wiringPi.h>

#define sensorPin       0
#define sensorDetectPin 1
#define errorPin        2
#define successPin      3

#define MIN_DURATION 1000
#define STATUS_FREQUENCY 60

CURLcode postData(CURL *curl, time_t startTime);
void createPostData(char *postData, time_t time, int duration);
int checkInput(void);
void postStatus(void);
float getCpuTemperature(void);

time_t inputTime = 0;
time_t lastStatusUpdate = 0;

int main(void)
{
  CURL *curl;
  CURLcode res;
  time_t startTime = 0;
  
  wiringPiSetup();	
	pinMode(successPin, OUTPUT);
  pinMode(sensorDetectPin, OUTPUT);
  pinMode(errorPin, OUTPUT);
	pinMode(sensorPin, INPUT);
  
  digitalWrite(sensorPin, LOW);
  digitalWrite(sensorDetectPin, LOW);
  digitalWrite(errorPin, LOW);
  digitalWrite(successPin, LOW);

	pullUpDnControl(sensorPin, PUD_UP);
  
  while (1)
  {
    time_t now = time(NULL);
    if (now > lastStatusUpdate + STATUS_FREQUENCY)
    {
      postStatus();
      lastStatusUpdate = now;
    }
    int input = checkInput();
    digitalWrite(sensorDetectPin, input);
    if (input && startTime == 0)
    {
      startTime = time(NULL);
      printf("new sound detected.\n");
    }
    else if (!input && startTime > 0)
    {
      curl = curl_easy_init();
      if (curl)
      {
        res = postData(curl, startTime);
        if(res != CURLE_OK)
        {
          fprintf(stderr, "curl_easy_perform() failed: %s\n",
                  curl_easy_strerror(res));
          digitalWrite(errorPin, HIGH);
        }

        curl_easy_cleanup(curl);
      }
      startTime = 0;
    }
  }
  return 0;
}

CURLcode postData(CURL *curl, time_t startTime)
{
  time_t newTime = time(NULL);
  int deltaTime = difftime(newTime, startTime) * 1000;
  
  if (deltaTime < 5000)
  {
    return CURLE_OK;
  }
  char postData[256];
  createPostData(postData, startTime, deltaTime);
  
  curl_easy_setopt(curl, CURLOPT_URL, "http://midnighttrain.adamdill.com/entries/add");
  curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postData);
  curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, (long)strlen(postData));

  return curl_easy_perform(curl);
}

void createPostData(char *postData, time_t time, int duration)
{
  char timeStr[20];
  strftime(timeStr, 20, "%Y-%m-%d %H:%M:%S", localtime(&time));
  
  char durationStr[64];
  sprintf(durationStr, "%i", duration);
  
  strcpy(postData, "{\"time\" : \"");
  strcat(postData, timeStr);
  strcat(postData, "\" , \"duration\" : \"");
  strcat(postData, durationStr);
  strcat(postData, "\" }");
}

int checkInput(void)
{
  time_t now = time(NULL);
    
  int input = digitalRead(sensorPin) == LOW;
  if (input)
  {
    inputTime = now + 1;
  }
  
  if (inputTime != 0 && inputTime > now)
  {
    digitalWrite(successPin, HIGH);
    return 1;
  }
  else 
  {
    inputTime = 0;
    digitalWrite(successPin, LOW);
    return 0;
  }
}

void postStatus()
{
  CURL *curl;
  curl = curl_easy_init();
  if (curl)
  {
    double temperature = getCpuTemperature();
    char temperatureStr[10];
    sprintf(temperatureStr, "%f", temperature);
    char postData[256];
    strcpy(postData, "{\"temperature\" : \"");
    strcat(postData, temperatureStr);
    strcat(postData, "\" }");
    
    curl_easy_setopt(curl, CURLOPT_URL, "http://midnighttrain.adamdill.com/status/temperature");
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postData);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, (long)strlen(postData));
    curl_easy_perform(curl);
    curl_easy_cleanup(curl);
  }
}

float getCpuTemperature()
{
  float systemp, millideg;
  FILE *thermal;

  thermal = fopen("/sys/class/thermal/thermal_zone0/temp","r");
  fscanf(thermal,"%f",&millideg);
  fclose(thermal);
  systemp = millideg / 1000;

  return systemp;
}
