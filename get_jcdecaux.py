import json
import os
import requests
import time

# Get api params from JSON file
with open('JCDecaux_key.json') as f:
  JCDecaux_key = json.load(f)

def main():
  # Run infinite loop


  while True:
    # Get API data
    r = requests.get("https://api.jcdecaux.com/vls/v1/stations", JCDecaux_key)

    # Check status code
    if (r.status_code == 200):
      # Handle for success
      store(json.loads(r.text))
    elif (r.status_code == 403):
      # Handle for bad parameters error
      print("API parameter error")
    else:
      # Handle for all other errors.
      print("Error")

    # Sleep for 2 minutes
    time.sleep(2*60)

def store():
  pass

#
def get_stations(obj):
  return {"number": obj["number"],
          "name": obj["name"],
          "address": obj["address"],
          "pos_lat": obj["position"]["lat"],
          "pos_long": obj["position"]["lng"],
          "bike_stands": obj["bike_stands"]}

def get_available(obj):
  return {"number": obj["number"],
          "bike_stands": obj["bike_stands"],
          "available_bike_stands": obj["available_bike_stands"],
          "available_bikes": obj["available_bikes"],
          "last_update": datetime.datetime.fromtimestamp(int(obj["last_update"] / 1e3))}


main()