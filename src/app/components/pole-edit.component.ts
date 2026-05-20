/**
 * Pole Edit Modal Component
 * Displays a modal form to view and edit pole properties.
 */

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { appSettings, PoleType } from "../config/AppSettings";
import { Pole } from '../model/Pole';

@Component({
  selector: 'app-pole-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="edit-overlay" (click)="onBackdropClick($event)">
      <div class="modal-panel modal-dialog modal-dialog-centered" role="dialog" aria-modal="true" aria-labelledby="poleModalTitle">

        <div class="modal-content border-0">

          <!-- Header -->
          <div class="modal-header">
            <div class="modal-title-row d-flex align-items-center">
              <i class="bi bi-geo-alt-fill me-2 text-danger"></i>
              <h5 id="poleModalTitle" class="mb-0">Edit Pole</h5>
            </div>
            <button class="btn-icon" (click)="cancel()" title="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body" *ngIf="draft">

            <!-- Read-only info -->
            <div class="mb-3">
              <label class="form-label text-uppercase small text-secondary fw-semibold">ID</label>
              <div class="form-control form-control-sm field-readonly">{{ draft.id }}</div>
            </div>

            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label text-uppercase small text-secondary fw-semibold">Position X (lon)</label>
                <div class="form-control form-control-sm field-readonly">{{ draft.position.x | number:'1.6-6' }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label text-uppercase small text-secondary fw-semibold">Position Y (lat)</label>
                <div class="form-control form-control-sm field-readonly">{{ draft.position.y | number:'1.6-6' }}</div>
              </div>
            </div>

            <hr class="my-3">

            <!-- Editable fields -->
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label text-uppercase small text-secondary fw-semibold" for="poleType">POLE TYPE</label>
                <select class="form-select form-select-sm"
                  [ngModel]="pole.type"
                  (ngModelChange)="onTypeChange(draft, $event)">
                  <option *ngFor="let type of types" [value]="type.key">{{ type.value }}</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label text-uppercase small text-secondary fw-semibold" for="poleStrength">Strength (kg)</label>
                <input
                  id="poleStrength"
                  type="number"
                  class="form-control form-control-sm"
                  [(ngModel)]="draft.strength"
                  min="1"
                  step="50"
                />
              </div>
              <div class="col-12">
                <label class="form-label text-uppercase small text-secondary fw-semibold" for="poleHeight">Total Height (m)</label>
                <input
                  id="poleHeight"
                  type="number"
                  class="form-control form-control-sm"
                  [(ngModel)]="draft.height"
                  min="1"
                  step="0.5"
                />
              </div>
            </div>

            <div class="row g-3 mt-0">
              <div class="col-12">
                <label class="form-label text-uppercase small text-secondary fw-semibold" for="poleAbove">Above-Ground Height (m)</label>
                <input
                  id="poleAbove"
                  type="number"
                  class="form-control form-control-sm"
                  [(ngModel)]="draft.aboveGroundHeight"
                  min="0"
                  step="0.5"
                />
              </div>
              <div class="col-12">
                <label class="form-label text-uppercase small text-secondary fw-semibold" for="poleRotation">Rotation (°)</label>
                <input
                  id="poleRotation"
                  type="number"
                  class="form-control form-control-sm"
                  [ngModel]="getRotation(draft)"
                  (ngModelChange)="onRotationChange(draft, $event)"
                  min="0"
                  max="359"
                  step="1"
                />
              </div>
            </div>

            <!-- Rotation visual -->
            <div class="rotation-preview mt-3 rounded-3">
              <div class="compass">
                <div class="compass-needle" [style.transform]="'rotate(' + (90 - getRotation(draft)) + 'deg)'"></div>
                <span class="compass-label">90</span>
              </div>
              <span class="rotation-value">{{ getRotation(draft) }}°</span>
            </div>

          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" (click)="cancel()">Cancel</button>
            <button class="btn btn-primary btn-sm" (click)="save()">
              <i class="bi bi-check-lg me-1"></i>Save
            </button>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: []
})
export class PoleEditComponent implements OnInit {
  @Input() pole!: Pole;
  @Output() saved = new EventEmitter<Pole>();
  @Output() cancelled = new EventEmitter<void>();

  draft!: Pole;

  ngOnInit(): void {
    this.draft = { ...this.pole } as Pole;
  }

  get types(): PoleType[] {
    return appSettings.poleTypes;
  }

  save(): void {
    this.saved.emit(this.draft);
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('edit-overlay')) {
      this.cancel();
    }
  }

  getRotation(pole: Pole): number {
    return Math.round(pole.rotation * 180 / Math.PI);
  }

  onRotationChange(pole: Pole, value: number): void {
    pole.rotation = value * Math.PI / 180;
  }

  onTypeChange(pole: Pole, newType: string): void {
    pole.type = newType;
  }
}
