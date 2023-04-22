# Práctica 11 - Creación de una aplicación Express para gestionar el registro de Funko Pops
## Daniel Felipe Gomez Aristizabal


## Indice

1. [Introducción](#introducción)

2. [Idea del programa](#idea-del-programa)

3. [Express](#express)

4. [Modificacion de las operaciones con Funkos](#modificacion-de-las-operaciones-con-funkos)

5. [Hablemos de los Test](#hablemos-de-los-test)

6. [Thunder Client](#thunder-client)

7. [Ejercicio de clase PE](#ejercicio-de-clase-pe)

8. [Conclusiones](#conclusiones)

9. [Referencias](#referencias)



## Introducción

En la presente práctica desarrollaremos un programa cliente-servidor similar a la práctica anterior, con la diferencia de que ahora utilizaremos el framework Express para el desarrollo del servidor. A través de la ruta **/funkos** se podrá acceder a las operaciones CRUD de la colección de Funkos. Debemos entonces hacer uso de la lógica detrás de los Funkos ya desarrollada en la práctica 9 de la asignatura.



## Idea del programa

Como la idea es atender distintos tipos de peticiones a través de la misma ruta, desarrollé primeramente una lógica de control para los 4 tipos de verbos HTTP, recordemos que estos son:

* **get**: Para obtener información sobre un Funko Pop concreto de un usuario o para listar todos sus Funko Pops.

* **post**: Para añadir un Funko Pop a la lista de un usuario.

* **delete**: Para eliminar un Funko Pop de la lista de un usuario.

* **patch**: Para modificar la información de un Funko Pop existente en la lista de un usuario.

Para esto definí una ruta **/funkos** y describí los verbos HTTP que se atenderán.

```ts
app.route('/funkos')
    .get((req, res) => {
        // manejar solicitud GET
    })
    .post((req, res) => {
        // manejar solicitud POST
    })
    .delete((req, res) => {
        // manejar solicitud DELETE
    })
    .patch((req, res) => {
        // manejar solicitud PATCH
    });
```

Luego dentro controlaré las diferentes peticiones que se intercepten, para esto dentro de cada correspondiente método HTTP, definí una serie de if else que se harán cargo de gestionar y llamar a su correspondiente función. La idea será que el usuario defina el tipo de petición y pase los argumentos necesarios para cada una de las funciones y en base a esto se ejecutará la lógica correspondiente.



## Express

Para desarrollar el servidor haciendo uso de Express debo reconocer que me ha sido de mucha ayuda lo estudiado para la sesión práctica, incluso el esqueleto inicial para el desarrollo fue el mismo que el que diseñe en el ejercicio de dicha sesión. Tenemos un controlador de ruta genérica, donde mandaremos un error 404, este lo debemos ubicar al final de la página, ya que si lo ponemos primero interceptaría todas las rutas.

```ts
app.get('*', (req, res) => {
  res.status(404)
  res.send()
})
```

Recordemos que teniamos un controlador para la ruta **/funkos** y que este atendia diferentes tipos de peticiones HTTP, para atender por ejemplo la petición **get**, debemos verificar si se han pasado los dos argumentos que nos interesaban además de determinar si solo se ha pasado el nombre. 

En caso de recibir el parámetro **nombreUsuario** y ninguno otro, sabemos que debemos atender la solicitud de listar todos los Funkos de un Usuario en particular. Por otro lado si no tenemos ni el parámetro **nombreUsuario** ni el **id** significa que la petición está mal y debemos informar al usuario de esto. Finalmente, si se han recibido los dos parámetros antes mencionados, debemos atender la solicitud de obtener un Funko Pop en particular de un Usuario en concreto.

Veamos entonces el caso de control para cada uno, al final este proceso se repetirá en las demás peticiones.

```ts
MenuFunko.listarFunkos(req.query.nombreUsuario as string, (funkoError, funkoData) => {
    if (funkoError) {
        res.status(500)
        const response: ResponseType = {
        type: 'list',
        success: false,
        funkoData: funkoError,

        };
        res.send({
            response
        })
    }
    ...
```

Como podemos una vez hemos determinado que existe un error en la petición, debemos controlarla informando al cliente, para esto cambiamos el estado de la respuesta a 500, informando del error provocado en el servidor. Ahora formamos la respuesta, definiendo el tipo de petición y marcando la opción de **success** como false, para indicar que la petición ha fracasado, además mediante la variable **funkoData** pasamos el error que se ha producido. Finalmente enviamos la respuesta al cliente.

Ahora veamos el caso de una petición sin errores determinados por el servidor:

```ts
    ...
    else if (funkoData) {
        const response: ResponseType = {
        type: 'list',
        success: true,
        funkoData: funkoData,
        };
        res.send({
            response
        })
    }
});
```

Como podemos apreciar, si tenemos datos del servidor, vamos a contruir la repsuesta del servidor de forma similar a como veiamos antes, con la diferencia de informar que la petición ha sido exitosa, por tanto **success** será true y además pasamos los datos que nos ha devuelto el servidor.


Esta lógica que acabamos de representar es la que se siguió para todos los tipos de peticiones, por tanto no la repetiré en el informe, pero si se puede ver en el código del servidor o en la documentación del mismo.

## Modificacion de las operaciones con Funkos

Como vimos anteriormente llamamos a una serie arrow functions encargadas de realizar las operaciones con los Funkos y los ficheros, estás funciones se encuentran en el fichero **menuFunko.ts**. Anteriormente estas eran funciones estáticas que se encargaban de realizar las operaciones correspondientes, pero para el desarrollo de esta práctica se han modificado para que sigan el patrón callback, veamos un ejemplo:

```ts
static listarFunkos = (nombreUsuario: string,  callback: (
    err: string | undefined, data: Funko[] | undefined) => void) => {

    const files = fs.readdirSync('./db/' + nombreUsuario + '/');
    let listaFunkos: Funko[] = []
    files.forEach(file => {
        const funkoJSON = ManejadorJSON.leerJSON('./db/' + nombreUsuario + '/' + file);
        if (funkoJSON !== undefined) {
            const funko = new Funko(funkoJSON._id, funkoJSON._nombre, funkoJSON._descripcion, funkoJSON._tipo, funkoJSON._genero, funkoJSON._franquicia, funkoJSON._numero, funkoJSON._exclusivo, funkoJSON._caracteristica_especial, funkoJSON._valor_mercado);
            listaFunkos.push(funko);
        }
    });
    callback(undefined, listaFunkos);
};
```

Si nos fijamos en la definición ahora tenemos los parámetros necesarios para llevar a cabo la operación y además un callback que se encargará de devolver los datos al servidor. En este caso el callback recibe dos parámetros, el primero es un string que puede ser undefined o un mensaje de error, el segundo es un array de Funkos que puede ser undefined o un array de Funkos.

La idea será llevar a cabo el código que ya se tenía para realizar la operación con la diferencia que ahora no se imprime por pantalla, sino que se llama al callback con los datos correspondientes. En caso de que se produzca un error, se llama al callback con el error correspondiente.

Esto lo que nos permite es que como vimos antes, desde la parte del servidor, haciendo uso del patrón callback chaining, podemos controlar la respuesta del servidor en base a los datos que nos devuelva el callback.


## Hablemos de los tests

Para realizar los test con **mocha** y **chai**, he seguido un ejemplo de los apuntes de la asignatura donde se propone hacer una **request**, de esta forma teniendo el servidor activo, podemos hacer una consulta al servidor como lo hacemos desde el **Thunder Client**. Para la prueba he creado un Funko para un usuario 'Test' y luego le he modificado dicho Funko, posteriormente lo he obtenido de forma particular y general con **GET** y por último lo he eliminado.

Veamos un ejemplo de como definimos la **url** para realizar la consulta y luego mediante **request** hacemos la consulta al servidor, debemos especificar el método, en este casi **POST**. Luego dentro del manejador de la respuesta, comprobamos que el código de estado sea 200, que la respuesta sea un objeto, que el objeto tenga una propiedad **response** que sea un objeto, que el tipo de petición sea **add** y que la petición haya sido exitosa, además de comprobar que los datos del Funko que se ha añadido son los que esperamos.

```ts
it('Consulta de añadir un funko', (done) => {
    const url = "http://localhost:3000/funkos?nombreUsuario=Test&id=1&nombre=TestFunko&descripcion=TestFunko&tipo=Pop!&genero=test&franquicia=test&numero=1&caracteristica_especial='Hace tests'&valor_mercado=1000"
    request({method: 'POST', url: url, json: true}, (error: Error, response) => {
        expect(response.statusCode).to.be.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body.response).to.be.an('object');
        expect(response.body.response.type).to.be.equal('add');
        expect(response.body.response.success).to.be.equal(true);
        expect(response.body.response.funkoData).to.be.an('object');
        expect(response.body.response.funkoData._id).to.be.equal(1);
        expect(response.body.response.funkoData._nombre).to.be.equal('TestFunko');
        expect(response.body.response.funkoData._descripcion).to.be.equal('TestFunko');
        expect(response.body.response.funkoData._tipo).to.be.equal('Pop!');
        expect(response.body.response.funkoData._genero).to.be.equal('test');
        expect(response.body.response.funkoData._franquicia).to.be.equal('test');
        expect(response.body.response.funkoData._numero).to.be.equal(1);
        expect(response.body.response.funkoData._caracteristica_especial).to.be.equal("'Hace tests'");
        expect(response.body.response.funkoData._valor_mercado).to.be.equal(1000);
    });
    done()
  });
```	

En el caso de la modificación, la única diferencia es que el método es **PATCH** y que comprobamos que el tipo de petición sea **update** y que la petición haya sido exitosa.

```ts
  it('Consultar de modificacion de un funko', (done) => {
    const url = "http://localhost:3000/funkos?nombreUsuario=Test&id=1&nombre=TestFunkoModificado&descripcion=TestFunkoModificado&tipo=Pop!&genero=test&franquicia=test&numero=1&caracteristica_especial='Hace tests'&valor_mercado=1000"
    request({method: 'PATCH', url: url, json: true}, (error: Error, response) => {
        expect(response.statusCode).to.be.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body.response).to.be.an('object');
        expect(response.body.response.type).to.be.equal('update');
        expect(response.body.response.success).to.be.equal(true);
        expect(response.body.response.funkoData).to.be.an('object');
        expect(response.body.response.funkoData._id).to.be.equal(1);
        expect(response.body.response.funkoData._nombre).to.be.equal('TestFunkoModificado');
        expect(response.body.response.funkoData._descripcion).to.be.equal('TestFunkoModificado');
        expect(response.body.response.funkoData._tipo).to.be.equal('Pop!');
        expect(response.body.response.funkoData._genero).to.be.equal('test');
        expect(response.body.response.funkoData._franquicia).to.be.equal('test');
        expect(response.body.response.funkoData._numero).to.be.equal(1);
        expect(response.body.response.funkoData._caracteristica_especial).to.be.equal("'Hace tests'");
        expect(response.body.response.funkoData._valor_mercado).to.be.equal(1000);
    });
    done()
  });
```

Para el caso de la consulta tendremos un caso donde consultamos un Funko en específico, en este caso debemos usar el método **GET**.

```ts
  it('Consultar de consulta de un funko', (done) => {
    const url = "http://localhost:3000/funkos?nombreUsuario=Test&id=1"
    request({method: 'GET', url: url, json: true}, (error: Error, response) => {
        expect(response.statusCode).to.be.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body.response).to.be.an('object');
        expect(response.body.response.type).to.be.equal('read');
        expect(response.body.response.success).to.be.equal(true);
        expect(response.body.response.funkoData).to.be.an('object');
        expect(response.body.response.funkoData._id).to.be.equal(1);
        expect(response.body.response.funkoData._nombre).to.be.equal('TestFunkoModificado');
        expect(response.body.response.funkoData._descripcion).to.be.equal('TestFunkoModificado');
        expect(response.body.response.funkoData._tipo).to.be.equal('Pop!');
        expect(response.body.response.funkoData._genero).to.be.equal('test');
        expect(response.body.response.funkoData._franquicia).to.be.equal('test');
        expect(response.body.response.funkoData._numero).to.be.equal(1);
        expect(response.body.response.funkoData._caracteristica_especial).to.be.equal("'Hace tests'");
        expect(response.body.response.funkoData._valor_mercado).to.be.equal(1000);
    });
    done()
  });

```

En este otro caso también usamos el método **GET** pero en este caso consultamos todos los Funkos que tenemos en la base de datos para un usuario en específico.
```ts
  it('Consultar de consulta de todos los funkos', (done) => {
    const url = "http://localhost:3000/funkos?nombreUsuario=Test"
    request({method: 'GET', url: url, json: true}, (error: Error, response) => {
        expect(response.statusCode).to.be.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body.response).to.be.an('object');
        expect(response.body.response.type).to.be.equal('list');
        expect(response.body.response.success).to.be.equal(true);
        expect(response.body.response.funkoData).to.be.an('array');
        expect(response.body.response.funkoData[0]._id).to.be.equal(1);
        expect(response.body.response.funkoData[0]._nombre).to.be.equal('TestFunkoModificado');
        expect(response.body.response.funkoData[0]._descripcion).to.be.equal('TestFunkoModificado');
        expect(response.body.response.funkoData[0]._tipo).to.be.equal('Pop!');
        expect(response.body.response.funkoData[0]._genero).to.be.equal('test');
        expect(response.body.response.funkoData[0]._franquicia).to.be.equal('test');
        expect(response.body.response.funkoData[0]._numero).to.be.equal(1);
        expect(response.body.response.funkoData[0]._caracteristica_especial).to.be.equal("'Hace tests'");
        expect(response.body.response.funkoData[0]._valor_mercado).to.be.equal(1000);
    });
    done()
  });

```

Finalmente tenemos el caso de borrado, en este caso usamos el método **DELETE**.
```ts
  it('Consultar de borrado de un funko', (done) => {
    const url = "http://localhost:3000/funkos?nombreUsuario=Test&id=1"
    request({method: 'DELETE', url: url, json: true}, (error: Error, response) => {
        expect(response.statusCode).to.be.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body.response).to.be.an('object');
        expect(response.body.response.type).to.be.equal('delete');
        expect(response.body.response.success).to.be.equal(true);
        expect(response.body.response.funkoData).to.be.equal('Eliminado el funko 1')
    });
    done()
  });
```

Lo hice de esta forma, para que cuando se ejecuten los test, el orden permita que nunca hayan archivos requeridos no existentes.

## Thunder Client

Para probar mi prográma hice uso de Thunder Client, básicamente por la comodidad a la hora de poner los parámetros ya que algunas peticiones necesitan demasiados, además de que me permite probar distintos tipos de peticiones HTTP. A continuación veremos algunos ejemplos de peticiones que he realizado.

GET

```url
http://localhost:3000/funkos?nombreUsuario=Dani
```

```json
{
  "response": {
    "type": "list",
    "success": true,
    "funkoData": [
      {
        "_id": 1,
        "_nombre": "Poco",
        "_descripcion": "Un poquito loco",
        "_tipo": "Pop!",
        "_genero": "Comidas y Sabores",
        "_franquicia": "BrawlStars",
        "_numero": 4,
        "_exclusivo": true,
        "_caracteristica_especial": "Toca musica",
        "_valor_mercado": 100
      },
      {
        "_id": 2,
        "_nombre": "Poco",
        "_descripcion": "'No tan loco'",
        "_tipo": "'Pop!'",
        "_genero": "juego",
        "_franquicia": "BrawlStars",
        "_numero": 4,
        "_caracteristica_especial": "'Toca guitarra'",
        "_valor_mercado": 100
      }
    ]
  }
}
```

GET con id

```url
http://localhost:3000/funkos?nombreUsuario=Dani&id=2
```

```json
{
  "response": {
    "type": "read",
    "success": true,
    "funkoData": {
      "_id": 2,
      "_nombre": "Poco",
      "_descripcion": "'No tan loco'",
      "_tipo": "'Pop!'",
      "_genero": "juego",
      "_franquicia": "BrawlStars",
      "_numero": 4,
      "_caracteristica_especial": "'Toca guitarra'",
      "_valor_mercado": 100
    }
  }
}
```

POST

```url
http://localhost:3000/funkos?nombreUsuario=Messi&id=2&nombre=Poco&descripcion='No tan loco'&tipo='Pop!'&genero=juego&franquicia=BrawlStars&numero=4&caracteristica_especial='Toca guitarra'&valor_mercado=100
```

```json
{
  "response": {
    "type": "read",
    "success": true,
    "funkoData": {
      "_id": 2,
      "_nombre": "Poco",
      "_descripcion": "'No tan loco'",
      "_tipo": "'Pop!'",
      "_genero": "juego",
      "_franquicia": "BrawlStars",
      "_numero": 4,
      "_caracteristica_especial": "'Toca guitarra'",
      "_valor_mercado": 100
    }
  }
}
```

PATCH

```url
http://localhost:3000/funkos?nombreUsuario=Messi&id=2&nombre=MUYPOCO&descripcion='No tan loco'&tipo='Pop!'&genero=juego&franquicia=BrawlStars&numero=4&caracteristica_especial='Toca guitarra'&valor_mercado=100
```

```json
{
  "response": {
    "type": "update",
    "success": true,
    "funkoData": {
      "_id": 2,
      "_nombre": "MUYPOCO",
      "_descripcion": "'No tan loco'",
      "_tipo": "'Pop!'",
      "_genero": "juego",
      "_franquicia": "BrawlStars",
      "_numero": 4,
      "_caracteristica_especial": "'Toca guitarra'",
      "_valor_mercado": 100
    }
  }
}
```

DELETE

```url
http://localhost:3000/funkos?nombreUsuario=Dani&id=2
```

```json
{
  "response": {
    "type": "delete",
    "success": true,
    "funkoData": "Eliminado el funko 2"
  }
}
```


## Ejercicio de clase PE

Para evaluar la sesión PE, se nos pidió desarrollar un programa cliente-servidor con Express donde se hciiera peticiones a WeatherStack, debiamos poder controlar las peticiones fallidas del servidor, las peticiones a rutas inexistentes y las peticiones exitosas.


Para poder realizar las peticiones en WeatherStack, desarrollé una arrow function que recibía la localización que deseábamos consultar y como segundo parámetro un callback que se encargaba de devolver los datos al servidor. En caso de que se produjera un error, se llamaba al callback con el error correspondiente.

```ts
import request from 'request';

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
```

Por la parte del servidor, tenemos lo siguiente:

```ts
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
```

Como se puede apreciar, definí un controlador en la parte inferior para la ruta *****, con el fin de interceptar las páginas no encontradas y devolver un código de error 404. En la parte superior, definí un controlador para la ruta /weather, donde se comprueba si se ha pasado un parámetro location, en caso de que no se haya pasado, se devuelve un código de error 400. En caso de que se haya pasado, se llama a la función weatherInfo, que se encarga de realizar la petición a WeatherStack. En caso de que se produzca un error, se devuelve un código de error 500 y se envía el error al cliente. En caso de que no se produzca ningún error, se devuelve un código de estado 200 y se envía la respuesta al cliente.


## Conclusiones

Esta práctica la veo como un resultado de muchos conocimientos previos, ya que de cierta forma me parece de las prácticas más vistosas, donde también se puede apreciar una funcionalidad interesante, al final con un poco más de detalles y unas plantillas HTML estaría listo para ser desplegado como una página sencilla de inventario de Funkos, misión que capaz en un futuro me planteo realizar.