from flask import Flask,render_template
from jinja2 import Template
from sqlalchemy import create_engine
import db
import pandas as pd

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
    engine = create_engine("mysql+mysqlconnector://{host}:{password}@{endpoint}:3306/{db_name}".format(host=db.host,
                                                                                                        password=db.password,
                                                                                                        endpoint=db.endpoint,
                                                                                                        db_name=db.name),
                                                                                                        echo=True)
    df = pd.read_sql_table("stations", engine)
    #results = engine.execute("select * from stations")
    #print([res for res in results])
    print(df.head())
    return "nothing"

if __name__ == "__main__":
    app.run(debug=True)
