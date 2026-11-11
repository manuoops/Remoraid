import { memo, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';

export interface MunicipalityPoint {
  municipio: string;
  total: number;
  aprovados: number;
  reprovados: number;
  interditados: number;
}

interface MappedMunicipality extends MunicipalityPoint {
  latitude: number;
  longitude: number;
}

interface FuelMapProps {
  points: MunicipalityPoint[];
  selectedMunicipalities: string[];
  onSelectMunicipalities: (municipalities: string[]) => void;
}

const BRAZIL_BOUNDS: L.LatLngBoundsExpression = [[-34, -74], [5.5, -34]];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleUpperCase('pt-BR');

const municipalityCoordinates: Record<string, [number, number]> = {
  'APARECIDA': [-22.8495, -45.2325],
  'ARAPEI': [-22.6738, -44.4486],
  'AREIAS': [-22.5781, -44.6992],
  'BANANAL': [-22.6819, -44.3233],
  'CACHOEIRA PAULISTA': [-22.6665, -45.0154],
  'CACAPAVA': [-23.1008, -45.7069],
  'CANAS': [-22.7008, -45.0534],
  'CARAGUATATUBA': [-23.6203, -45.4132],
  'CAMPOS DO JORDAO': [-22.7394, -45.5918],
  'CRUZEIRO': [-22.5761, -44.9628],
  'CUNHA': [-23.0744, -44.9596],
  'GUARAREMA': [-23.4153, -46.0353],
  'GUARATINGUETA': [-22.8075, -45.1938],
  'IGARATA': [-23.2052, -46.1564],
  'JACAREI': [-23.3053, -45.9658],
  'JAMBEIRO': [-23.2511, -45.6943],
  'LAGOINHA': [-23.0846, -45.1942],
  'LAVRINHAS': [-22.5706, -44.9032],
  'LORENA': [-22.7334, -45.1197],
  'MONTEIRO LOBATO': [-22.9544, -45.8406],
  'MIRIM': [-23.5722, -46.0407],
  'NATIVIDADE DA SERRA': [-23.3711, -45.4466],
  'NAZARE PAULISTA': [-23.1741, -46.3978],
  'PARAIBUNA': [-23.3862, -45.6631],
  'PINDAMONHANGABA': [-22.9246, -45.4613],
  'PIQUETE': [-22.6066, -45.1769],
  'POTIM': [-22.8336, -45.2554],
  'QUELUZ': [-22.5312, -44.7781],
  'ROSEIRA': [-22.8963, -45.3055],
  'SALESOPOLIS': [-23.5305, -45.8461],
  'SANTA BRANCA': [-23.3964, -45.8839],
  'SANTO ANTONIO DO PINHAL': [-22.8274, -45.6636],
  'SAO BENTO DO SAPUCAI': [-22.6842, -45.7316],
  'SAO JOSE DO BARREIRO': [-22.6426, -44.5774],
  'SAO JOSE DOS CAMPOS': [-23.2237, -45.9009],
  'SAO LUIZ DO PARAITINGA': [-23.2228, -45.3108],
  'SILVEIRAS': [-22.6634, -44.8527],
  'TAUBATE': [-23.0203, -45.5553],
  'TREMEMBE': [-22.9584, -45.5497],
  'UBATUBA': [-23.4332, -45.0834],
};

function createPopup(point: MappedMunicipality) {
  const popup = document.createElement('div');
  popup.className = 'fuel-map-popup';

  const title = document.createElement('strong');
  title.textContent = point.municipio;
  popup.append(title);

  const total = document.createElement('span');
  total.textContent = `${point.total.toLocaleString('pt-BR')} bombas verificadas`;
  popup.append(total);

  const approval = document.createElement('span');
  approval.textContent = `${point.total ? ((point.aprovados / point.total) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '0'}% de aprovação`;
  popup.append(approval);

  const issues = document.createElement('span');
  issues.textContent = `${point.reprovados.toLocaleString('pt-BR')} reprovadas · ${point.interditados.toLocaleString('pt-BR')} interditadas`;
  popup.append(issues);

  return popup;
}

function createMarkerIcon(point: MappedMunicipality, selected: boolean) {
  const irregularityRate = point.total ? (point.reprovados + point.interditados) / point.total : 0;
  const statusClass = irregularityRate >= 0.15 ? 'is-high-risk' : irregularityRate >= 0.05 ? 'is-medium-risk' : 'is-low-risk';
  const selectedClass = selected ? ' is-selected' : '';
  const label = point.total >= 10000
    ? `${(point.total / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`
    : point.total.toLocaleString('pt-BR');

  return L.divIcon({
    className: 'fuel-map-marker-wrap',
    html: `<span class="fuel-map-marker ${statusClass}${selectedClass}">${label}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

function FuelMap({ points, selectedMunicipalities, onSelectMunicipalities }: FuelMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markerRef = useRef(new Map<string, L.Marker>());
  const previousSelectionRef = useRef<string[]>([]);
  const selectionCallback = useRef(onSelectMunicipalities);
  useEffect(() => {
    selectionCallback.current = onSelectMunicipalities;
  }, [onSelectMunicipalities]);

  const mappedPoints = useMemo(() => points.flatMap((point) => {
    const coordinates = municipalityCoordinates[normalize(point.municipio)];
    return coordinates ? [{ ...point, latitude: coordinates[0], longitude: coordinates[1] }] : [];
  }), [points]);
  const mappedPointsByName = useMemo(() => new Map(mappedPoints.map((point) => [normalize(point.municipio), point])), [mappedPoints]);

  useEffect(() => {
    if (!mapElement.current) return;

    const map = L.map(mapElement.current, {
      zoomControl: true,
      minZoom: 3,
      maxZoom: 18,
      scrollWheelZoom: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    map.fitBounds(BRAZIL_BOUNDS, { padding: [12, 12] });

    const clusters = L.markerClusterGroup({
      maxClusterRadius: 42,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      iconCreateFunction: (cluster) => L.divIcon({
        className: 'fuel-map-cluster',
        html: `<span class="fuel-map-cluster-count">${cluster.getChildCount()}</span>`,
        iconSize: [46, 46],
      }),
    });
    map.addLayer(clusters);
    mapRef.current = map;
    clusterRef.current = clusters;
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
  }, []);

  useEffect(() => {
    const clusters = clusterRef.current;
    if (!clusters) return;

    const markers = mappedPoints.map((point) => {
      const marker = L.marker([point.latitude, point.longitude], { icon: createMarkerIcon(point, false), title: point.municipio });
      marker.bindPopup(createPopup(point));
      marker.on('click', () => selectionCallback.current([point.municipio]));
      return marker;
    });

    clusters.clearLayers();
    markerRef.current = new Map(mappedPoints.map((point, index) => [normalize(point.municipio), markers[index]]));
    clusters.addLayers(markers);
  }, [mappedPoints]);

  useEffect(() => {
    const selected = new Set(selectedMunicipalities.map(normalize));
    markerRef.current.forEach((marker, municipality) => {
      const point = mappedPointsByName.get(municipality);
      if (point) marker.setIcon(createMarkerIcon(point, selected.has(municipality)));
    });
  }, [mappedPointsByName, selectedMunicipalities]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const selectedPoints = selectedMunicipalities
      .map((municipality) => mappedPointsByName.get(normalize(municipality)))
      .filter((point): point is MappedMunicipality => Boolean(point));
    if (selectedPoints.length === 1) {
      const point = selectedPoints[0];
      map.setView([point.latitude, point.longitude], Math.max(map.getZoom(), 9), { animate: true });
    } else if (selectedPoints.length > 1) {
      const bounds = L.latLngBounds(selectedPoints.map((point) => [point.latitude, point.longitude]));
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 8, animate: true });
    } else if (previousSelectionRef.current.length > 0 && selectedMunicipalities.length === 0) {
      map.fitBounds(BRAZIL_BOUNDS, { padding: [12, 12], animate: true });
    }

    previousSelectionRef.current = selectedMunicipalities;
  }, [mappedPointsByName, selectedMunicipalities]);

  const unmappedCount = points.length - mappedPoints.length;

  return (
    <div className="fuel-map-shell">
      <div className="fuel-map-canvas" ref={mapElement} aria-label="Mapa interativo do Brasil com verificações por município" />
      <div className="fuel-map-legend">
        <span><i className="legend-low" /> Menos irregularidades</span>
        <span><i className="legend-medium" /> Atenção</span>
        <span><i className="legend-high" /> Mais irregularidades</span>
        {unmappedCount > 0 && <span className="fuel-map-unmapped">{unmappedCount} município sem coordenada de referência</span>}
      </div>
    </div>
  );
}

export default memo(FuelMap);
