import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type KpiTone = 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'cyan';

/**
 * Tarjeta de KPI premium dark SaaS (icono + label uppercase + valor grande + delta/sub).
 * Inputs:
 *  - label: etiqueta corta (se muestra en mayusculas).
 *  - value: valor grande (string o number).
 *  - sub / delta: texto secundario (ej. "↑ 8.4% vs. mes anterior"). `delta` es alias de `sub`.
 *  - tone: color de acento del icono ('green'|'blue'|'yellow'|'red'|'purple'|'cyan').
 *  - subTone: color del texto sub/delta (por defecto sigue `tone`).
 * Proyeccion:
 *  - <ng-content select="[icon]">: el SVG del icono (usar <svg icon>...</svg>).
 *
 * Grilla sugerida en el contenedor:
 *  display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
 */
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.css',
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() sub = '';
  @Input() tone: KpiTone = 'green';
  @Input() subTone?: KpiTone;

  @Input('delta') set delta(value: string) {
    if (value != null) this.sub = value;
  }

  protected get effectiveSubTone(): KpiTone {
    return this.subTone ?? this.tone;
  }
}
