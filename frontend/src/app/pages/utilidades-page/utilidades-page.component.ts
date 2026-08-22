import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UtilidadesService } from '../../core/services/utilidades.service';
import type { UtilidadOpcion } from '../../core/models/agricola.models';

// Definición de un catálogo administrable desde Utilidades.
interface CatalogoDef {
  categoria: string;
  titulo: string;
  descripcion: string;
}

// Estado en memoria de cada catálogo (feature 60).
interface CatalogoState {
  def: CatalogoDef;
  opciones: UtilidadOpcion[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  nuevo: string;
}

// Catálogos conocidos. Preparado para sumar más categorías en el futuro.
const CATALOGOS: CatalogoDef[] = [
  {
    categoria: 'DESTINO_COSECHA',
    titulo: 'Destino de la cosecha',
    descripcion: 'Destinos disponibles al registrar una cosecha (camión, silo, puerto, etc.).',
  },
  {
    categoria: 'TIPO_PERDIDA_COSECHA',
    titulo: 'Tipo de pérdida',
    descripcion: 'Tipos de pérdida de cosecha (cabezal, cola, etc.).',
  },
  // Feature 71: catálogos configurables para cultivo, plagas e insumos.
  {
    categoria: 'CULTIVO',
    titulo: 'Cultivos',
    descripcion: 'Cultivos disponibles para lotes y detecciones.',
  },
  {
    categoria: 'TIPO_PLAGA',
    titulo: 'Tipo de plaga',
    descripcion: 'Tipos del catálogo de plagas (plaga, enfermedad, maleza).',
  },
  {
    categoria: 'TIPO_INSUMO',
    titulo: 'Tipo de insumo',
    descripcion: 'Tipos de insumo agrícola.',
  },
  {
    categoria: 'UNIDAD_INSUMO',
    titulo: 'Unidad de insumo',
    descripcion: 'Unidades de medida de insumos.',
  },
  // Feature 58: unidad de dosis de las ordenes de aplicacion.
  {
    categoria: 'UNIDAD_DOSIS',
    titulo: 'Unidad de dosis',
    descripcion: 'Unidades de dosis para órdenes de aplicación (l/ha, cc/ha, kg/ha, etc.).',
  },
];

@Component({
  selector: 'app-utilidades-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilidades-page.component.html',
  styleUrl: './utilidades-page.component.css',
})
export class UtilidadesPageComponent implements OnInit {
  private readonly utilidadesService = inject(UtilidadesService);

  protected readonly catalogos = signal<CatalogoState[]>(
    CATALOGOS.map((def) => ({ def, opciones: [], loading: true, saving: false, error: null, nuevo: '' })),
  );

  ngOnInit(): void {
    this.catalogos().forEach((catalogo) => this.loadCatalogo(catalogo.def.categoria));
  }

  protected agregar(categoria: string): void {
    const catalogo = this.find(categoria);
    if (!catalogo) {
      return;
    }

    const valor = catalogo.nuevo.trim();
    if (!valor || catalogo.saving) {
      return;
    }

    this.patch(categoria, { saving: true, error: null });
    this.utilidadesService.createUtilidadOpcion({ categoria, valor }).subscribe({
      next: () => {
        this.patch(categoria, { nuevo: '' });
        this.reloadAfterMutation(categoria);
      },
      error: () => this.patch(categoria, { saving: false, error: 'No se pudo agregar la opción.' }),
    });
  }

  protected eliminar(categoria: string, opcion: UtilidadOpcion): void {
    this.patch(categoria, { error: null });
    this.utilidadesService.deleteUtilidadOpcion(categoria, opcion.id).subscribe({
      next: () => this.reloadAfterMutation(categoria),
      error: () => this.patch(categoria, { error: 'No se pudo eliminar la opción.' }),
    });
  }

  private reloadAfterMutation(categoria: string): void {
    this.utilidadesService.getUtilidadOpciones(categoria).subscribe({
      next: (opciones) => this.patch(categoria, { opciones, saving: false }),
      error: () => this.patch(categoria, { saving: false }),
    });
  }

  private loadCatalogo(categoria: string): void {
    this.patch(categoria, { loading: true, error: null });
    this.utilidadesService.getUtilidadOpciones(categoria).subscribe({
      next: (opciones) => this.patch(categoria, { opciones, loading: false }),
      error: () => this.patch(categoria, { loading: false, error: 'No se pudieron cargar las opciones.' }),
    });
  }

  private find(categoria: string): CatalogoState | undefined {
    return this.catalogos().find((catalogo) => catalogo.def.categoria === categoria);
  }

  private patch(categoria: string, changes: Partial<CatalogoState>): void {
    this.catalogos.update((list) =>
      list.map((catalogo) => (catalogo.def.categoria === categoria ? { ...catalogo, ...changes } : catalogo)),
    );
  }
}
