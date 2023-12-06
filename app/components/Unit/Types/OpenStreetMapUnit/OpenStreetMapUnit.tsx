import type { Unit, OpenStreetMapUnit } from '@/app/types';

export default function OpenStreetMapUnit({
  displaySize,
  lat,
  lng,
  zoom,
  message,
  x,
  y,
}: Unit<OpenStreetMapUnit>) {
  return (
    <div className="w-100">
      <div
        className="js-open-street-map max-w-full"
        data-lazy="true"
        data-lat={lat}
        data-lng={lng}
        data-zoom={zoom}
        data-msg={message}
        style={{ width: `${x}px`, height: `${y}px` }}
      ></div>
    </div>
  );
}
