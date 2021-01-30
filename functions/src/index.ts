import * as functions from 'firebase-functions';
import  * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential:admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.json({
      mensaje:'Hello from Firebase!!!'
  });
});
export const gotyRef = functions.https.onRequest(async (request, response) => {
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const juegos =  docsSnap.docs.map(docs => docs.data());
  response.status(200).json(juegos);
});

// Express
const app = express();

app.use(cors({origin:true}));

app.get('/goty',async(req,res)=>{
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const juegos =  docsSnap.docs.map(docs => docs.data());
  res.status(200).json(juegos);
});

app.put('/goty/:id',async(req,res)=>{
   const id = req.params['id'];
   const gotyRef = db.collection('goty').doc(id);
   const gameSnap = await gotyRef.get();
   if(!gameSnap.exists){
     res.status(404).json({
       ok:false,
       mensaje:'No existe un juego con ese id'+id
     })
   }else{
     const before = gameSnap.data()||{votos:0};
     await gotyRef.update({
       votos: before.votos+1
     });
     res.json({
       ok:true,
       mensaje:`Gracias por tu voto a ${before.name}`
     });
   }
});

export const api = functions.https.onRequest(app);