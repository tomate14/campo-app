import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

export type TileTone = 'default' | 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'cyan';

/**
 * Tile de dato (label pequeno + valor). Reutilizable en fichas, modales y paneles.
 * Inputs:
 *  - label: etiqueta gris.
 *  - value: valor destacado.
 *  - icon: markup interno de un SVG (opcional).
 *  - tone: color de acento del valor/icono.
 */
@Component({
  selector: 'app-info-tile',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './info-tile.component.html',
  styleUrl: './info-tile.component.css',
})
export class InfoTileComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon = '';
  @Input() tone: TileTone = 'default';
}
