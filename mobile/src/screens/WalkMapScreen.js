import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { colors, spacing, typography, radius } from '../theme/theme';
import { Card } from '../components/Card';

const { width, height } = Dimensions.get('window');

export default function WalkMapScreen({ route }) {
  const { walk } = route.params || {};
  const [region, setRegion] = useState(null);
  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    if (walk && walk.polyline && walk.polyline.length >= 2) {
      // Converter polyline [lat, lng, lat, lng, ...] para coordenadas
      const coords = [];
      for (let i = 0; i < walk.polyline.length; i += 2) {
        if (i + 1 < walk.polyline.length) {
          coords.push({
            latitude: walk.polyline[i],
            longitude: walk.polyline[i + 1],
          });
        }
      }

      if (coords.length > 0) {
        setCoordinates(coords);

        // Calcular região para mostrar toda a rota
        const lats = coords.map(c => c.latitude);
        const lngs = coords.map(c => c.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const latDelta = (maxLat - minLat) * 1.5 || 0.01;
        const lngDelta = (maxLng - minLng) * 1.5 || 0.01;

        setRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: Math.max(latDelta, 0.01),
          longitudeDelta: Math.max(lngDelta, 0.01),
        });
      } else {
        // Se não houver coordenadas, usar localização padrão
        setRegion({
          latitude: -23.5505,
          longitude: -46.6333,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } else {
      // Localização padrão (São Paulo)
      setRegion({
        latitude: -23.5505,
        longitude: -46.6333,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [walk]);

  if (!region) {
    return (
      <View style={styles.container}>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Carregando mapa...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {coordinates.length > 0 && (
          <>
            <Polyline
              coordinates={coordinates}
              strokeColor={colors.primary}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
            {coordinates.length > 0 && (
              <>
                <Marker
                  coordinate={coordinates[0]}
                  title="Início"
                  pinColor={colors.success}
                />
                <Marker
                  coordinate={coordinates[coordinates.length - 1]}
                  title="Fim"
                  pinColor={colors.danger}
                />
              </>
            )}
          </>
        )}
      </MapView>

      {walk && (
        <View style={styles.infoCard}>
          <Card variant="elevated">
            <View style={styles.infoContent}>
              <View style={styles.infoRow}>
                <Text style={[typography.bodySmall, { color: colors.textMuted }]}>
                  Distância
                </Text>
                <Text style={[typography.h3, { color: colors.primary }]}>
                  {walk.distanceMeters >= 1000
                    ? `${(walk.distanceMeters / 1000).toFixed(2)} km`
                    : `${Math.round(walk.distanceMeters)} m`}
                </Text>
              </View>
              {walk.duration && (
                <View style={styles.infoRow}>
                  <Text style={[typography.bodySmall, { color: colors.textMuted }]}>
                    Duração
                  </Text>
                  <Text style={[typography.body, { color: colors.text }]}>
                    {formatTime(walk.duration)}
                  </Text>
                </View>
              )}
              {walk.startTime && (
                <View style={styles.infoRow}>
                  <Text style={[typography.bodySmall, { color: colors.textMuted }]}>
                    Data
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.text }]}>
                    {new Date(walk.startTime).toLocaleString('pt-BR')}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  map: {
    width: width,
    height: height,
  },
  infoCard: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
  },
  infoContent: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
