from sqlalchemy import Table, Column, Integer, Float, String, MetaData, DateTime
import datetime
#create metaData
meta = MetaData()

# create stations table
def create_stations(engine):
    stations = Table(
        "stations", meta,
        Column("number", Integer, primary_key = True),
        Column("name", String(128)),
        Column("address", String(128)),
        Column("pos_lat", Float),
        Column("pos_long", Float),
        Column("bike_stands", Integer))
    # commits to sql
    if not engine.dialect.has_table(engine, "stations"):
        meta.create_all(engine)
    # return the variable
    return stations

def create_available(engine):
    available = Table(
        "available", meta,
        Column("number", Integer),
        Column("bike_stands", Integer),
        Column("available_bike_stands", Integer),
        Column("available_bikes", Integer),
        Column("last_update", Integer))

    # create the table in sql
    # if does not exist create
    if not engine.dialect.has_table(engine, "available"):
        meta.create_all(engine)

    return available

# pull the data from the data from api
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
          "last_update": obj["last_update"]}

