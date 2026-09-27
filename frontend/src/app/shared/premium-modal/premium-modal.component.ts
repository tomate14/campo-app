import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

export type ModalBadgeTone = 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'cyan';
export type ModalSize = 'narrow' | 'wide';

/**
 * Modal premium dark SaaS: barra superior con gradiente verde, header con icono,
 * titulo, subtitulo, badge de estado y boton cerrar. Cuerpo y footer por proyeccion.
 *
 * Inputs:
 *  - title / subtitle: textos del header.
 *  - icon: markup interno de un SVG para el badge de icono.
 *  - badge: texto del badge de estado (opcional).
 *  - badgeTone: color del badge ('green'|'blue'|'yellow'|'red'|'purple'|'cyan').
 *  - size: 'narrow' (~560px) | 'wide' (~920px).
 * Output:
 *  - close: se emite al cerrar (boton X, click en backdrop o tecla Escape).
 * Proyeccion:
 *  - <ng-content>: cuerpo del modal.
 *  - <ng-content select="[footer]">: acciones del pie (opcional).
 *
 * Uso: el padre controla la visibilidad con *ngIf; este componente solo emite `close`.
 */
@Component({
  selector: 'app-premium-modal',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './premium-modal.component.html',
  styleUrl: './premium-modal.component.css',
})
export class PremiumModalComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() badge = '';
  @Input() badgeTone: ModalBadgeTone = 'green';
  @Input() size: ModalSize = 'wide';
  @Output() close = new EventEmitter<void>();

  protected emitClose(): void {
    this.close.emit();
  }
}
