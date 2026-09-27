import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Primitiva reutilizable para renderizar iconos SVG "line" del lenguaje premium.
 * Recibe el markup interno del SVG (paths, circles, etc.) via `path` y lo envuelve
 * en un <svg viewBox="0 0 24 24"> con stroke=currentColor. El color se hereda del
 * contenedor (usar `color` en el padre). Nunca usar letras/siglas como icono.
 *
 * Los valores de `path` son constantes definidas por el desarrollador (no datos de
 * usuario), por eso se sanitizan con bypassSecurityTrustHtml de forma segura.
 */
@Component({
  selector: 'app-svg-icon',
  standalone: true,
  template: `<svg viewBox="0 0 24 24" [style.width.px]="size" [style.height.px]="size" [innerHTML]="safe"></svg>`,
  styles: [
    `:host { display: inline-flex; }
     svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }`,
  ],
})
export class SvgIconComponent {
  private _path = '';
  protected safe: SafeHtml = '';

  @Input() size = 20;

  @Input()
  set path(value: string) {
    this._path = value ?? '';
    this.safe = this.sanitizer.bypassSecurityTrustHtml(this._path);
  }
  get path(): string {
    return this._path;
  }

  constructor(private readonly sanitizer: DomSanitizer) {}
}
