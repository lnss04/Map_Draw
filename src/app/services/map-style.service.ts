/**
 * Map Style Service
 * Handles OpenLayers styling: SVG icon creation for poles and levers,
 * and style functions for cantons and temporary drawing lines.
 */

import { Injectable } from '@angular/core';
import Feature from 'ol/Feature';
import { Style, Stroke, Icon, Text, Fill, Circle as CircleStyle } from 'ol/style';
import { GeometryCollection, LineString } from 'ol/geom';
import Point from 'ol/geom/Point';
import { MapStateService } from './map-state.service';

@Injectable({
  providedIn: 'root'
})
export class MapStyleService {

  constructor(private state: MapStateService) {}

  // ============================================================
  // POLE STYLING
  // ============================================================

  /**
   * Creates an SVG rectangle icon for poles with rotation support.
   */
  createPoleSVG(rotation: number, isSelected: boolean): string {
    const width = 12;
    const height = 24;
    const strokeColor = isSelected ? '%23f39c12' : '%23c0392b';
    const fillColor = isSelected ? '%23f1c40f' : '%23ff6b6b';
    const strokeWidth = isSelected ? 3 : 2;
    const halfW = width / 2;
    const halfH = height / 2;
    const lineY = -halfH - 4;

    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-20 -20 40 40">' +
      '<g transform="rotate(' + rotation + ')">' +
        '<rect x="' + (-halfW) + '" y="' + (-halfH) + '" width="' + width + '" height="' + height + '" ' +
              'fill="' + fillColor + '" stroke="' + strokeColor + '" stroke-width="' + strokeWidth + '" rx="2" ry="2"/>' +
        '<line x1="0" y1="' + (-halfH) + '" x2="0" y2="' + lineY + '" ' +
              'stroke="' + strokeColor + '" stroke-width="2" stroke-linecap="round"/>' +
      '</g>' +
    '</svg>';

    return 'data:image/svg+xml,' + svg;
  }

  /**
   * Returns a style for a pole feature.
   */
  getPoleStyle(feature: Feature): Style[] {
    const pole = feature.get('pole');
    const rotation = pole.rotation || 0;
    const isSelected = (this.state.selectedPoleId === pole.id);

    const iconStyle = new Style({
      image: new Icon({
        src: this.createPoleSVG(rotation, isSelected),
        scale: 1,
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction'
      }),
      stroke: new Stroke({
        color: '#ff00dd',
        width: 2
      })
    });

    const intensity = pole.totalConstraint?.intensity ?? 0;
    const labelStyle = new Style({
      geometry: (feat) => {
        const collection = feat.getGeometry() as GeometryCollection;
        const shaft = collection.getGeometries()[1] as LineString;
        return new Point(shaft.getLastCoordinate());
      },
      text: new Text({
        text: intensity.toFixed(0),
        font: 'bold 12px sans-serif',
        offsetX: 10,
        offsetY: -10,
        textAlign: 'left',
        fill: new Fill({ color: '#ff00dd' }),
        stroke: new Stroke({ color: '#ffffff', width: 2 })
      })
    });

    const styles: Style[] = [iconStyle, labelStyle];

    if (intensity > 1.4 * pole.strength) {
      styles.push(new Style({
        geometry: (feat) => {
          const collection = feat.getGeometry() as GeometryCollection;
          return collection.getGeometries()[0] as Point;
        },
        image: new CircleStyle({
          radius: 22,
          stroke: new Stroke({ color: 'rgba(255, 0, 0, 0.5)', width: 3 })
        })
      }));
    }

    return styles;
  }

  // ============================================================
  // LEVER STYLING
  // ============================================================

  /**
   * Creates an SVG for the rotation lever/handle.
   */
  private createLeverSVG(): string {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="-10 -10 20 20">' +
      '<circle cx="0" cy="0" r="8" fill="%23e74c3c" stroke="%23c0392b" stroke-width="2"/>' +
      '<circle cx="0" cy="0" r="4" fill="%23fff"/>' +
    '</svg>';
    return 'data:image/svg+xml,' + svg;
  }

  /**
   * Returns the style for the rotation lever.
   */
  getLeverStyle(): Style {
    return new Style({
      image: new Icon({
        src: this.createLeverSVG(),
        scale: 1,
        anchor: [0.5, 0.5]
      })
    });
  }

  // ============================================================
  // CANTON & TEMP LINE STYLING
  // ============================================================

  /**
   * Returns the style for canton polylines.
   * Highlights the selected canton in remove-canton mode.
   */
  getCantonStyle(feature?: Feature): Style {
    const cantonId = feature?.get('cantonId');
    const isSelected = !!cantonId && cantonId === this.state.selectedCantonId;
    return new Style({
      stroke: new Stroke({
        color: isSelected ? '#e74c3c' : '#3498db',
        width: isSelected ? 5 : 3,
        lineDash: isSelected ? [8, 4] : undefined
      })
    });
  }

  /**
   * Returns the style for temporary drawing lines.
   */
  getTempLineStyle(): Style {
    return new Style({
      stroke: new Stroke({
        color: '#f39c12',
        width: 2,
        lineDash: [10, 10]
      })
    });
  }
}
