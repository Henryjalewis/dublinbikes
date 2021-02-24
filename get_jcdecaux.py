import json
import requests
import time
import datetime
import os
#import db
import db_control
from sqlalchemy import create_engine
=======

>>>>>>> 925315230a5bd520ca27d12995d5c7c29b5ed7fd
# Get api params from JSON file
with open('JCDecaux_key.json') as f:
   JCDecaux_key = json.load(f)

# Function which takes API text data as input and writes to new file in 'data' directory
def write_to_file(text):
  # Create 'data' directory if not already exists
  try:
    os.stat(os.path.dirname("data/"))
  except:
    os.mkdir("data")
  # Write each API call to its own file in 'data' directory
  with open("data/bikes_{}".format(time.time()).replace(" ", "_"), "w+") as f:
    f.write(text)



# Function which writes API data to hosted MYSQL database
def write_to_db(engine, table , data):

    # insert into the right table
    if table.name == "stations":
        value = list(map(db_control.get_stations, data))
    elif table.name == "available":
        # get the values from the api
        value = list(map(db_control.get_available, data))

    ins = table.insert().values(value)
    engine.execute(ins)


def main():

  url = "https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey={}".format(db.api_key)

  r = requests.get(url)
# Run infinite loop
    # create the engine outside the loop so only create the table once
  engine = create_engine("mysql+mysqlconnector://{host}:{password}@{endpoint}:3306/{db_name}".format(   host=db.host,
                                                                                                        password=db.password,
                                                                                                        endpoint=db.endpoint,
                                                                                                        db_name=db.name),
                                                                                                        echo=True)

# check for existence of table before creation
  meta = db_control.meta

      # create table outside of the while loop
  stations = db_control.create_stations(engine)
      # create table outside of the while loop
  available = db_control.create_available(engine)
  # else:
  #     available = meta.tables["bikes.available"]

  data = r.json()
    #only enter into stations once
  try:
    write_to_db(engine,stations, data)
  except:
      pass
  while True:
    
    # Check if current time is within dublin bikes opening hours
    if (datetime.datetime.now().time() <= datetime.time(00,30) or datetime.datetime.now().time() >= datetime.time(5)):
      
      # Get API data
      r = requests.get("https://api.jcdecaux.com/vls/v1/stations", JCDecaux_key)

      # Check status code
      if (r.status_code == 200):
        # Handle for success
        data = r.json() # pulls out json

        # writes to the database
        write_to_db(engine, available, r.json())

        # writes to local
        write_to_file(r.text)

      elif (r.status_code == 403):
        # Handle for bad parameters error
        print("API parameter error")
      else:
        # Handle for all other errors.
        print("Error")

    # Sleep for 5 minutes
    time.sleep(5*60)


main()