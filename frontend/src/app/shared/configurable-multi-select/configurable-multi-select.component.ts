import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, computed, inject, signal } from '@angular/core';
import { UtilidadesService } from '../../core/services/utilidades.service';
import type { UtilidadOpcion } from '../../core/models/agricola.models';

/**
 * Multi-selección alimentada por una categoría del módulo Utilidades (feature 60),
 * análogo a `configurable-select` (selección única) pero permitiendo marcar/desmarcar
 * varias opciones como chips/checkboxes.
 *
 * Feature 73: se usa para `cultivosAfectados` del catálogo de plagas. En pantalla se
 * muestra el `valor` de cada opción, pero el control bindea/emite un **CSV de ids**
 * (ej. "cult-maiz,cult-sorgo"), que es lo que espera el request del backend.
 *
 * A diferencia del single, no incluye el botón "+" de alta inline: los cultivos se
 * administran desde el módulo Utilidades.
 */
@Component({
  selector: 'app-configurable-multi-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configurable-multi-select.component.html',
  styleUrl: './configurable-multi-select.component.css',
})
export class ConfigurableMultiSelectComponent implements OnInit, OnChanges {
  private readonly utilidadesService = inject(UtilidadesService);

  @Input() categoria = '';
  @Input() label = '';
  /** CSV de ids seleccionados (ej. "cult-maiz,cult-sorgo"). */
  @Input() value: string | null | undefined = '';

  /** Emite el CSV de ids seleccionados, consistente con lo que espera el request. */
  @Output() valueChange = new EventEmitter<string>();

  protected readonly options = signal<UtilidadOpcion[]>([]);
  protected readonly loading = signal(false);
  // Set de ids seleccionados (orden estable al emitir según el orden de `options`).
  protected readonly selectedIds = signal<Set<string>>(new Set());

  // Cantidad seleccionada, para el contador del encabezado.
  protected readonly selectedCount = computed(() => this.selectedIds().size);

  ngOnInit(): void {
    this.selectedIds.set(this.parseCsv(this.value));
    this.loadOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange) {
      this.selectedIds.set(this.parseCsv(this.value));
    }
    if (changes['categoria'] && !changes['categoria'].firstChange) {
      this.loadOptions();
    }
  }

  protected isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  protected toggle(id: string): void {
    const next = new Set(this.selectedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selectedIds.set(next);
    this.emitValue();
  }

  // Convierte un CSV de ids a Set, tolerando espacios y valores vacíos.
  private parseCsv(csv: string | null | undefined): Set<string> {
    if (!csv) {
      return new Set();
    }
    return new Set(
      csv
        .split(',')
        .map((token) => token.trim())
        .filter((token) => token.length > 0),
    );
  }

  // Emite el CSV respetando el orden de las opciones cargadas (estable y legible).
  private emitValue(): void {
    const selected = this.selectedIds();
    const ordered = this.options()
      .map((opcion) => opcion.id)
      .filter((id) => selected.has(id));
    this.valueChange.emit(ordered.join(','));
  }

  private loadOptions(): void {
    if (!this.categoria) {
      this.options.set([]);
      return;
    }

    this.loading.set(true);
    this.utilidadesService.getUtilidadOpciones(this.categoria).subscribe({
      next: (opciones) => {
        this.options.set(opciones);
        this.loading.set(false);
      },
      error: () => {
        this.options.set([]);
        this.loading.set(false);
      },
    });
  }
}
