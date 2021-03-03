import json
import requests
import time
import datetime
import os
import db_control
from sqlalchemy import create_engine

# Get keys from JSON file
with open('keys.json') as f:
   keys = json.load(f)

# Function which takes API text data as input and writes to new file in 'data' directory
def write_to_file(type, text):
  # Create 'data' directory if not already exists
  try:
    os.stat(os.path.dirname("data/"))
  except:
    os.mkdir("data")
  # check type then write each API call to its own file in 'data' directory
  if (type == "bikes"):
    with open("data/bikes_{}".format(time.time()).replace(" ", "_"), "w+") as f:
      f.write(text)
  elif (type == "weather"):
    with open("data/weather_{}".format(time.time()).replace(" ", "_"), "w+") as f:
      f.write(text)



# Function which writes API data to hosted MYSQL database
def write_to_db(engine, table , data):

    # insert into the right table
    if table.name == "stations":
        value = list(map(db_control.get_stations, data))
    elif table.name == "available":
        # there was a bug where for a period some stands were returning 'last_update' as None
        # This code filters out any None values for the last_update field
        filteredData = []
        for i in data:
          if (i["last_update"] != None):
            filteredData.append(i)
        
        # get the values from the API
        value = list(map(db_control.get_available, filteredData))
    elif table.name == "weather":
        value = db_control.get_conditions(data)
        print(value)

    ins = table.insert().values(value)
    engine.execute(ins)


def main():
    # make request to API
    r = requests.get("https://api.jcdecaux.com/vls/v1/stations", {"apiKey": keys["jcdecaux"]["API"], "contract": "Dublin"})

    # create the engine outside the loop so only create the table once
    engine = create_engine("mysql+mysqlconnector://{host}:{password}@{endpoint}:3306/{db_name}".format(host=keys["db"]["host"],
                                                                                                        password=keys["db"]["password"],
                                                                                                        endpoint=keys["db"]["endpoint"],
                                                                                                        db_name=keys["db"]["name"]),
                                                                                                        echo=True)

    # create table outside of the while loop
    stations = db_control.create_stations(engine)
    # create table outside of the while loop
    available = db_control.create_available(engine)
    # create the weather data
    weather = db_control.create_weather(engine)
    # only enter into stations once
    try:
      write_to_db(engine, stations, r.json())
    except:
        pass

    # Run infinite loop
    while True:
      
      # Check if current time is within dublin bikes opening hours
      if (datetime.datetime.now().time() <= datetime.time(00,30) or datetime.datetime.now().time() >= datetime.time(5)):
        
        # Get API data
        r = requests.get("https://api.jcdecaux.com/vls/v1/stations", {"apiKey": keys["jcdecaux"]["API"], "contract": "Dublin"})
        r2 = requests.get("https://api.openweathermap.org/data/2.5/weather?id={id}&appid={API_key}".format(id = keys["weather"]["ID"], API_key = keys["weather"]["API"]))
        # Check status code
        if (r.status_code == 200):
          
          # writes to the database
          write_to_db(engine, available, r.json())

          # writes to local
          write_to_file("bikes", r.text)

        elif (r.status_code == 403):
          # Handle for bad parameters error
          print("API parameter error")
        else:
          # Handle for all other errors.
          print("Error")

        # if the weather request is okay
        if (r2.status_code == 200):

            # writes to the database
            write_to_db(engine, weather, r2.json())

            # writes to local
            write_to_file("weather", r.text)

        elif (r2.status_code == 403):
            # Handle for bad parameters error
            print("API parameter error")
        else:
            # Handle for all other errors.
            print("Error")

      # Sleep for 5 minutes
      time.sleep(5*60)


main()
