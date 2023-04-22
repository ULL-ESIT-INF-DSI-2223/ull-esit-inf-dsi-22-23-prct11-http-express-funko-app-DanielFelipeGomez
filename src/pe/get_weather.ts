import request from 'request';

/**
 * Arrow function que obtiene la información del tiempo de una localización
 * @param location 
 * @param callback 
 */
export const weatherInfo = (location: string, callback: (
    err: string | undefined, data: request.Response | undefined) => void) => {
    const url = `http://api.weatherstack.com/current?access_key=4e82091e9a7cd4ce349be91ea9b4417a&query=${encodeURIComponent(location)}&units=m`;
      
    request({url: url, json: true}, (error: Error, response) => {
      if (error) {
        callback(`Weatherstack API is not available: ${error.message}`,
            undefined);
      } else if (response.body.error) {
        callback(`Weatherstack API error: ${response.body.error.type}`,
            undefined);
      } else {
        callback(undefined, response);
      }
    });
  };

