importScripts('https://cdn.jsdelivr.net/npm/pouchdb@7.1.1/dist/pouchdb.min.js')

// SERVICE WORKER DB
const db = new PouchDB('empresas');

function guardarMensaje(mensaje) {
  mensaje._id = new Date().toISOString()
  return db.put(mensaje)
    .then(() => {
      self.registration.sync.register('nueva-empresa');
      const newResp = {
        ok: true,
        offline: true
      }
      return new Response(JSON.stringify(newResp))
      // console.log('mensaje guardado para posterior posteo');
    })
}


// postear mensajes a la API
function postearMensajes() {
  const empresas = []

  return db.allDocs({
      include_docs: true
    })
    .then(docs => {
      docs.rows.forEach(async row => {
        const doc = row.doc
        const payload = {
          name: doc.name,
          code: doc.code
        }
        const fetchProm = await fetch('https://dash-simple.herokuapp.com/api/company', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
          })
          .then(res => {
            return res.json()
          })
          .then(res => {
            // console.log('doc 2 : ', doc);
            console.log('res : ', res);
            return db.remove(doc)
          })

        empresas.push(fetchProm)
      }) // fin de forEach
      return Promise.all(empresas)
    })
}


// SEVICE WORKER UTILS

function actualizaCacheDinamico(dynamicCache, req, res) {
  if (res.ok) {
    return caches.open(dynamicCache).then(cache => {
      cache.put(req, res.clone())
      return res.clone()
    })
  } else {
    return res;
  }
}

function limpiarCache(cacheName, numeroItems) {
  caches.open(cacheName)
    .then(cache => {
      return cache.keys()
        .then(keys => {
          if (keys.length > numeroItems) {
            cache.delete(keys[0])
              .then(limpiarCache(cacheName, numeroItems));
          }
        });
    });
}

// Cache with network update
function actualizaCacheStatico(staticCache, req, APP_SHELL_INMUTABLE) {
  if (APP_SHELL_INMUTABLE.includes(req.url)) {
    // No hace falta actualizar el inmutable
    // console.log('existe en inmutable', req.url );
  } else {
    // console.log('actualizando', req.url );
    return fetch(req)
      .then(res => {
        return actualizaCacheDinamico(staticCache, req, res);
      });
  }
}

// Manejo apis mensajes || network with cache fallback / update
function manejoApiMensajes(cacheName, req) {
  if (req.clone().method === 'POST') {
    // Posteo de un nuevo mensaje
    if (self.registration.sync && !navigator.onLine) {
      return req.clone().text().then(body => {
        // console.log(body);
        const bodyObj = JSON.parse(body)
        // console.log(bodyObj);
        return guardarMensaje(bodyObj)
      })
    } else {
      return fetch(req)
    }
  } else {
    return fetch(req)
      .then(res => {
        if (res.ok) {
          actualizaCacheDinamico(cacheName, req, res.clone());
          return res.clone();
        } else {
          return caches.match(req);
        }
      })
      .catch(err => {
        return caches.match(req);
      });
  }
}





// SERVICE WORKER 

const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'
const INMUTABLE_CACHE = 'inmutable-v1'


const APP_SHELL = [
  '/',
  'index.html'
]

const APP_SHELL_INMUTABLE = [
  'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,300italic,400italic',
  'https://cdn.jsdelivr.net/npm/pouchdb@7.1.1/dist/pouchdb.min.js'
]

self.addEventListener('install', e => {

  const cacheStatic = caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL))
  const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache => cache.addAll(APP_SHELL_INMUTABLE))



  e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
})

self.addEventListener('activate', e => {
  const respuesta = caches.keys().then(keys => {

    keys.forEach(key => {
      if (key !== STATIC_CACHE && key.includes('static')) {
        return caches.delete(key)
      }
      if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
        return caches.delete(key)
      }
    })

  })
  e.waitUntil(respuesta)
})

self.addEventListener('fetch', e => {
  let respuesta
  if (e.request.url.includes('/api')) {

    respuesta = manejoApiMensajes(DYNAMIC_CACHE, e.request)

  } else {
    respuesta = caches.match(e.request).then(res => {
      if (res) {
        actualizaCacheStatico(STATIC_CACHE, e.request, APP_SHELL_INMUTABLE);
        return res;
      } else {
        return fetch(e.request).then(newRes => {
          return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);
        });
      }
    });
  }
  e.respondWith(respuesta);
});

//  tareas asincronas
self.addEventListener('sync', e => {
  console.log('SW : sync');
  if (e.tag === 'nueva-empresa') {
    // postear a BD cuando hay conexion
    const respuesta = postearMensajes()
    e.waitUntil(respuesta)
  }
})
