import Leaflet from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

export default function setupOpenStreetMap(item: HTMLElement) {
  if (item.getAttribute('data-already') === 'true') {
    return;
  }
  item.setAttribute('data-already', 'true');

  const multiple = !!item.getAttribute('data-multiple');
  const lat = parseInt(item.getAttribute('data-lat') as string, 10);
  const lng = parseInt(item.getAttribute('data-lng') as string, 10);
  const zoom = parseInt(item.getAttribute('data-zoom') as string, 10);
  const msg = item.getAttribute('data-msg') || '';
  const markers = item.getAttribute('data-markers');
  const messages = item.getAttribute('data-messages') || '';
  const map = Leaflet.map(item).setView([lat, lng], zoom);

  // @ts-ignore
  delete Leaflet.Icon.Default.prototype._getIconUrl;
  Leaflet.Icon.Default.mergeOptions({
    iconUrl: icon.src,
    iconRetinaUrl: icon2x.src,
    shadowUrl: iconShadow.src,
  });

  Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  if (multiple && markers) {
    /**
     * Multiple marker
     */
    const points = markers.split('|');
    const panels = messages.split('[[:split:]]');
    points.forEach((point, i) => {
      const latlng = point.split(',');
      if (latlng.length === 2) {
        const view = Leaflet.marker(
          [parseInt(latlng[0].trim(), 10), parseInt(latlng[1].trim(), 10)],
          {
            draggable: false,
          },
        ).addTo(map);
        if (panels[i]) {
          view.bindPopup(panels[i]);
        }
      }
    });
  } else {
    /**
     * Single marker
     */
    const view = Leaflet.marker(map.getCenter(), {
      draggable: false,
    }).addTo(map);
    if (msg) {
      view.bindPopup(msg);
    }
  }
}
