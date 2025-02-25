import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

interface LocationInfoProps {
  onLocationUpdate: (coords: Location.LocationObjectCoords) => void;
}

export default function LocationInfo({ onLocationUpdate }: LocationInfoProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
          onLocationUpdate(newLocation.coords); // Envia a localização para o `Form`
        }
      );
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  let mapHtml = "<html><body><h1>Loading...</h1></body></html>";
  if (location) {
    const { latitude, longitude } = location.coords;
    mapHtml = `
      <html>
        <head>
          <style>
            #map { height: 100%; width: 100%; }
            body { margin: 0; padding: 0; }
          </style>
          <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
          <script>
            var map = L.map('map').setView([${latitude}, ${longitude}], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            L.marker([${latitude}, ${longitude}]).addTo(map)
              .bindPopup('You are here')
              .openPopup();
          </script>
        </body>
      </html>
    `;
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView style={styles.map} originWhitelist={["*"]} source={{ html: mapHtml }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapContainer: {
    width: "90%",
    height: 300,
    borderWidth: 1,
    borderColor: "#000",
  },
  map: {
    flex: 1,
  },
});
