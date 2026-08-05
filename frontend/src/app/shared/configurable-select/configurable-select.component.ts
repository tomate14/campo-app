import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UtilidadesService } from '../../core/services/utilidades.service';
import type { UtilidadOpcion } from '../../core/models/agricola.models';

/**
 * Dropdown alimentado por una categoría del módulo Utilidades (feature 60)
 * con un botón "+" para dar de alta una opción nueva inline. El alta refresca
 * la lista y auto-selecciona la opción recién creada.
 *
 * Feature 72: el control bindea/emite el **id** de la opción (no el string
 * `valor`); en pantalla se muestra el `valor`. Así, quien lo consume guarda el id.
 */
@Component({
  selector: 'app-configurable-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configurable-select.component.html',
  styleUrl: './configurable-select.component.css',
})
export class ConfigurableSelectComponent implements OnInit, OnChanges {
  private readonly utilidadesService = inject(UtilidadesService);

  @Input() categoria = '';
  @Input() label = '';
  @Input() value: string | null | undefined = '';
  @Input() placeholder = 'Seleccionar...';

  @Output() valueChange = new EventEmitter<string>();

  protected readonly options = signal<UtilidadOpcion[]>([]);
  protected readonly loading = signal(false);
  protected readonly adding = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected newValue = '';

  ngOnInit(): void {
    this.loadOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoria'] && !changes['categoria'].firstChange) {
      this.loadOptions();
    }
  }

  protected onSelectChange(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
  }

  protected toggleAdd(): void {
    this.adding.update((open) => !open);
    this.error.set(null);
    this.newValue = '';
  }

  protected cancelAdd(): void {
    this.adding.set(false);
    this.error.set(null);
    this.newValue = '';
  }

  protected confirmAdd(): void {
    const valor = this.newValue.trim();
    if (!valor || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.utilidadesService.createUtilidadOpcion({ categoria: this.categoria, valor }).subscribe({
      next: (opcion) => {
        // Refresca la lista y auto-selecciona la opción nueva.
        this.utilidadesService.getUtilidadOpciones(this.categoria).subscribe({
          next: (opciones) => {
            this.options.set(opciones);
            this.saving.set(false);
            this.adding.set(false);
            this.newValue = '';
            this.onSelectChange(opcion.id);
          },
          error: () => this.saving.set(false),
        });
      },
      error: () => {
        this.saving.set(false);
        this.error.set('No se pudo agregar la opción.');
      },
    });
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
