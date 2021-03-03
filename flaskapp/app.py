from flask import Flask,render_template
from jinja2 import Template
from sqlalchemy import create_engine
import pandas as pd
import json

# Get keys from JSON file
with open('keys.json') as f:
   keys = json.load(f)

app = Flask(__name__)

@app.route("/")
def home():
    return app.send_static_file("index.html")


@app.route("/about")
def about():
    return app.send_static_file("about.html")

@app.route("/contact")
def contact():
    #tpl = Template()
    d = {'name':'Tallguy'}
    return render_template("contact.html", **d)

@app.route("/stations")
def stations():
    # create the engine outside the loop so only create the table once
    engine = create_engine("mysql+mysqlconnector://{host}:{password}@{endpoint}:3306/{db_name}".format(   host=keys["db"]["host"],
                                                                                                        password=keys["db"]["password"],
                                                                                                        endpoint=keys["db"]["endpoint"],
                                                                                                        db_name=keys["db"]["name"]),
                                                                                                        echo=True)
    df = pd.read_sql_table("stations", engine)
    #results = engine.execute("select * from stations")
    #print([res for res in results])
    print(df.head())
    return "nothing"

if __name__ == "__main__":
    app.run(debug=True)
