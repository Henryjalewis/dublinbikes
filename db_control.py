from sqlalchemy import Table, Column, Integer, Float, String, MetaData, DateTime
from datetime import datetime

# create metaData
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
    # if does not exist create
    if not engine.dialect.has_table(engine, "stations"):
        meta.create_all(engine)
    # return the variable
    return stations

def create_available(engine):
    available = Table(
        "available", meta,
        Column("number", Integer),
        Column("available_bike_stands", Integer),
        Column("available_bikes", Integer),
        Column("last_update", DateTime()))

    # if does not exist create
    if not engine.dialect.has_table(engine, "available"):
        meta.create_all(engine)

    return available

def create_weather(engine):
    weather = Table(
        "weather", meta,
        Column("type", String(128)),
        Column("description", String(128)),
        Column("icon", String(128)),
        Column("humidity", Float),
        Column("temp", Float),
        Column("feels_like", Float),
        Column("wind_speed", Float),
        Column("pressure", Float),
        Column("visibility", Float),
        Column("time", DateTime()))

    # if does not exist create
    if not engine.dialect.has_table(engine, "weather"):
        meta.create_all(engine)

    return weather

# pull the stations data from the api
def get_stations(obj):
  return {"number": obj["number"],
          "name": obj["name"],
          "address": obj["address"],
          "pos_lat": obj["position"]["lat"],
          "pos_long": obj["position"]["lng"],
          "bike_stands": obj["bike_stands"]}

# pull the availability data from the api
def get_available(obj):
  return {"number": obj["number"],
          "available_bike_stands": obj["available_bike_stands"],
          "available_bikes": obj["available_bikes"],
          "last_update": datetime.fromtimestamp(obj["last_update"] / 1e3)}


# get the weather data
def get_conditions(obj):
    weather = (obj["weather"])[0]
    current = obj["main"]
    wind = obj["wind"]
    return {"type": weather["main"],
            "description": weather["description"],
            "icon": weather["icon"],
            "humidity": current["humidity"],
            "temp": current["temp"],
            "feels_like": current["feels_like"],
            "wind_speed": wind["speed"],
            "pressure": current["pressure"],
            "visibility": obj["visibility"],
            "time": datetime.now()}
