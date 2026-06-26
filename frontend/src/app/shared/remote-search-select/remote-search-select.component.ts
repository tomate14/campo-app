import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs'

type RemoteItem = object

function unwrapResponse(response: unknown): RemoteItem[] {
  if (Array.isArray(response)) return response as RemoteItem[]
  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as { data?: unknown }).data
    return Array.isArray(data) ? data as RemoteItem[] : []
  }
  return []
}

function normalize(value: unknown) {
  return String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

@Component({
  selector: 'app-remote-search-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './remote-search-select.component.html',
  styleUrl: './remote-search-select.component.css',
})
export class RemoteSearchSelectComponent implements OnInit, OnChanges, OnDestroy {
  private readonly http = inject(HttpClient)
  private readonly destroy$ = new Subject<void>()
  private readonly search$ = new Subject<string>()
  private selectedValue = ''
  private selectedLabel = ''

  @Input() label = ''
  @Input() placeholder = 'Buscar...'
  @Input() endpoint = ''
  @Input() queryParam = 'search'
  @Input() extraParams: Record<string, string | number | boolean> = {}
  @Input() options: RemoteItem[] = []
  @Input() valueField = 'id'
  @Input() labelField = 'label'
  @Input() subtitleFields: string[] = []
  @Input() searchFields: string[] = []
  @Input() allowedValues: Record<string, string[]> = {}
  @Input() limit = 20
  @Input() value: string | null | undefined = ''
  @Input() disabled = false

  @Output() valueChange = new EventEmitter<string>()
  @Output() itemSelected = new EventEmitter<RemoteItem>()

  protected readonly query = signal('')
  protected readonly items = signal<RemoteItem[]>([])
  protected readonly open = signal(false)
  protected readonly loading = signal(false)

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(220), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => this.load(term))
    this.syncLabelFromValue()
    this.load('')
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] || changes['options']) {
      this.syncLabelFromValue()
    }
    if (changes['endpoint'] || changes['extraParams']) {
      this.load(this.query())
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  protected onSearch(value: string) {
    this.query.set(value)
    this.open.set(true)
    this.search$.next(value)
    if (!value) {
      this.valueChange.emit('')
    }
  }

  protected select(item: RemoteItem) {
    const value = String(this.fieldValue(item, this.valueField) ?? '')
    const label = this.itemLabel(item)
    this.selectedValue = value
    this.selectedLabel = label
    this.valueChange.emit(value)
    this.itemSelected.emit(item)
    this.query.set(label)
    this.open.set(false)
  }

  protected clear() {
    this.selectedValue = ''
    this.selectedLabel = ''
    this.valueChange.emit('')
    this.query.set('')
    this.open.set(false)
    this.load('')
  }

  protected itemLabel(item: RemoteItem) {
    return String(this.fieldValue(item, this.labelField) ?? this.fieldValue(item, this.valueField) ?? '')
  }

  protected itemSubtitle(item: RemoteItem) {
    return this.subtitleFields
      .map((field) => this.fieldValue(item, field))
      .filter((value) => value !== undefined && value !== null && value !== '')
      .join(' - ')
  }

  protected load(term: string) {
    if (this.options.length) {
      const items = this.filterItems(this.options, term)
      this.items.set(items)
      this.syncLabelFromItems(items)
      return
    }

    if (!this.endpoint) {
      this.items.set([])
      return
    }

    this.loading.set(true)
    const params = this.buildParams(term)
    this.http.get<unknown>(this.endpoint, { params }).subscribe({
      next: (response) => {
        const items = this.filterItems(unwrapResponse(response), term)
        this.items.set(items)
        this.syncLabelFromItems(items)
        this.loading.set(false)
      },
      error: () => {
        this.items.set([])
        this.loading.set(false)
      },
    })
  }

  private buildParams(term: string) {
    const params: Record<string, string> = {}
    for (const [key, value] of Object.entries(this.extraParams ?? {})) {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = String(value)
      }
    }
    if (term && this.queryParam) {
      params[this.queryParam] = term
    }
    return params
  }

  private filterItems(items: RemoteItem[], term: string) {
    const query = normalize(term)
    const fields = this.searchFields.length ? this.searchFields : [this.labelField, ...this.subtitleFields]
    return items
      .filter((item) => this.matchesAllowedValues(item))
      .filter((item) => {
        if (!query) return true
        return fields.some((field) => normalize(this.fieldValue(item, field)).includes(query))
      })
      .slice(0, this.limit)
  }

  private matchesAllowedValues(item: RemoteItem) {
    return Object.entries(this.allowedValues ?? {}).every(([field, values]) => {
      if (!values.length) return true
      return values.map(normalize).includes(normalize(this.fieldValue(item, field)))
    })
  }

  private syncLabelFromValue() {
    const current = this.value ? String(this.value) : ''
    if (!current) {
      this.query.set('')
      return
    }
    if (this.selectedValue === current && this.selectedLabel) {
      this.query.set(this.selectedLabel)
      return
    }
    const match = [...this.items(), ...this.options].find((item) => String(this.fieldValue(item, this.valueField) ?? '') === current)
    if (match) {
      this.selectedValue = current
      this.selectedLabel = this.itemLabel(match)
    }
    this.query.set(match ? this.itemLabel(match) : current)
  }

  private syncLabelFromItems(items: RemoteItem[]) {
    const current = this.value ? String(this.value) : ''
    if (!current || this.query() !== current) {
      return
    }
    const match = items.find((item) => String(this.fieldValue(item, this.valueField) ?? '') === current)
    if (match) {
      const label = this.itemLabel(match)
      this.selectedValue = current
      this.selectedLabel = label
      this.query.set(label)
    }
  }

  private fieldValue(item: RemoteItem, field: string) {
    return (item as Record<string, unknown>)[field]
  }
}
