/**
 * Projection utilities.
 * The domain model stores positions in Lambert 72 (EPSG:31370) metres.
 * OpenLayers operates in Web Mercator (EPSG:3857). These helpers convert
 * between the two so the rest of the code never touches EPSG:4326 or
 * proj4 directly.
 */

import proj4 from 'proj4';
import { fromLonLat, toLonLat } from 'ol/proj';

const LAMBERT_72_PROJ = '+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.8686,52.2978,-103.7239,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs';

proj4.defs('EPSG:31370', LAMBERT_72_PROJ);

/** Lambert 72 (EPSG:31370) metres → EPSG:3857 map coordinates. */
export function lambertToMap(x: number, y: number): [number, number] {
  const lonLat = proj4('EPSG:31370', 'EPSG:4326', [x, y]) as [number, number];
  return fromLonLat(lonLat) as [number, number];
}

/** EPSG:3857 map coordinates → Lambert 72 (EPSG:31370) metres. */
export function mapToLambert(coord: [number, number]): [number, number] {
  const lonLat = toLonLat(coord) as [number, number];
  return proj4('EPSG:4326', 'EPSG:31370', lonLat) as [number, number];
}
