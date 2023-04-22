import express from 'express';
import {weatherInfo} from './get_weather.js'
import {ResponseType} from './response_type.js'


const app = express();


/**
 * Controlador de la ruta /weather para obtener la información del tiempo
 */
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

/**
 * Controlador de la ruta / para devolver un error 404
 */
app.get('*', (req, res) => {
  res.status(404)
  res.send()
})

/**
 * Inicia el servidor en el puerto 3001
 */
app.listen(3001, () => {
  console.log('Server is up on port 3001');
});
