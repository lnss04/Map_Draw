/**
 * Pole Service
 * Manages pole creation, removal, rendering, and spatial queries.
 */

import { Injectable } from '@angular/core';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Pole } from '../model/Pole';
import { MapStateService } from './map-state.service';
import { MapPersistenceService } from './map-persistence.service';
import { MapStyleService } from './map-style.service';
import { Position } from '../model/Position';
import { GeometryCollection, LineString } from 'ol/geom';
import { Vector } from '../model/Vector';
import { lambertToMap, mapToLambert } from './projection';

const MIN_POLE_DISTANCE_METERS = 0.5; // 50cm minimum distance between poles

@Injectable({
  providedIn: 'root'
})
export class PoleService {

  constructor(
    private state: MapStateService,
    private persistence: MapPersistenceService,
    private style: MapStyleService
  ) {}

  // ============================================================
  // POLE CRUD
  // ============================================================

  /**
   * Adds a new pole at the specified map coordinate.
   * Validates minimum distance from existing poles.
   */
  addPole(coordinate: [number, number]): void {
    const lambert = mapToLambert(coordinate);

    const tooClose = this.state.project.poles.some(pole => {
      const dx = lambert[0] - pole.position.x;
      const dy = lambert[1] - pole.position.y;
      return Math.sqrt(dx * dx + dy * dy) < MIN_POLE_DISTANCE_METERS;
    });

    if (tooClose) {
      this.state.showMessage('error', 'Cannot place pole within 50cm of another pole.');
      return;
    }

    const pole = new Pole(
      this.state.project.getNextPoleId(), 'S', 400, 12, 0, 10,
      new Position(lambert[0], lambert[1], 0)
    );

    this.state.project.poles.push(pole);
    this.renderPole(pole);
    this.persistence.saveState();
    this.state.updateStats();
    this.state.showMessage('success', `Pole added. Total: ${this.state.project.poles.length}`);
  }

  /**
   * Removes the pole with the given id from data and map.
   */
  removePole(poleId: number): void {
    this.state.project.poles = this.state.project.poles.filter(p => p.id !== poleId);
    const feature = this.state.poleSource.getFeatureById(`pole-${poleId}`);
    if (feature) this.state.poleSource.removeFeature(feature as Feature);
    this.state.selectedPoleId = null;
    this.persistence.saveState();
    this.state.updateStats();
    this.state.showMessage('success', 'Pole removed.');
  }

  /**
   * Applies edited pole data and persists.
   */
  updatePole(updated: Pole): void {
    const pole = this.state.project.poles.find(p => p.id === updated.id);

    if (!pole) return;

    pole.strength = updated.strength;
    pole.height = updated.height;
    pole.rotation = updated.rotation;
    pole.aboveGroundHeight = updated.aboveGroundHeight;
    pole.type = updated.type;
    pole.position = updated.position;

    this.recalculate();
    this.persistence.saveState();
    this.state.showMessage('success', 'Pole updated.');
  }

  // ============================================================
  // RENDERING
  // ============================================================

  /**
   * Renders a single pole as a point feature on the map.
   */
  renderPole(pole: Pole): void {
    const poleGeometry = PoleService.getPoleDrawing(pole.position.x, pole.position.y, pole.totalConstraint);

    const feature = new Feature({
      pole: pole, // <= store the whole pole object in the feature
      geometry: poleGeometry
    });

    feature.setId(`pole-${pole.id}`);
    this.state.poleSource.addFeature(feature);
  }

  /**
   * Recomputes span geometry, recalculates all constraints, and redraws every
   * pole arrow. This is the single entry point to call after anything that can
   * change pole positions, span geometry, or line/pole properties.
   */
  recalculate(): void {
    this.style.recomputeSections(this.state.project.getAllSections());
    this.state.project.calc();
    this.redrawAllPoles();
  }

  /**
   * Clears and re-renders every pole feature.
   *
   * The arrow (shaft + tip) is baked into each feature's geometry from the
   * pole's totalConstraint at render time, so simply calling
   * `poleSource.changed()` re-styles but leaves the arrow direction stale.
   * Call this after `project.calc()` so the arrows reflect the new constraints.
   */
  redrawAllPoles(): void {
    this.state.poleSource.clear();
    this.state.project.poles.forEach(pole => this.renderPole(pole));
  }

  static getPoleDrawing(x: number, y: number, totalConstraint: Vector): GeometryCollection {
    const L = 20; // arrow length in metres (Lambert 72)
    const h = 0.25 * L;
    const theta = Math.PI / 6;
    const a = totalConstraint.angle;

    const endX = x + L * Math.cos(a);
    const endY = y + L * Math.sin(a);
    const tip1X = endX - h * Math.cos(a - theta);
    const tip1Y = endY - h * Math.sin(a - theta);
    const tip2X = endX - h * Math.cos(a + theta);
    const tip2Y = endY - h * Math.sin(a + theta);

    return new GeometryCollection([
      new Point(lambertToMap(x, y)),
      new LineString([lambertToMap(x, y), lambertToMap(endX, endY)]),
      new LineString([lambertToMap(endX, endY), lambertToMap(tip1X, tip1Y)]),
      new LineString([lambertToMap(endX, endY), lambertToMap(tip2X, tip2Y)])
    ]);
  }

  // ============================================================
  // SPATIAL QUERIES
  // ============================================================

  /**
   * Finds a pole near the given coordinate (within click tolerance).
   */
  findPoleAtCoordinate(coordinate: [number, number]): Pole | null {
    
    //TODO: replace logic by retrieving the feature at coordinate and getting pole from it
    
    const tolerance = this.state.map.getView().getResolution()! * 10; // 10 pixels tolerance

    for (const pole of this.state.project.poles) {
      const poleCoord = lambertToMap(pole.position.x, pole.position.y);
      const dx = coordinate[0] - poleCoord[0];
      const dy = coordinate[1] - poleCoord[1];
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < tolerance) {
        return pole;
      }
    }
    return null;
  }
}
