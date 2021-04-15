from flask import Flask, render_template, request
from jinja2 import Template
from sqlalchemy import create_engine
import pandas as pd
import json
import pickle
import numpy as np

# Get keys from JSON file
with open('../keys.json') as f:
  keys = json.load(f)

engine = create_engine("mysql+mysqlconnector://{host}:{password}@{endpoint}:3306/{db_name}".format(host=keys["db"]["host"], password=keys["db"]["password"], endpoint=keys["db"]["endpoint"], db_name=keys["db"]["name"]))

# load the model
# model is stored as a dictionary
# model should be global variable here right?
loaded_model = {}
station_list = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16,
                17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29,
                30, 31, 32, 33, 34, 36, 37, 38, 39, 40, 41, 42,
                43, 44, 45, 47, 48, 49, 50, 51, 52, 53, 54, 55,
                56, 57, 58, 59, 61, 62, 63, 64, 65, 66, 67, 68,
                69, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 82,
                83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94,
                95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105,
                106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117]
for number in station_list:
    filename = '../models/station{id}_model.sav'.format(id = number)
    #loading the model
    loaded_model[number] = pickle.load(open(filename, 'rb'))


app = Flask(__name__)

# This function sets up the template for the homepage (index)
@app.route("/")
def home():
  d = {'key': keys['googleMaps']['key']}
  return render_template("index.html", **d)

# This function sets up the template for the analytics page
@app.route("/analytics")
def analytics():
  return render_template("analytics.html")

# This function sets up the template for the route planning page
@app.route("/route")
def route():
  d = {'key': keys['googleMaps']['key']}
  return render_template("route.html", **d)

# This function sets up the template for the about page (content and structure to be determined)
@app.route("/about")
def about():
  return render_template("about.html")

# This function sets up the template for the contacts page (content and structure to be determined)

@app.route("/contact")
def contact():
  return render_template("contact.html")

# reads API information for station locations and outputs a dataframe
@app.route("/stations")
def stations():
    df = pd.read_sql(
      "SELECT DISTINCT t1.*, t3.name, t3.address, t3.pos_lat, t3.pos_long, t3.bike_stands \
      FROM `jcdecaux-bikes`.available AS t1 \
      INNER JOIN \
      `jcdecaux-bikes`.stations AS t3 \
      ON t1.number = t3.number \
      INNER JOIN ( \
          SELECT number, MAX(last_update) last_update \
          FROM `jcdecaux-bikes`.available \
          GROUP BY number \
      ) t2 ON t1.number = t2.number AND t1.last_update = t2.last_update;", engine)
    return df.to_json(orient='records')

@app.route("/bikes")
def dynamic_bikes():
    df = pd.read_sql_table("SELECT*from static_bikes", engine)
    bike_data = df.to_json(orient='records')
    return bike_data

@app.route("/details/<name>")
def details(name):

  # use the name in a query
  print(name)

  query = f"""    
  select available_bike_stands, available_bikes, max(last_update) from available
  join stations on available.number = stations.number
  where stations.name = '{name}'"""
  print(query)
  # use the engine connection to query
  AV = pd.read_sql_query(query, engine)

  print(AV)
  return AV.to_json(orient='records')

# get the average for last few hours Get the day average ofet hestation over the days
@app.route("/avgdetails/<name>")
def avgdetails(name):
  # use the name in a query
  print(name)

  query = f"""    
  select available_bike_stands, available_bikes, last_update from available
  join stations on available.number = stations.number
  where stations.name = '{name}'"""
  print(query)
  # use the engine connection to query
  df = pd.read_sql_query(query, engine)
  # get the mean of the days
  res_df = df.set_index("last_update").resample("1d").mean()
  res_df["last_update"] = res_df.index
  return res_df.to_json(orient='records')

# get the average for the station on the current day
@app.route("/dayavg/<name>")
def dayavg(name):
  # use the name in a query
  print(name)

  query = f"""    
  select available_bike_stands, available_bikes, last_update from available
  join stations on available.number = stations.number
  where stations.name = '{name}'
  and day(last_update) = Day(curdate())
  and month(last_update) = Month(curdate())"""
  print(query)
  # use the engine connection to query
  df = pd.read_sql_query(query, engine)
  # get the mean of the days
  res_df = df.set_index("last_update").resample("1h").mean()
  res_df["last_update"] = res_df.index
  return res_df.to_json(orient='records')

# get the hourly average for the day for all stations
@app.route("/houravg")
def allavg():
  # use the name in a query
  # query for today's data
  query = """    
  select available_bike_stands, available_bikes, last_update from available
  where Day(last_update) = Day(curdate())
  and month(last_update) = Month(subdate(curdate(),1))
  """
  print(query)
  # use the engine connection to query
  df = pd.read_sql_query(query, engine)
  # get the mean of the days
  res_df = df.set_index("last_update").resample("1h").mean()
  # query for yesterdays data
  res_df["last_update"] = res_df.index
  return res_df.to_json(orient='records')

# get the average for for the day for all stations
@app.route("/pastavg/<name>")
def yesterdayavg(name):
  # use the name in a query
  # query for yesterday's data
  query = f"""    
  select available_bike_stands, available_bikes, last_update from available
  join stations on available.number = stations.number
  where stations.name = '{name}'
  and Day(last_update) = Day(subdate(curdate(),1))
  and month(last_update) = Month(subdate(curdate(),1))
  """
  print(query)
  # use the engine connection to query
  df = pd.read_sql_query(query, engine)
  # get the mean of the days
  res_df = df.set_index("last_update").resample("1h").mean()
  # query for yesterdays data
  res_df["last_update"] = res_df.index
  return res_df.to_json(orient='records')

# get the most recent weather data
@app.route("/weather")
def getWeather():
  sql = f"""SELECT * FROM `jcdecaux-bikes`.weather\
  WHERE\
  time = (SELECT\
  MAX(time)\
  FROM\
      `jcdecaux-bikes`.weather)"""
  df = pd.read_sql(sql, engine)
  return df.to_json(orient='records')

# predict
@app.route("/predict/<day>/<hour>/<minute>/<name>")
def predict(day, hour,minute, name):
    day = int(day)
    hour = int(hour)
    minute = int(minute)
    print(day)
    # need to get the number of station
    query = f'''
    SELECT number, bike_stands from stations
    where name = '{name}'
    '''
    df = pd.read_sql(query, engine)
    number = df.values[0][0]
    bike_stands = df.values[0][1]

    # here is where we add the prediction code, so we get the data from the dataframe and get the right format.
    # insert into the model and return the value.
    model_to_use = loaded_model[number]

    # load the data
    df = pd.read_csv("..\Forecast.csv", index_col=0)

    data = df[(df["dayOfWeek"] == day) & (df["hour"] == hour) & (df["minute"] == minute)]
    print(df["dayOfWeek"].unique())

    # model predicts available bikes
    predicted_value = model_to_use.predict(data.values)
    available_bikes = round(predicted_value[0])
    available_stands = bike_stands - available_bikes
    # convert to dataframe
    df = pd.DataFrame([[available_bikes, available_stands]], columns = ["bikes", "stands"])

    # pass on as json
    return df.to_json(orient='records')

# get the rest of day prediction
@app.route("/daypredict/<day>/<hour>/<minute>/<name>")
def daypredict(day, hour,minute, name):
    day = int(day)
    hour = int(hour)
    # need to get the number of station
    query = f'''
    SELECT number, bike_stands from stations
    where name = '{name}'
    '''
    df = pd.read_sql(query, engine)
    number = df.values[0][0]
    bike_stands = df.values[0][1]
    
    # here is where we add the prediction code, so we get the data from the dataframe and get the right format.
    # insert into the model and return the value.
    model_to_use = loaded_model[number]

    # load the data
    df = pd.read_csv("..\Forecast.csv", index_col=0)
    print(df["dayOfWeek"])
    data = df[df["dayOfWeek"] == day]

    # model predicts available bikes
    predicted_values = model_to_use.predict(data.values)

    available_bikes = np.around(predicted_values)
    available_stands = bike_stands - available_bikes
    # convert to dataframe
    df = pd.DataFrame(zip(available_bikes, available_stands), columns=["bikes", "stands"])
    # pass on as json
    return df.to_json(orient='records')




if __name__ == "__main__":
    app.run(debug=True)
