import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

/**
 * Cabecera de pagina premium dark SaaS.
 * Inputs:
 *  - eyebrow: texto pequeno superior en verde (ej. "CAMPO APP · GANADERIA").
 *  - title: titulo grande.
 *  - subtitle: descripcion gris debajo del titulo.
 *  - icon: markup interno de un SVG (opcional) que se muestra en un badge junto al titulo.
 * Proyeccion:
 *  - <ng-content>: botones de accion, alineados a la derecha.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
}
