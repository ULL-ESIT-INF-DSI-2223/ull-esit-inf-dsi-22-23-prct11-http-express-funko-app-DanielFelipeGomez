import 'mocha';
import {expect} from 'chai';
import {weatherInfo} from '../../src/pe/get_weather.js';
import request from 'request';


describe('Asynchronous function weatherInfo tests', () => {
  it('weatherInfo should get weather information', (done) => {
    weatherInfo('Tenerife, Spain', (_, data) => {
      if (data) {
        expect(data.body.location.name).to.be.equal('Tenerife');
        done();
      }
    });
  });

  it('weatherInfo should provide an error', (done) => {
    weatherInfo('12wherever', (error, _) => {
      if (error) {
        expect(error).to.be.equal('Weatherstack API error: request_failed');
        done();
      }
    });
  });

  it('weatherInfo should provide an error', (done) => {
    const url = "http://localhost:3001/weatr?location='Tenerife, Spain'"
    request({url: url, json: true}, (error: Error, response) => {
        expect(response.statusCode).to.be.equal(404);

    });
    done()
  });

});

