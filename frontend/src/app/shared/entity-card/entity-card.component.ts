import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type EntityTone = 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'cyan' | 'neutral';

export interface EntityChip {
  label: string;
  tone?: EntityTone;
}

export interface EntityMetric {
  label: string;
  value: string | number;
}

/**
 * Tarjeta de entidad para vistas "Tarjetas" (animal, registro, etc.).
 * Generica via inputs + proyeccion de avatar/icono.
 *
 * Inputs:
 *  - title: titulo grande (ej. caravana).
 *  - subtitle: subtitulo gris (ej. RFID / raza).
 *  - chips: EntityChip[] ({ label, tone? }) — pills de sexo/raza/potrero.
 *  - metrics: EntityMetric[] ({ label, value }) — grilla de metricas.
 *  - badge / badgeTone: badge de estado/riesgo en la esquina superior derecha.
 * Proyeccion:
 *  - <ng-content select="[avatar]">: icono/avatar de la entidad.
 * Output:
 *  - cardClick: al hacer click en la tarjeta.
 */
@Component({
  selector: 'app-entity-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entity-card.component.html',
  styleUrl: './entity-card.component.css',
})
export class EntityCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() chips: EntityChip[] = [];
  @Input() metrics: EntityMetric[] = [];
  @Input() badge = '';
  @Input() badgeTone: EntityTone = 'green';
  @Input() clickable = true;
  @Output() cardClick = new EventEmitter<void>();

  protected onClick(): void {
    if (this.clickable) this.cardClick.emit();
  }
}
