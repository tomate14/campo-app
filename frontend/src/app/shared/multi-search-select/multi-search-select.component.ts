import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'

type MultiItem = Record<string, unknown>

function normalize(value: unknown): string {
  return String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/**
 * Feature 84: multiselect con buscador y opción "Todos" (patrón <details> del diseño).
 * Trabaja sobre catálogos en memoria (options). Emite el array de valores seleccionados.
 * selected vacío = "Todos" (sin filtro aplicado).
 */
@Component({
  selector: 'app-multi-search-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multi-search-select.component.html',
  styleUrl: './multi-search-select.component.css',
})
export class MultiSearchSelectComponent {
  @Input() label = ''
  @Input() placeholder = 'Buscar...'
  @Input() allLabel = 'Todos'
  // Acepta cualquier catálogo tipado (object[]); se normaliza a Record internamente.
  @Input() options: readonly object[] = []
  @Input() valueField = 'id'
  @Input() labelField = 'label'
  @Input() metaFields: string[] = []
  @Input() colorField = ''
  @Input() searchFields: string[] = []
  @Input() disabled = false

  @Input() set selected(value: string[] | null | undefined) {
    this.selectedValues.set(value ?? [])
  }

  @Output() selectedChange = new EventEmitter<string[]>()

  protected readonly query = signal('')
  protected readonly selectedValues = signal<string[]>([])

  protected readonly filtered = computed<MultiItem[]>(() => {
    const term = normalize(this.query())
    const items = this.opts()
    if (!term) {
      return items
    }
    const fields = this.searchFields.length ? this.searchFields : [this.labelField, ...this.metaFields]
    return items.filter((item) => fields.some((field) => normalize(item[field]).includes(term)))
  })

  protected readonly allSelected = computed(() => {
    const total = this.opts().length
    return total > 0 && this.selectedValues().length >= total
  })

  protected readonly summaryText = computed(() => {
    const count = this.selectedValues().length
    if (count === 0 || this.allSelected()) {
      return this.allLabel
    }
    if (count === 1) {
      const only = this.optionByValue(this.selectedValues()[0])
      return only ? this.itemLabel(only) : '1 seleccionado'
    }
    return `${count} seleccionados`
  })

  protected itemValue(item: MultiItem): string {
    return String(item[this.valueField] ?? '')
  }

  protected itemLabel(item: MultiItem): string {
    return String(item[this.labelField] ?? item[this.valueField] ?? '')
  }

  protected itemMeta(item: MultiItem): string {
    return this.metaFields
      .map((field) => item[field])
      .filter((value) => value !== undefined && value !== null && value !== '')
      .join(' · ')
  }

  protected itemColor(item: MultiItem): string {
    return this.colorField ? String(item[this.colorField] ?? '') : ''
  }

  protected isChecked(item: MultiItem): boolean {
    return this.selectedValues().includes(this.itemValue(item))
  }

  protected toggle(item: MultiItem): void {
    if (this.disabled) return
    const value = this.itemValue(item)
    const current = this.selectedValues()
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    this.emit(next)
  }

  protected toggleAll(): void {
    if (this.disabled) return
    this.emit(this.allSelected() ? [] : this.opts().map((item) => this.itemValue(item)))
  }

  protected onSearch(value: string): void {
    this.query.set(value)
  }

  private opts(): MultiItem[] {
    return this.options as MultiItem[]
  }

  private optionByValue(value: string): MultiItem | undefined {
    return this.opts().find((item) => this.itemValue(item) === value)
  }

  private emit(values: string[]): void {
    this.selectedValues.set(values)
    this.selectedChange.emit(values)
  }
}
