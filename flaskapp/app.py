from flask import Flask, render_template, request
from jinja2 import Template
from sqlalchemy import create_engine
import pandas as pd
import json

# Get keys from JSON file
with open('../keys.json') as f:
    keys = json.load(f)

app = Flask(__name__)

# This function sets up the template for the homepage (index)
@app.route("/")
def home():
    return render_template("index.html")


# This function sets up the template for the about page (content and structure to be determined)
@app.route("/about")
def about():
    return app.send_static_file("about.html")

# This function sets up the template for the contacts page (content and structure to be determined)
@app.route("/contact")
def contact():
    #tpl = Template()
    d = {'name':'Tallguy'}
    return render_template("contact.html", **d)

# reads API information for station locations and outputs a dataframe
@app.route("/stations")
def stations():
    engine = create_engine("mysql+mysqlconnector://{host}:{password}@{endpoint}:3306/{db_name}".format(host=keys["db"]["host"],
                                                                                                        password=keys["db"]["password"],
                                                                                                        endpoint=keys["db"]["endpoint"],
                                                                                                        db_name=keys["db"]["name"]),
                                                                                                        echo=True)
    df = pd.read_sql_table("stations", engine)
    return df.to_json(orient='records')


@app.route("/bikes")
def dynamic_bikes():

    df = pd.read_sql_table("SELECT*from static_bikes", engine)
    bike_data = df.to_json(orient='records')
    return bike_data
@app.route("/details/<name>")
def details(name):
    engine = create_engine("mysql+mysqlconnector://{host}:{password}@{endpoint}:3306/{db_name}".format(host=keys["db"]["host"],
                                                                                                        password=keys["db"]["password"],
                                                                                                        endpoint=keys["db"]["endpoint"],
                                                                                                        db_name=keys["db"]["name"]),
                                                                                                        echo=True)

    # get the name form javascript
    #names = request.args.values("station")

    # use the name in a query
    print(name)
    #print(request.values.get.keys())
    query = f"""    
    select available_bike_stands, available_bikes, max(last_update) from available
    join stations on available.number = stations.number
    where stations.name = '{name}'"""
    print(query)
    # use the engine connection to query
    with engine.connect() as con:
        AV = pd.read_sql_query(query, con)

    print(AV)
    return AV.to_json(orient='records')

if __name__ == "__main__":
    app.run(debug=True)
