import express from 'express';
import {weatherInfo} from './get_weather.js'
import {ResponseType} from './response_type.js'


const app = express();



app.get('/weather', (req, res) => {

  if (!req.query.location) {
    res.status(400);
    res.send({
      error: 'A location has to be provided',
    });
  } else {
    weatherInfo(req.query.location as string, (weatherErr, weatherData) => {
      if (weatherErr) {
        res.status(500)
        const response: ResponseType = {
          type: 'read',
          success: false,
          weather: weatherErr,

        };
        res.send({
            response
        })
      } else if (weatherData) {
        const response: ResponseType = {
          type: 'read',
          success: true,
          weather: weatherData.body,
        };
        res.send({
            response
        })
      }
    });
  }
});

app.get('*', (req, res) => {
  res.status(404)
  res.send()
})


app.listen(3000, () => {
  console.log('Server is up on port 3000');
});
