import pandas as pd
import sklearn
import requests
import datetime
import json
import numpy as np
import time
from sklearn.preprocessing import OneHotEncoder


with open('keys.json') as f:
   keys = json.load(f)

# loop to get the data
while True:
   # get 5 day forecast, data is at 3 hour intervals
   weatherFiveDay = requests.get("http://api.openweathermap.org/data/2.5/forecast?lat=53.346&lon=-6.26986&appid={API_key}".format(API_key = keys["weather"]["API"]))
   fiveDayJSON = weatherFiveDay.json()
   fiveDayForecast = pd.json_normalize(fiveDayJSON, record_path=['list'])
   fiveDayForecast = fiveDayForecast[['main.temp', 'wind.speed', 'main.humidity', 'dt']]
   forcast_fiveday = pd.json_normalize(fiveDayJSON, record_path=['list', 'weather'])['main']
   fiveDayForecast = pd.concat([forcast_fiveday, fiveDayForecast], axis=1)
   fiveDayForecast = fiveDayForecast.rename(
      columns={"main.temp": "temp", "wind.speed": "wind_speed", "main.humidity": "humidity"})
   fiveDayForecast['dt'] = pd.to_datetime(fiveDayForecast['dt'], unit='s')

   # interpolation
   thirtyMinuteDF = pd.DataFrame(columns=['main', 'temp', 'wind_speed', 'humidity', 'dt'])

   for index, row in fiveDayForecast.iterrows():
      df = pd.DataFrame([[row['main'], row['temp'], row['wind_speed'], row['humidity'], row['dt']]],
                        columns=['main', 'temp', 'wind_speed', 'humidity', 'dt'])
      thirtyMinuteDF = thirtyMinuteDF.append(df, ignore_index=True)
      for i in range(30, 180, 30):
         new_time = row['dt'] + datetime.timedelta(minutes=i)
         df = pd.DataFrame([[row['main'], np.nan, np.nan, np.nan, new_time]],
                           columns=['main', 'temp', 'wind_speed', 'humidity', 'dt'])
         thirtyMinuteDF = thirtyMinuteDF.append(df, ignore_index=True)


   thirtyMinuteDF['humidity'] = pd.to_numeric(thirtyMinuteDF['humidity'])
   thirtyMinuteDF['temp'] = thirtyMinuteDF['temp'].interpolate()
   thirtyMinuteDF['wind_speed'] = thirtyMinuteDF['wind_speed'].interpolate()
   thirtyMinuteDF['humidity'] = thirtyMinuteDF['humidity'].interpolate()

   thirtyMinuteDF = thirtyMinuteDF.round({'temp': 2, 'wind_speed': 2, 'humidity': 1})

   # encoding the data
   categories = np.array(['Clear', 'Clouds', 'Drizzle', 'Mist', 'Rain', 'Snow']).reshape(-1, 1)
   type_encoder = OneHotEncoder(handle_unknown='ignore').fit(categories)
   type_encoded = type_encoder.transform(np.array(thirtyMinuteDF["main"]).reshape(-1, 1))
   type_encoded = pd.DataFrame(type_encoded.toarray(), columns=[category for category in type_encoder.categories_[0]])
   temp = thirtyMinuteDF.reset_index(drop=True)
   encodedThirtyMinuteDF = pd.concat([type_encoded, temp[["temp", "wind_speed", "humidity", "dt"]]], axis=1)

   # time encoding
   encodedThirtyMinuteDF["dayOfWeek"] = encodedThirtyMinuteDF["dt"].dt.weekday
   encodedThirtyMinuteDF["hour"] = encodedThirtyMinuteDF["dt"].dt.hour
   encodedThirtyMinuteDF["minute"] = encodedThirtyMinuteDF["dt"].dt.minute
   # switching the order of the oclumns
   encodedThirtyMinuteDF = encodedThirtyMinuteDF[["Clear", "Clouds", "Drizzle", "Mist", "Rain", "Snow", "dayOfWeek", "hour", "minute", "temp", "humidity","wind_speed"]]
   # save
   encodedThirtyMinuteDF.to_csv("Forecast.csv")
   # sleep for 1 day
   time.sleep(86400)