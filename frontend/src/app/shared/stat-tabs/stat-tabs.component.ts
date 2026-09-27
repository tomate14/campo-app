import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

export interface StatTab {
  id: string;
  label: string;
  /** Markup interno del SVG del icono (opcional). */
  icon?: string;
  /** Badge de conteo opcional (string o number). */
  badge?: string | number;
}

/**
 * Pestanas premium (icono + label + badge de conteo).
 * Inputs:
 *  - tabs: StatTab[] ({ id, label, icon?, badge? }).
 *  - active: id de la pestana activa.
 * Output:
 *  - activeChange: emite el id al cambiar de pestana.
 */
@Component({
  selector: 'app-stat-tabs',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './stat-tabs.component.html',
  styleUrl: './stat-tabs.component.css',
})
export class StatTabsComponent {
  @Input() tabs: StatTab[] = [];
  @Input() active = '';
  @Output() activeChange = new EventEmitter<string>();

  protected select(id: string): void {
    if (id === this.active) return;
    this.active = id;
    this.activeChange.emit(id);
  }
}
