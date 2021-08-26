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


void postData(CURL *curl, time_t startTime);
void createPostData(char *postData, time_t time, int duration);

int main(void)
{
  CURL *curl;
  curl = curl_easy_init();
  postData(curl, time(NULL) - 60);
  return 0;
}

void postData(CURL *curl, time_t startTime)
{
  struct curl_slist *chunk = NULL;
  chunk = curl_slist_append(chunk, "Content-Type: application/json");

  time_t newTime = time(NULL);
  int deltaTime = difftime(newTime, startTime) * 1000;
  printf("deltaTime: %d\n", deltaTime);
  
  char postData[256];
  createPostData(postData, startTime, deltaTime);
  
  curl_easy_setopt(curl, CURLOPT_URL, "http://midnighttrain.adamdill.com/entries/add");
  curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postData);
  curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, (long)strlen(postData));
  
  curl_easy_setopt(curl, CURLOPT_HTTPHEADER, chunk);
  CURLcode res = curl_easy_perform(curl);
  
  if(res != CURLE_OK)
  {
    FILE *out = fopen("posterror", "a");
    fprintf(out, strcat(postData, "\n"));
    fclose(out);
  }

  curl_easy_cleanup(curl);
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