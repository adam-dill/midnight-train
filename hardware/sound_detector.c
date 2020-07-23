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

<<<<<<< Updated upstream
#define MIN_DURATION 3000
#define MAX_DURATION 900000
=======
#define MIN_DURATION 60000
>>>>>>> Stashed changes
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
	pinMode(sensorPin, INPUT);
  pullUpDnControl(sensorPin, PUD_DOWN);
    
  while (1)
  {
    time_t now = time(NULL);
    if (now > lastStatusUpdate + STATUS_FREQUENCY)
    {
      postStatus();
      lastStatusUpdate = now;
    }
    int input = digitalRead(sensorPin) == HIGH;
    //printf("input: %d\n", input);
    if (input && startTime == 0)
    {
      startTime = time(NULL);
      printf("\nnew sound detected. %ld\n", startTime);
    }
    else if (!input && startTime > 0)
    {
      printf("sound ended.\n");
      curl = curl_easy_init();
      if (curl)
      {
        res = postData(curl, startTime);
        if(res != CURLE_OK)
        {
          fprintf(stderr, "\ncurl_easy_perform() failed: %s\n",
                  curl_easy_strerror(res));
        }

        curl_easy_cleanup(curl);
      }
      startTime = 0;
    }
    sleep(1);
  }
  return 0;
}

CURLcode postData(CURL *curl, time_t startTime)
{
  time_t newTime = time(NULL);
  int deltaTime = difftime(newTime, startTime) * 1000;
  printf("deltaTime: %d\n", deltaTime);
  if (deltaTime < MIN_DURATION)
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
