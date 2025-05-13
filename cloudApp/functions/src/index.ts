import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

//register
export const ingest = functions.onRequest({ timeoutSeconds: 10 }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Use POST");

  const { deviceId, humidity, co2, temperature, lidar } = req.body;
  const apiKey = req.header("x-api-key");

  if (!deviceId || !apiKey) return res.status(400).send("Missing params");

  // search device
  const devSnap = await db.doc(`devices/${deviceId}`).get();
  if (!devSnap.exists) return res.status(404).send("Device not found");

  if (apiKey !== devSnap.get("deviceSecret")) return res.status(403).send("Bad key");

  await db.collection(`devices/${deviceId}/sensorReadings`).add({
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    humidity,
    co2_concentration: co2,
    temperature,
    lidar_distance: lidar,
  });
  res.send("ok");
});
