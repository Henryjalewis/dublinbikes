from flask import Flask, render_template, request
from jinja2 import Template
from sqlalchemy import create_engine
import pandas as pd
import json

# Get keys from JSON file
with open('../keys.json') as f:
  keys = json.load(f)

engine = create_engine("mysql+mysqlconnector://{host}:{password}@{endpoint}:3306/{db_name}".format(host=keys["db"]["host"], password=keys["db"]["password"], endpoint=keys["db"]["endpoint"], db_name=keys["db"]["name"]))

app = Flask(__name__)

# This function sets up the template for the homepage (index)
@app.route("/")
def home():
  d = {'key': keys['googleMaps']['key']}
  return render_template("index.html", **d)

# This function sets up the template for the route planning page
@app.route("/route")
def route():
  d = {'key': keys['googleMaps']['key']}
  return render_template("route.html", **d)
# This function sets up the template for the homepage (index)
@app.route("/information")
def information():
  return render_template("details.html")


# This function sets up the template for the about page (content and structure to be determined)
@app.route("/about")
def about():
  return render_template("about.html")

# This function sets up the template for the contacts page (content and structure to be determined)

@app.route("/contact")
def contact():
  #tpl = Template()
  d = {'name':'Tallguy'}
  return render_template("contact.html", **d)

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

# get the average for last few hours
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

if __name__ == "__main__":
    app.run(debug=True)
