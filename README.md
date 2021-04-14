COMP30830 - 'Software Engineering', Group 21

Group members:

Tom Walsh

Henry Lewis

Danning Zhan

_______________________

'Dublin Bikes'

This web application is intended to provide a user friendly UI for accessing information on the dublin city bikes service.

The repo includes all relevant code, this includes:

- Flask application

- Backend code which gets regular weather data from open weather maps and bike availability data from JCDecaux, and stores it in a database

- Backend code which daily gets a 5 day weather forecast, and a jupyter notebook used while researching this task

- A jupyter notebook which was used to train prediction models, the models are saved in the /models folder

_______________________

In order to run this code, a keys.json file is needed with relevant access keys. The format is below:

{
"db": {
  "host": "",
  "password": "",
  "endpoint": "",
  "name": ""
},
"jcdecaux": {
  "API": ""
},
"weather": {
  "ID": "",
  "API": ""
},
"googleMaps": {
  "key": ""
}
}