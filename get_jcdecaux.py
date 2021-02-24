import json
import os
import requests
import time
import datetime
import os
import db

# Get api params from JSON file
with open('JCDecaux_key.json') as f:
  JCDecaux_key = json.load(f)

# Function which takes API text data as input and writes to new file in 'data' directory
def write_to_file(text):
  # Create 'data' directory if not already exists
  try:
    os.stat(os.path.dirname("data"))
  except:
    os.mkdir("data")
  # Write each API call to its own file in 'data' directory
  with open("data/bikes_{}".format(time.time()).replace(" ", "_"), "w+") as f:
    f.write(text)

# Function which writes API data to hosted MYSQL database
def write_to_db(table = stations, data):

    # pull the data from the databases
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

    # create engine for sql
    engine = create_engine("mysql+mysqlconnector://{host}:{password}@{endpoint}:3306/{db_name}".format( host = db.host,
                                                                                                        password = db.password,
                                                                                                        endpoint = db.endpoint,
                                                                                                        db_name = db.name), echo=True)
    # get the values from the api
    value = list(map(get_stations, data))
    ins = table.insert().values(value)
    engine.execute(ins)


def main():
  # Run infinite loop


  while True:
    
    # Check if current time is within dublin bikes opening hours
    if (datetime.datetime.now().time() <= datetime.time(00,30) or datetime.datetime.now().time() >= datetime.time(5)):
      
      # Get API data
      r = requests.get("https://api.jcdecaux.com/vls/v1/stations", JCDecaux_key)
      
      # Check status code
      if (r.status_code == 200):
        # Handle for success
        # writes to local
        write_to_file(r.text)
        # writes to the database
        write_to_db(json.loads(r.text))
      elif (r.status_code == 403):
        # Handle for bad parameters error
        print("API parameter error")
      else:
        # Handle for all other errors.
        print("Error")

    # Sleep for 5 minutes
    time.sleep(5*60)



main()