import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

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
  imports: [CommonModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';

  /** Parte del titulo que va en blanco (todo menos la ultima palabra). */
  protected get titleLead(): string {
    const trimmed = (this.title ?? '').trim();
    const idx = trimmed.lastIndexOf(' ');
    return idx === -1 ? '' : trimmed.slice(0, idx);
  }

  /** Ultima palabra del titulo, resaltada en verde con glow (estilo v4). */
  protected get titleAccent(): string {
    const trimmed = (this.title ?? '').trim();
    const idx = trimmed.lastIndexOf(' ');
    return idx === -1 ? trimmed : trimmed.slice(idx + 1);
  }
}
