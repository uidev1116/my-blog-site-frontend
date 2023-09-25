import type { Unit, OpenStreetMapUnit } from '@/app/types';

export default function OpenStreetMapUnit({
  align,
  displaySize,
  lat,
  lng,
  zoom,
  message,
  x,
  y,
}: Unit<OpenStreetMapUnit>) {
  return (
    <div className={`column-map-${align} js_notStyle ${displaySize}`}>
      <div
        className="js-open-street-map"
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
