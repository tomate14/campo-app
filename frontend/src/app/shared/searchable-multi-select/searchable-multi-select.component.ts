import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UtilidadesService } from '../../core/services/utilidades.service';
import type { UtilidadOpcion } from '../../core/models/agricola.models';

// Normaliza texto para búsqueda insensible a mayúsculas y acentos.
function normalize(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/**
 * Selector múltiple con buscador genérico y reutilizable, alimentado por una
 * categoría del módulo Utilidades (feature 60).
 *
 * Contrato idéntico a `configurable-multi-select` (feature 73): bindea/emite un
 * **CSV de ids** (ej. "cult-maiz,cult-soja"). En pantalla muestra el `valor` de
 * cada opción y emite el `id`, respetando el orden de `options()` al serializar.
 *
 * Diferencia visual: input único con chips compactos adentro + dropdown flotante
 * (position: fixed) con búsqueda que resalta la coincidencia, para no ser
 * recortado por el `overflow` del modal contenedor.
 */
@Component({
  selector: 'app-searchable-multi-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchable-multi-select.component.html',
  styleUrl: './searchable-multi-select.component.css',
})
export class SearchableMultiSelectComponent implements OnInit, OnChanges, OnDestroy {
  private readonly utilidadesService = inject(UtilidadesService);
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input() categoria = '';
  @Input() label = '';
  @Input() placeholder = 'Buscar...';
  /** CSV de ids seleccionados (ej. "cult-maiz,cult-soja"). */
  @Input() value: string | null | undefined = '';
  /** Máximo de chips visibles dentro del input antes de colapsar en "+N". */
  @Input() maxVisibleChips = 4;

  /** Emite el CSV de ids seleccionados, consistente con lo que espera el request. */
  @Output() valueChange = new EventEmitter<string>();

  protected readonly options = signal<UtilidadOpcion[]>([]);
  protected readonly loading = signal(false);
  protected readonly selectedIds = signal<Set<string>>(new Set());
  protected readonly open = signal(false);
  protected readonly query = signal('');

  // Posición del dropdown flotante (fixed), calculada desde el control.
  protected readonly ddTop = signal(0);
  protected readonly ddLeft = signal(0);
  protected readonly ddWidth = signal(0);
  protected readonly ddMaxHeight = signal(320);

  protected readonly selectedCount = computed(() => this.selectedIds().size);

  // Opciones seleccionadas como objetos, ordenadas según options() (para los chips).
  protected readonly selectedOptions = computed(() => {
    const selected = this.selectedIds();
    return this.options().filter((opt) => selected.has(opt.id));
  });
  protected readonly visibleChips = computed(() => this.selectedOptions().slice(0, this.maxVisibleChips));
  protected readonly hiddenCount = computed(() => Math.max(0, this.selectedCount() - this.maxVisibleChips));

  // Opciones filtradas por el texto de búsqueda del dropdown.
  protected readonly filteredOptions = computed(() => {
    const q = normalize(this.query());
    if (!q) return this.options();
    return this.options().filter((opt) => normalize(opt.valor).includes(q));
  });

  // Reposiciona el dropdown flotante ante scroll/resize de cualquier contenedor.
  private readonly reposition = () => {
    if (this.open()) this.positionDropdown();
  };

  ngOnInit(): void {
    this.selectedIds.set(this.parseCsv(this.value));
    this.loadOptions();
    if (typeof window !== 'undefined') {
      // Capture: true para captar scroll dentro del modal (que tiene overflow propio).
      window.addEventListener('scroll', this.reposition, true);
      window.addEventListener('resize', this.reposition);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange) {
      this.selectedIds.set(this.parseCsv(this.value));
    }
    if (changes['categoria'] && !changes['categoria'].firstChange) {
      this.loadOptions();
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.reposition, true);
      window.removeEventListener('resize', this.reposition);
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

  protected remove(id: string): void {
    if (!this.selectedIds().has(id)) return;
    const next = new Set(this.selectedIds());
    next.delete(id);
    this.selectedIds.set(next);
    this.emitValue();
  }

  protected toggleDropdown(): void {
    if (this.open()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  protected openDropdown(): void {
    if (this.open()) return;
    this.query.set('');
    this.positionDropdown();
    this.open.set(true);
    // Enfoca el buscador del dropdown una vez renderizado.
    setTimeout(() => {
      const input = this.host.nativeElement.querySelector('.sms__dd-search input') as HTMLInputElement | null;
      input?.focus();
    });
  }

  protected closeDropdown(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.query.set('');
  }

  protected onQuery(value: string): void {
    this.query.set(value);
  }

  // Divide la etiqueta resaltando la coincidencia del texto de búsqueda.
  protected highlight(label: string): { text: string; hit: boolean }[] {
    const q = this.query().trim();
    if (!q) return [{ text: label, hit: false }];
    const idx = label.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return [{ text: label, hit: false }];
    const end = idx + q.length;
    const parts: { text: string; hit: boolean }[] = [];
    if (idx > 0) parts.push({ text: label.slice(0, idx), hit: false });
    parts.push({ text: label.slice(idx, end), hit: true });
    if (end < label.length) parts.push({ text: label.slice(end), hit: false });
    return parts;
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    const target = event.target as Node | null;
    // El dropdown vive dentro del host aunque sea fixed, así que basta con el host.
    if (target && !this.host.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeDropdown();
  }

  // Calcula la posición fixed del dropdown y decide si abre hacia abajo o arriba.
  private positionDropdown(): void {
    const control = this.host.nativeElement.querySelector('.sms__control') as HTMLElement | null;
    if (!control || typeof window === 'undefined') return;
    const rect = control.getBoundingClientRect();
    const margin = 6;
    const desired = 320;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const below = spaceBelow >= 240 || spaceBelow >= spaceAbove;
    const maxHeight = Math.max(180, Math.min(desired, below ? spaceBelow : spaceAbove));

    this.ddLeft.set(rect.left);
    this.ddWidth.set(rect.width);
    this.ddMaxHeight.set(maxHeight);
    this.ddTop.set(below ? rect.bottom + margin : Math.max(margin, rect.top - margin - maxHeight));
  }

  // Convierte un CSV de ids a Set, tolerando espacios y valores vacíos.
  private parseCsv(csv: string | null | undefined): Set<string> {
    if (!csv) return new Set();
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
