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

#define MAX_SCALE 2000;
#define MIN_SCALE 200;

void createPostData(char *postData, time_t time, int duration);
int checkInput(void);
int scale = MAX_SCALE;

int main(void)
{
  CURL *curl;
  CURLcode res;
  time_t startTime;
  
  time_t t;
  srand((unsigned) time(&t));
  
  while (1)
  {
    if (checkInput())
    {
      printf("Got input.\n");
      if (startTime && curl)
      {
        time_t newTime = time(NULL);
        double deltaTime = difftime(newTime, startTime) * 1000;
        char postData[256];
        createPostData(postData, startTime, deltaTime);
        startTime = 0;
        scale = MAX_SCALE;
        printf("Data posted. %f\n", deltaTime);
        
        curl_easy_setopt(curl, CURLOPT_URL, "http://midnighttrain.adamdill.com/entries/add");
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postData);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, (long)strlen(postData));

        res = curl_easy_perform(curl);
        if(res != CURLE_OK)
          fprintf(stderr, "curl_easy_perform() failed: %s\n",
                  curl_easy_strerror(res));

        curl_easy_cleanup(curl);
      }
      else
      {
        startTime = time(NULL);
        curl = curl_easy_init();
        printf("\nHeard a train...\n");
      }
    }
    sleep(1);
  }
  return 0;
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
  int r = rand() % scale;
  int magicNumber = 3;
  printf("r = %d\n", r);
  if (r == magicNumber)
  {
    scale = MIN_SCALE;
  }
  return r == magicNumber;
}
