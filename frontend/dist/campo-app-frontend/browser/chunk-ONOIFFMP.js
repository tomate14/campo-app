import {
  CommonModule,
  GanaderiaService,
  NgForOf,
  NgIf,
  isPlatformBrowser,
  isPlatformServer
} from "./chunk-SV3RP5J4.js";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Injectable,
  Injector,
  Input,
  NgModule,
  NgZone,
  Output,
  PLATFORM_ID,
  PendingTasks,
  TransferState,
  ViewChild,
  afterEveryRender,
  afterNextRender,
  computed,
  inject,
  input,
  makeStateKey,
  output,
  runInInjectionContext,
  setClassMetadata,
  signal,
  viewChild,
  ɵsetClassDebugInfo,
  ɵɵInheritDefinitionFeature,
  ɵɵNgOnChangesFeature,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵdomElement,
  ɵɵelement,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetInheritedFactory,
  ɵɵnamespaceHTML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵpureFunction1,
  ɵɵpureFunction2,
  ɵɵqueryAdvance,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵviewQuerySignal
} from "./chunk-7WFYPRGM.js";
import {
  __async
} from "./chunk-TXDUYLVM.js";

// node_modules/ng-apexcharts/fesm2022/ng-apexcharts.mjs
var _c0 = ["chart"];
var ChartComponent = class _ChartComponent {
  constructor() {
    this.chart = input(...ngDevMode ? [void 0, {
      debugName: "chart"
    }] : []);
    this.annotations = input(...ngDevMode ? [void 0, {
      debugName: "annotations"
    }] : []);
    this.colors = input(...ngDevMode ? [void 0, {
      debugName: "colors"
    }] : []);
    this.dataLabels = input(...ngDevMode ? [void 0, {
      debugName: "dataLabels"
    }] : []);
    this.series = input(...ngDevMode ? [void 0, {
      debugName: "series"
    }] : []);
    this.stroke = input(...ngDevMode ? [void 0, {
      debugName: "stroke"
    }] : []);
    this.labels = input(...ngDevMode ? [void 0, {
      debugName: "labels"
    }] : []);
    this.legend = input(...ngDevMode ? [void 0, {
      debugName: "legend"
    }] : []);
    this.markers = input(...ngDevMode ? [void 0, {
      debugName: "markers"
    }] : []);
    this.noData = input(...ngDevMode ? [void 0, {
      debugName: "noData"
    }] : []);
    this.parsing = input(...ngDevMode ? [void 0, {
      debugName: "parsing"
    }] : []);
    this.fill = input(...ngDevMode ? [void 0, {
      debugName: "fill"
    }] : []);
    this.tooltip = input(...ngDevMode ? [void 0, {
      debugName: "tooltip"
    }] : []);
    this.plotOptions = input(...ngDevMode ? [void 0, {
      debugName: "plotOptions"
    }] : []);
    this.responsive = input(...ngDevMode ? [void 0, {
      debugName: "responsive"
    }] : []);
    this.xaxis = input(...ngDevMode ? [void 0, {
      debugName: "xaxis"
    }] : []);
    this.yaxis = input(...ngDevMode ? [void 0, {
      debugName: "yaxis"
    }] : []);
    this.forecastDataPoints = input(...ngDevMode ? [void 0, {
      debugName: "forecastDataPoints"
    }] : []);
    this.grid = input(...ngDevMode ? [void 0, {
      debugName: "grid"
    }] : []);
    this.states = input(...ngDevMode ? [void 0, {
      debugName: "states"
    }] : []);
    this.title = input(...ngDevMode ? [void 0, {
      debugName: "title"
    }] : []);
    this.subtitle = input(...ngDevMode ? [void 0, {
      debugName: "subtitle"
    }] : []);
    this.theme = input(...ngDevMode ? [void 0, {
      debugName: "theme"
    }] : []);
    this.autoUpdateSeries = input(true, ...ngDevMode ? [{
      debugName: "autoUpdateSeries"
    }] : []);
    this.chartReady = output();
    this.chartInstance = signal(null, ...ngDevMode ? [{
      debugName: "chartInstance"
    }] : []);
    this.chartElement = viewChild.required("chart");
    this.ngZone = inject(NgZone);
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    this._destroyed = false;
    this._injector = inject(Injector);
    this.waitingForConnectedRef = null;
  }
  ngOnChanges(changes) {
    if (!this.isBrowser) return;
    this.hydrate(changes);
  }
  ngOnDestroy() {
    this.destroy();
    this._destroyed = true;
  }
  /** Determine if the host element is connected to the document */
  get isConnected() {
    return this.chartElement()?.nativeElement.isConnected;
  }
  hydrate(changes) {
    if (this.waitingForConnectedRef) {
      return;
    }
    const shouldUpdateSeries = this.chartInstance() && this.autoUpdateSeries() && Object.keys(changes).filter((c) => c !== "series").length === 0;
    if (shouldUpdateSeries) {
      this.updateSeries(this.series(), true);
      return;
    }
    afterNextRender({
      read: () => this.createElement()
    }, {
      injector: this._injector
    });
  }
  /** @internal Extracted to allow subclasses and tests to swap the ApexCharts bundle. */
  importApexCharts() {
    return import("./chunk-E5BVSKUZ.js");
  }
  createElement() {
    return __async(this, null, function* () {
      const {
        default: ApexCharts
      } = yield this.importApexCharts();
      window.ApexCharts ||= ApexCharts;
      if (this._destroyed) return;
      if (!this.isConnected) {
        this.waitForConnected();
        return;
      }
      const options = {};
      const properties = ["annotations", "chart", "colors", "dataLabels", "series", "stroke", "labels", "legend", "fill", "tooltip", "plotOptions", "responsive", "markers", "noData", "parsing", "xaxis", "yaxis", "forecastDataPoints", "grid", "states", "title", "subtitle", "theme"];
      properties.forEach((property) => {
        const value = this[property]();
        if (value) {
          options[property] = value;
        }
      });
      this.destroy();
      const chartInstance = this.ngZone.runOutsideAngular(() => new ApexCharts(this.chartElement().nativeElement, options));
      this.chartInstance.set(chartInstance);
      this.render();
      this.chartReady.emit({
        chartObj: chartInstance
      });
    });
  }
  render() {
    if (this.isConnected) {
      return this.ngZone.runOutsideAngular(() => this.chartInstance()?.render());
    } else {
      this.waitForConnected();
    }
  }
  updateOptions(options, redrawPaths, animate, updateSyncedCharts) {
    return this.ngZone.runOutsideAngular(() => this.chartInstance()?.updateOptions(options, redrawPaths, animate, updateSyncedCharts));
  }
  updateSeries(newSeries, animate) {
    return this.ngZone.runOutsideAngular(() => this.chartInstance()?.updateSeries(newSeries, animate));
  }
  appendSeries(newSeries, animate) {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.appendSeries(newSeries, animate));
  }
  appendData(newData) {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.appendData(newData));
  }
  highlightSeries(seriesName) {
    return this.ngZone.runOutsideAngular(() => this.chartInstance()?.highlightSeries(seriesName));
  }
  toggleSeries(seriesName) {
    return this.ngZone.runOutsideAngular(() => this.chartInstance()?.toggleSeries(seriesName));
  }
  showSeries(seriesName) {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.showSeries(seriesName));
  }
  hideSeries(seriesName) {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.hideSeries(seriesName));
  }
  resetSeries() {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.resetSeries());
  }
  zoomX(min, max) {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.zoomX(min, max));
  }
  toggleDataPointSelection(seriesIndex, dataPointIndex) {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.toggleDataPointSelection(seriesIndex, dataPointIndex));
  }
  destroy() {
    this.chartInstance()?.destroy();
    this.chartInstance.set(null);
  }
  setLocale(localeName) {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.setLocale(localeName));
  }
  paper() {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.paper());
  }
  addXaxisAnnotation(options, pushToMemory, context) {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.addXaxisAnnotation(options, pushToMemory, context));
  }
  addYaxisAnnotation(options, pushToMemory, context) {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.addYaxisAnnotation(options, pushToMemory, context));
  }
  addPointAnnotation(options, pushToMemory, context) {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.addPointAnnotation(options, pushToMemory, context));
  }
  removeAnnotation(id, options) {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.removeAnnotation(id, options));
  }
  clearAnnotations(options) {
    this.ngZone.runOutsideAngular(() => this.chartInstance()?.clearAnnotations(options));
  }
  dataURI(options) {
    return this.chartInstance()?.dataURI(options);
  }
  waitForConnected() {
    if (this.waitingForConnectedRef) {
      return;
    }
    this.waitingForConnectedRef = afterEveryRender({
      read: () => {
        if (this.isConnected) {
          this.waitingForConnectedRef.destroy();
          this.waitingForConnectedRef = null;
          this.createElement();
        }
      }
    }, {
      injector: this._injector
    });
  }
  static {
    this.\u0275fac = function ChartComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _ChartComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
      type: _ChartComponent,
      selectors: [["apx-chart"]],
      viewQuery: function ChartComponent_Query(rf, ctx) {
        if (rf & 1) {
          \u0275\u0275viewQuerySignal(ctx.chartElement, _c0, 5);
        }
        if (rf & 2) {
          \u0275\u0275queryAdvance();
        }
      },
      inputs: {
        chart: [1, "chart"],
        annotations: [1, "annotations"],
        colors: [1, "colors"],
        dataLabels: [1, "dataLabels"],
        series: [1, "series"],
        stroke: [1, "stroke"],
        labels: [1, "labels"],
        legend: [1, "legend"],
        markers: [1, "markers"],
        noData: [1, "noData"],
        parsing: [1, "parsing"],
        fill: [1, "fill"],
        tooltip: [1, "tooltip"],
        plotOptions: [1, "plotOptions"],
        responsive: [1, "responsive"],
        xaxis: [1, "xaxis"],
        yaxis: [1, "yaxis"],
        forecastDataPoints: [1, "forecastDataPoints"],
        grid: [1, "grid"],
        states: [1, "states"],
        title: [1, "title"],
        subtitle: [1, "subtitle"],
        theme: [1, "theme"],
        autoUpdateSeries: [1, "autoUpdateSeries"]
      },
      outputs: {
        chartReady: "chartReady"
      },
      features: [\u0275\u0275NgOnChangesFeature],
      decls: 2,
      vars: 0,
      consts: [["chart", ""]],
      template: function ChartComponent_Template(rf, ctx) {
        if (rf & 1) {
          \u0275\u0275domElement(0, "div", null, 0);
        }
      },
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChartComponent, [{
    type: Component,
    args: [{
      selector: "apx-chart",
      template: `<div #chart></div>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: true
    }]
  }], null, {
    chart: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "chart",
        required: false
      }]
    }],
    annotations: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "annotations",
        required: false
      }]
    }],
    colors: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "colors",
        required: false
      }]
    }],
    dataLabels: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "dataLabels",
        required: false
      }]
    }],
    series: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "series",
        required: false
      }]
    }],
    stroke: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "stroke",
        required: false
      }]
    }],
    labels: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "labels",
        required: false
      }]
    }],
    legend: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "legend",
        required: false
      }]
    }],
    markers: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "markers",
        required: false
      }]
    }],
    noData: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "noData",
        required: false
      }]
    }],
    parsing: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "parsing",
        required: false
      }]
    }],
    fill: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "fill",
        required: false
      }]
    }],
    tooltip: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "tooltip",
        required: false
      }]
    }],
    plotOptions: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "plotOptions",
        required: false
      }]
    }],
    responsive: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "responsive",
        required: false
      }]
    }],
    xaxis: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "xaxis",
        required: false
      }]
    }],
    yaxis: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "yaxis",
        required: false
      }]
    }],
    forecastDataPoints: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "forecastDataPoints",
        required: false
      }]
    }],
    grid: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "grid",
        required: false
      }]
    }],
    states: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "states",
        required: false
      }]
    }],
    title: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "title",
        required: false
      }]
    }],
    subtitle: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "subtitle",
        required: false
      }]
    }],
    theme: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "theme",
        required: false
      }]
    }],
    autoUpdateSeries: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "autoUpdateSeries",
        required: false
      }]
    }],
    chartReady: [{
      type: Output,
      args: ["chartReady"]
    }],
    chartElement: [{
      type: ViewChild,
      args: ["chart", {
        isSignal: true
      }]
    }]
  });
})();
var ChartCoreComponent = class _ChartCoreComponent extends ChartComponent {
  importApexCharts() {
    return import("./chunk-ECR6PLTW.js");
  }
  static {
    this.\u0275fac = /* @__PURE__ */ (() => {
      let \u0275ChartCoreComponent_BaseFactory;
      return function ChartCoreComponent_Factory(__ngFactoryType__) {
        return (\u0275ChartCoreComponent_BaseFactory || (\u0275ChartCoreComponent_BaseFactory = \u0275\u0275getInheritedFactory(_ChartCoreComponent)))(__ngFactoryType__ || _ChartCoreComponent);
      };
    })();
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
      type: _ChartCoreComponent,
      selectors: [["apx-chart-core"]],
      features: [\u0275\u0275InheritDefinitionFeature],
      decls: 2,
      vars: 0,
      consts: [["chart", ""]],
      template: function ChartCoreComponent_Template(rf, ctx) {
        if (rf & 1) {
          \u0275\u0275domElement(0, "div", null, 0);
        }
      },
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChartCoreComponent, [{
    type: Component,
    args: [{
      selector: "apx-chart-core",
      template: `<div #chart></div>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: true
    }]
  }], null, null);
})();
var ChartSSRService = class _ChartSSRService {
  constructor() {
    this.instanceCounter = 0;
  }
  nextInstanceId() {
    return this.instanceCounter++;
  }
  /** @internal Extracted to allow spying in unit tests without importing actual SSR bundle. */
  importSSRModule() {
    return import("./chunk-N4AMIO7I.js");
  }
  renderToHTML(_0) {
    return __async(this, arguments, function* (options, ssrOptions = {}) {
      const {
        default: ApexCharts
      } = yield this.importSSRModule();
      return ApexCharts.renderToHTML(options, ssrOptions);
    });
  }
  renderToString(_0) {
    return __async(this, arguments, function* (options, ssrOptions = {}) {
      const {
        default: ApexCharts
      } = yield this.importSSRModule();
      return ApexCharts.renderToString(options, ssrOptions);
    });
  }
  static {
    this.\u0275fac = function ChartSSRService_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _ChartSSRService)();
    };
  }
  static {
    this.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
      token: _ChartSSRService,
      factory: _ChartSSRService.\u0275fac,
      providedIn: "root"
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChartSSRService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var ChartSSRComponent = class _ChartSSRComponent {
  constructor(platformId) {
    this.options = input.required(...ngDevMode ? [{
      debugName: "options"
    }] : []);
    this.width = input(400, ...ngDevMode ? [{
      debugName: "width"
    }] : []);
    this.height = input(300, ...ngDevMode ? [{
      debugName: "height"
    }] : []);
    this.chartSSRService = inject(ChartSSRService);
    this.pendingTasks = inject(PendingTasks);
    this.el = inject(ElementRef);
    this.transferState = inject(TransferState);
    this.stateKey = makeStateKey(`apx-chart-ssr-${this.chartSSRService.nextInstanceId()}`);
    this.isServer = isPlatformServer(platformId);
    if (!this.isServer) {
      afterNextRender(() => {
        const host = this.el.nativeElement;
        const html = this.transferState.get(this.stateKey, "");
        this.transferState.remove(this.stateKey);
        if (html) {
          const {
            svgOuter,
            config
          } = JSON.parse(html);
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgOuter, "image/svg+xml");
          const svgEl = document.importNode(svgDoc.documentElement, true);
          const wrapper = document.createElement("div");
          wrapper.className = "apexcharts-ssr-wrapper";
          wrapper.setAttribute("data-apexcharts-hydrate", "");
          if (config) wrapper.setAttribute("data-apexcharts-config", config);
          wrapper.appendChild(svgEl);
          host.innerHTML = "";
          host.appendChild(wrapper);
        }
      });
    }
  }
  ngOnInit() {
    return __async(this, null, function* () {
      if (!this.isServer) return;
      const done = this.pendingTasks.add();
      const ssrOptions = {
        width: this.width(),
        height: this.height()
      };
      try {
        const [html, svgOuter] = yield Promise.all([this.chartSSRService.renderToHTML(this.options(), ssrOptions), this.chartSSRService.renderToString(this.options(), ssrOptions)]);
        const configMatch = html.match(/data-apexcharts-config="([^"]*)"/);
        const config = configMatch?.[1] ?? "";
        this.transferState.set(this.stateKey, JSON.stringify({
          svgOuter,
          config
        }));
        this.el.nativeElement.innerHTML = html;
      } finally {
        done();
      }
    });
  }
  static {
    this.\u0275fac = function ChartSSRComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _ChartSSRComponent)(\u0275\u0275directiveInject(PLATFORM_ID));
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
      type: _ChartSSRComponent,
      selectors: [["apx-chart-ssr"]],
      hostAttrs: ["ngSkipHydration", "true"],
      inputs: {
        options: [1, "options"],
        width: [1, "width"],
        height: [1, "height"]
      },
      decls: 0,
      vars: 0,
      template: function ChartSSRComponent_Template(rf, ctx) {
      },
      encapsulation: 2
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChartSSRComponent, [{
    type: Component,
    args: [{
      selector: "apx-chart-ssr",
      template: ``,
      standalone: true,
      host: {
        ngSkipHydration: "true"
      }
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }], {
    options: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "options",
        required: true
      }]
    }],
    width: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "width",
        required: false
      }]
    }],
    height: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "height",
        required: false
      }]
    }]
  });
})();
var ChartHydrateComponent = class _ChartHydrateComponent {
  constructor(platformId) {
    this.clientOptions = input({}, ...ngDevMode ? [{
      debugName: "clientOptions"
    }] : []);
    this.el = inject(ElementRef);
    this.ngZone = inject(NgZone);
    this.injector = inject(Injector);
    this.chartObj = null;
    this.isBrowser = isPlatformBrowser(platformId);
  }
  ngOnInit() {
    if (!this.isBrowser) return;
    runInInjectionContext(this.injector, () => afterNextRender(() => __async(this, null, function* () {
      const host = this.el.nativeElement;
      const ssrEl = host.parentElement?.querySelector("[data-apexcharts-hydrate]");
      if (!ssrEl) {
        console.warn("[ng-apexcharts] ChartHydrateComponent: No [data-apexcharts-hydrate] element found. Ensure <apx-chart-ssr> precedes <apx-chart-hydrate> in the same container.");
        return;
      }
      const {
        default: ApexCharts
      } = yield this.importClientModule();
      try {
        this.chartObj = this.ngZone.runOutsideAngular(() => ApexCharts.hydrate(ssrEl, this.clientOptions()));
      } catch (error) {
        console.error("[ng-apexcharts] ChartHydrateComponent: Failed to hydrate chart.", error);
      }
    })));
  }
  /** @internal Extracted to allow spying in unit tests without importing actual SSR/hydrate bundle. */
  importClientModule() {
    return import("./chunk-N4AMIO7I.js");
  }
  ngOnDestroy() {
    this.chartObj?.destroy();
    this.chartObj = null;
  }
  static {
    this.\u0275fac = function ChartHydrateComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _ChartHydrateComponent)(\u0275\u0275directiveInject(PLATFORM_ID));
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
      type: _ChartHydrateComponent,
      selectors: [["apx-chart-hydrate"]],
      inputs: {
        clientOptions: [1, "clientOptions"]
      },
      decls: 0,
      vars: 0,
      template: function ChartHydrateComponent_Template(rf, ctx) {
      },
      encapsulation: 2
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChartHydrateComponent, [{
    type: Component,
    args: [{
      selector: "apx-chart-hydrate",
      template: ``,
      standalone: true
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }], {
    clientOptions: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "clientOptions",
        required: false
      }]
    }]
  });
})();
var declarations = [ChartComponent, ChartCoreComponent, ChartSSRComponent, ChartHydrateComponent];
var NgApexchartsModule = class _NgApexchartsModule {
  static {
    this.\u0275fac = function NgApexchartsModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _NgApexchartsModule)();
    };
  }
  static {
    this.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
      type: _NgApexchartsModule,
      imports: [ChartComponent, ChartCoreComponent, ChartSSRComponent, ChartHydrateComponent],
      exports: [ChartComponent, ChartCoreComponent, ChartSSRComponent, ChartHydrateComponent]
    });
  }
  static {
    this.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({});
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgApexchartsModule, [{
    type: NgModule,
    args: [{
      imports: [declarations],
      exports: [declarations]
    }]
  }], null, null);
})();

// src/app/pages/reportes-ganaderia-page/reportes-ganaderia-page.component.ts
var _c02 = () => ({ colors: "#A6B0CF", fontSize: "10px" });
var _c1 = (a0) => ({ style: a0 });
var _c2 = (a0, a1) => ({ categories: a0, labels: a1 });
var _c3 = () => ({ colors: "#FFFFFF", fontSize: "11px" });
var _c4 = (a0) => ({ labels: a0 });
var _c5 = () => ["#9FE870"];
var _c6 = () => ({ color: "#A6B0CF", fontSize: "10px" });
var _c7 = (a0) => ({ text: "Cantidad", style: a0 });
var _c8 = (a0, a1) => ({ labels: a0, title: a1 });
var _c9 = () => ["#9A7DFF"];
var _c10 = () => ({ show: false });
var _c11 = () => ({ colors: "#A6B0CF" });
function ReportesGanaderiaPageComponent_div_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21);
    \u0275\u0275text(1, "Cargando indicadores ganaderos...");
    \u0275\u0275elementEnd();
  }
}
function ReportesGanaderiaPageComponent_div_31_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 22);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.error());
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 5);
    \u0275\u0275element(1, "path", 44)(2, "path", 45)(3, "path", 46)(4, "path", 47);
    \u0275\u0275elementEnd();
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 5);
    \u0275\u0275element(1, "path", 86)(2, "path", 87)(3, "path", 88);
    \u0275\u0275elementEnd();
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 5);
    \u0275\u0275element(1, "path", 14)(2, "path", 89)(3, "path", 90);
    \u0275\u0275elementEnd();
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 5);
    \u0275\u0275element(1, "path", 91)(2, "path", 92)(3, "path", 93);
    \u0275\u0275elementEnd();
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 5);
    \u0275\u0275element(1, "path", 94)(2, "path", 95)(3, "path", 96)(4, "path", 12)(5, "path", 97);
    \u0275\u0275elementEnd();
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 5);
    \u0275\u0275element(1, "path", 98)(2, "path", 99)(3, "path", 100)(4, "path", 101);
    \u0275\u0275elementEnd();
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 5);
    \u0275\u0275element(1, "path", 53)(2, "path", 54)(3, "path", 55);
    \u0275\u0275elementEnd();
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 5);
    \u0275\u0275element(1, "path", 102)(2, "path", 103)(3, "path", 104);
    \u0275\u0275elementEnd();
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 5);
    \u0275\u0275element(1, "path", 105)(2, "path", 106)(3, "path", 107);
    \u0275\u0275elementEnd();
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 5);
    \u0275\u0275element(1, "path", 108)(2, "path", 109);
    \u0275\u0275elementEnd();
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_article_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "article", 82)(1, "div", 83);
    \u0275\u0275template(2, ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_2_Template, 5, 0, "svg", 84)(3, ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_3_Template, 4, 0, "svg", 84)(4, ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_4_Template, 4, 0, "svg", 84)(5, ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_5_Template, 4, 0, "svg", 84)(6, ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_6_Template, 6, 0, "svg", 84)(7, ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_7_Template, 5, 0, "svg", 84)(8, ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_8_Template, 4, 0, "svg", 84)(9, ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_9_Template, 4, 0, "svg", 84)(10, ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_10_Template, 4, 0, "svg", 84)(11, ReportesGanaderiaPageComponent_ng_container_32_article_2__svg_svg_11_Template, 3, 0, "svg", 84);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "div", 85)(13, "span");
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "small");
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "strong");
    \u0275\u0275text(18);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const kpi_r2 = ctx.$implicit;
    \u0275\u0275classMap("kpi-card tone-" + kpi_r2.tono);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", kpi_r2.codigo === "ANIMALES_ACTIVOS");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", kpi_r2.codigo === "PESO_PROMEDIO");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", kpi_r2.codigo === "GANANCIA_DIARIA");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", kpi_r2.codigo === "PRENADAS_ACTIVAS");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", kpi_r2.codigo === "PARTOS_PROXIMOS");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", kpi_r2.codigo === "VACUNAS_PROXIMAS");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", kpi_r2.codigo === "ALERTAS_SANITARIAS");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", kpi_r2.codigo === "OCUPACION_POTREROS");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", kpi_r2.codigo === "DIETAS_ACTIVAS");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", kpi_r2.codigo === "SIN_UBICACION");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(kpi_r2.titulo);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(kpi_r2.subtitulo);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(kpi_r2.valor);
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_div_31_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 110)(1, "span", 111);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "strong");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "strong");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div", 112);
    \u0275\u0275element(8, "i");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "small");
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const item_r3 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r3.nombre);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r3.cargaActual);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r3.capacidad);
    \u0275\u0275advance();
    \u0275\u0275classMap(ctx_r0.progressTone(item_r3.porcentaje));
    \u0275\u0275advance();
    \u0275\u0275styleProp("width", ctx_r0.progressWidth(item_r3.porcentaje));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", item_r3.porcentaje, "%");
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_div_48_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 113)(1, "strong");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 114);
    \u0275\u0275element(4, "i");
    \u0275\u0275elementStart(5, "b");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 115);
    \u0275\u0275element(8, "i");
    \u0275\u0275elementStart(9, "b");
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "div", 116);
    \u0275\u0275element(12, "i");
    \u0275\u0275elementStart(13, "b");
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const item_r4 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r4.vacuna);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", ctx_r0.sanitaryWidth(item_r4.vencidas, "vencidas"));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r4.vencidas);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", ctx_r0.sanitaryWidth(item_r4.proximas, "proximas"));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r4.proximas);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", ctx_r0.sanitaryWidth(item_r4.programadas, "programadas"));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r4.programadas);
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_div_115_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 117)(1, "span", 118);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 119);
    \u0275\u0275element(4, "i");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "strong");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "small");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const item_r5 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r5.label);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", item_r5.width)("background", item_r5.color);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r5.value);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", item_r5.percent, "%");
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_span_135_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275element(1, "i");
    \u0275\u0275elementStart(2, "em");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "strong");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const item_r6 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275styleProp("background", item_r6.color);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r6.label);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r6.value);
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_div_167_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 120)(1, "span", 121);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(2, "svg", 5);
    \u0275\u0275element(3, "path", 105)(4, "path", 106)(5, "path", 107);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(6, "div")(7, "strong");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "small");
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const dieta_r7 = ctx.$implicit;
    const i_r8 = ctx.index;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275styleProp("color", ctx_r0.serieColor(i_r8));
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(dieta_r7.nombre);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", dieta_r7.tipoAnimal, " \xB7 ", dieta_r7.materiaSecaKg || 0, " kg MS");
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_div_179_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 122);
    \u0275\u0275element(1, "i");
    \u0275\u0275elementStart(2, "div")(3, "strong");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "small");
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "time");
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const alert_r9 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classMap(alert_r9.prioridad.toLowerCase());
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(alert_r9.titulo);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(alert_r9.detalle);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(alert_r9.tipo);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.formatDateTime(alert_r9.fechaGeneracion));
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_div_180_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 123);
    \u0275\u0275text(1, "No hay alertas operativas vigentes.");
    \u0275\u0275elementEnd();
  }
}
function ReportesGanaderiaPageComponent_ng_container_32_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275elementStart(1, "section", 23);
    \u0275\u0275template(2, ReportesGanaderiaPageComponent_ng_container_32_article_2_Template, 19, 15, "article", 24);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "section", 25)(4, "article", 26)(5, "div", 27)(6, "div")(7, "h2");
    \u0275\u0275text(8, "Distribuci?n del Rodeo");
    \u0275\u0275elementEnd()()();
    \u0275\u0275element(9, "apx-chart", 28);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "article", 26)(11, "div", 27)(12, "div")(13, "h2");
    \u0275\u0275text(14, "Animales por Potrero");
    \u0275\u0275elementEnd()()();
    \u0275\u0275element(15, "apx-chart", 29);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "article", 30)(17, "div", 27)(18, "div")(19, "h2");
    \u0275\u0275text(20, "Ocupaci?n de Potreros");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(21, "div", 31)(22, "span");
    \u0275\u0275text(23, "Potrero");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "span");
    \u0275\u0275text(25, "Carga actual");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "span");
    \u0275\u0275text(27, "Capacidad");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "span");
    \u0275\u0275text(29, "Ocupaci?n");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "div", 32);
    \u0275\u0275template(31, ReportesGanaderiaPageComponent_ng_container_32_div_31_Template, 11, 8, "div", 33);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(32, "section", 34)(33, "article", 35)(34, "div", 27)(35, "div")(36, "h2");
    \u0275\u0275text(37, "Calendario Sanitario");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(38, "div", 36)(39, "span");
    \u0275\u0275text(40, "Vacuna");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(41, "span");
    \u0275\u0275text(42, "Vencidas");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(43, "span");
    \u0275\u0275text(44, "Proximas (30 dias)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(45, "span");
    \u0275\u0275text(46, "Programadas");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(47, "div", 37);
    \u0275\u0275template(48, ReportesGanaderiaPageComponent_ng_container_32_div_48_Template, 15, 10, "div", 38);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(49, "div", 39)(50, "span");
    \u0275\u0275text(51, "Hoy");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(52, "span");
    \u0275\u0275text(53, "15 dias");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(54, "span");
    \u0275\u0275text(55, "30 dias");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(56, "span");
    \u0275\u0275text(57, "60 dias");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(58, "article", 26)(59, "div", 27)(60, "div")(61, "h2");
    \u0275\u0275text(62, "Diagnosticos por Severidad");
    \u0275\u0275elementEnd()()();
    \u0275\u0275element(63, "apx-chart", 28);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(64, "article", 40)(65, "div", 27)(66, "div")(67, "h2");
    \u0275\u0275text(68, "Tratamientos Activos");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(69, "div", 41)(70, "div", 42)(71, "span", 43);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(72, "svg", 5);
    \u0275\u0275element(73, "path", 44)(74, "path", 45)(75, "path", 46)(76, "path", 47);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(77, "span");
    \u0275\u0275text(78, "Animales en tratamiento");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(79, "strong");
    \u0275\u0275text(80);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(81, "div", 48)(82, "span", 43);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(83, "svg", 5);
    \u0275\u0275element(84, "path", 49)(85, "path", 50)(86, "path", 51);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(87, "span");
    \u0275\u0275text(88, "Diagnosticos abiertos");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(89, "strong");
    \u0275\u0275text(90);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(91, "div", 52)(92, "span", 43);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(93, "svg", 5);
    \u0275\u0275element(94, "path", 53)(95, "path", 54)(96, "path", 55);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(97, "span");
    \u0275\u0275text(98, "Criticos");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(99, "strong");
    \u0275\u0275text(100);
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(101, "section", 56)(102, "article", 57)(103, "div", 27)(104, "div")(105, "h2");
    \u0275\u0275text(106, "Estado Reproductivo");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(107, "div", 58)(108, "span");
    \u0275\u0275text(109, "Estado");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(110, "span");
    \u0275\u0275text(111, "Animales");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(112, "span");
    \u0275\u0275text(113, "%");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(114, "div", 59);
    \u0275\u0275template(115, ReportesGanaderiaPageComponent_ng_container_32_div_115_Template, 9, 7, "div", 60);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(116, "article", 61)(117, "div", 27)(118, "div")(119, "h2");
    \u0275\u0275text(120, "Partos Estimados por Mes");
    \u0275\u0275elementEnd()()();
    \u0275\u0275element(121, "apx-chart", 62);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(122, "article", 63)(123, "div", 27)(124, "div")(125, "h2");
    \u0275\u0275text(126, "Genealogia y Trazabilidad");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(127, "div", 64)(128, "div", 65)(129, "div")(130, "strong");
    \u0275\u0275text(131);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(132, "span");
    \u0275\u0275text(133, "Con genealogia completa");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(134, "div", 66);
    \u0275\u0275template(135, ReportesGanaderiaPageComponent_ng_container_32_span_135_Template, 6, 4, "span", 67);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(136, "section", 68)(137, "article", 69)(138, "div", 27)(139, "div")(140, "span");
    \u0275\u0275text(141, "Alimentaci\xF3n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(142, "h2");
    \u0275\u0275text(143, "Consumo de alimento por potrero");
    \u0275\u0275elementEnd()()();
    \u0275\u0275element(144, "apx-chart", 70);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(145, "article", 71)(146, "div", 27)(147, "div")(148, "span");
    \u0275\u0275text(149, "Eficiencia");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(150, "h2");
    \u0275\u0275text(151, "Conversi\xF3n Alimenticia");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(152, "div", 72)(153, "strong");
    \u0275\u0275text(154);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(155, "span");
    \u0275\u0275text(156);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(157, "article", 73)(158, "div", 27)(159, "div")(160, "span");
    \u0275\u0275text(161, "Nutrici\xF3n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(162, "h2");
    \u0275\u0275text(163, "Dietas Activas");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(164, "span", 74);
    \u0275\u0275text(165);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(166, "div", 75);
    \u0275\u0275template(167, ReportesGanaderiaPageComponent_ng_container_32_div_167_Template, 11, 5, "div", 76);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(168, "section", 77)(169, "article", 78)(170, "div", 27)(171, "div")(172, "span");
    \u0275\u0275text(173, "Operaci\xF3n");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(174, "h2");
    \u0275\u0275text(175, "Alertas Operativas");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(176, "span", 74);
    \u0275\u0275text(177);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(178, "div", 79);
    \u0275\u0275template(179, ReportesGanaderiaPageComponent_ng_container_32_div_179_Template, 11, 6, "div", 80)(180, ReportesGanaderiaPageComponent_ng_container_32_div_180_Template, 2, 0, "div", 81);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const data_r10 = ctx.ngIf;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r0.kpis())("ngForTrackBy", ctx_r0.trackByCode);
    \u0275\u0275advance(7);
    \u0275\u0275property("series", ctx_r0.donutSeries(data_r10.distribucionRodeo))("chart", ctx_r0.compactDonutChart)("labels", ctx_r0.donutLabels(data_r10.distribucionRodeo))("colors", ctx_r0.chartColors(data_r10.distribucionRodeo))("plotOptions", ctx_r0.livestockDonutPlotOptions)("dataLabels", ctx_r0.dataLabelsOff)("legend", ctx_r0.compactLegend)("tooltip", ctx_r0.donutTooltip("Rodeo", "Dashboard ganadero", data_r10.distribucionRodeo));
    \u0275\u0275advance(6);
    \u0275\u0275property("series", ctx_r0.barSeries(data_r10.animalesPorPotrero))("chart", ctx_r0.horizontalBarChart)("xaxis", \u0275\u0275pureFunction2(68, _c2, ctx_r0.barCategories(data_r10.animalesPorPotrero), \u0275\u0275pureFunction1(66, _c1, \u0275\u0275pureFunction0(65, _c02))))("yaxis", \u0275\u0275pureFunction1(74, _c4, \u0275\u0275pureFunction1(72, _c1, \u0275\u0275pureFunction0(71, _c3))))("colors", \u0275\u0275pureFunction0(76, _c5))("plotOptions", ctx_r0.horizontalBarPlotOptions)("dataLabels", ctx_r0.horizontalBarDataLabels)("grid", ctx_r0.compactGrid)("tooltip", ctx_r0.barTooltip("Animales", "Animales por potrero", "animales", false));
    \u0275\u0275advance(16);
    \u0275\u0275property("ngForOf", data_r10.ocupacionPotreros);
    \u0275\u0275advance(17);
    \u0275\u0275property("ngForOf", data_r10.calendarioSanitario);
    \u0275\u0275advance(15);
    \u0275\u0275property("series", ctx_r0.donutSeries(data_r10.diagnosticosPorSeveridad))("chart", ctx_r0.compactDonutChart)("labels", ctx_r0.donutLabels(data_r10.diagnosticosPorSeveridad))("colors", ctx_r0.chartColors(data_r10.diagnosticosPorSeveridad))("plotOptions", ctx_r0.livestockDonutPlotOptions)("dataLabels", ctx_r0.dataLabelsOff)("legend", ctx_r0.compactLegend)("tooltip", ctx_r0.donutTooltip("Sanidad", "Severidad de diagnosticos", data_r10.diagnosticosPorSeveridad));
    \u0275\u0275advance(17);
    \u0275\u0275textInterpolate(data_r10.tratamientosActivos.animalesEnTratamiento);
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate(data_r10.tratamientosActivos.diagnosticosAbiertos);
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate(data_r10.tratamientosActivos.casosCriticos);
    \u0275\u0275advance(15);
    \u0275\u0275property("ngForOf", ctx_r0.reproductiveItems(data_r10));
    \u0275\u0275advance(6);
    \u0275\u0275property("series", ctx_r0.lineSeries(data_r10.partosEstimadosPorMes, "Partos estimados"))("chart", ctx_r0.areaChart)("xaxis", \u0275\u0275pureFunction2(80, _c2, ctx_r0.categories(data_r10.partosEstimadosPorMes), \u0275\u0275pureFunction1(78, _c1, \u0275\u0275pureFunction0(77, _c02))))("yaxis", \u0275\u0275pureFunction2(89, _c8, \u0275\u0275pureFunction1(84, _c1, \u0275\u0275pureFunction0(83, _c02)), \u0275\u0275pureFunction1(87, _c7, \u0275\u0275pureFunction0(86, _c6))))("colors", \u0275\u0275pureFunction0(92, _c9))("stroke", ctx_r0.strokeLine)("fill", ctx_r0.areaFill)("dataLabels", ctx_r0.areaDataLabels)("grid", ctx_r0.compactGrid)("legend", \u0275\u0275pureFunction0(93, _c10))("tooltip", ctx_r0.lineTooltip("Partos", "Partos estimados por mes", "partos", false));
    \u0275\u0275advance(7);
    \u0275\u0275styleProp("--value", data_r10.genealogiaTrazabilidad.porcentajeCompleta);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", data_r10.genealogiaTrazabilidad.porcentajeCompleta, "%");
    \u0275\u0275advance(4);
    \u0275\u0275property("ngForOf", ctx_r0.genealogyGapItems(data_r10));
    \u0275\u0275advance(9);
    \u0275\u0275property("series", ctx_r0.multiLineSeries(data_r10.consumoAlimentoPorPotrero))("chart", ctx_r0.lineChart)("xaxis", \u0275\u0275pureFunction2(97, _c2, ctx_r0.categoriesFromSeries(data_r10.consumoAlimentoPorPotrero), \u0275\u0275pureFunction1(95, _c1, \u0275\u0275pureFunction0(94, _c11))))("yaxis", \u0275\u0275pureFunction1(103, _c4, \u0275\u0275pureFunction1(101, _c1, \u0275\u0275pureFunction0(100, _c11))))("colors", ctx_r0.chartColors())("stroke", ctx_r0.strokeLine)("dataLabels", ctx_r0.dataLabelsOff)("grid", ctx_r0.grid)("legend", ctx_r0.legend)("tooltip", ctx_r0.lineTooltip("Alimento", "Consumo por potrero", "kg", false));
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate1("", data_r10.conversionAlimenticia.valor, " : 1");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(data_r10.conversionAlimenticia.unidad);
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate(data_r10.dietasActivas.length);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", data_r10.dietasActivas);
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate1("\xDAltima actualizaci\xF3n: ", ctx_r0.formatDateTime(data_r10.ultimaActualizacion));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", data_r10.alertasOperativas);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !data_r10.alertasOperativas.length);
  }
}
var ReportesGanaderiaPageComponent = class _ReportesGanaderiaPageComponent {
  ganaderiaService = inject(GanaderiaService);
  dashboard = signal(null, ...ngDevMode ? [{ debugName: "dashboard" }] : (
    /* istanbul ignore next */
    []
  ));
  loading = signal(true, ...ngDevMode ? [{ debugName: "loading" }] : (
    /* istanbul ignore next */
    []
  ));
  error = signal(null, ...ngDevMode ? [{ debugName: "error" }] : (
    /* istanbul ignore next */
    []
  ));
  kpis = computed(() => this.dashboard()?.kpis ?? [], ...ngDevMode ? [{ debugName: "kpis" }] : (
    /* istanbul ignore next */
    []
  ));
  lineChart = {
    type: "line",
    height: 250,
    toolbar: { show: false },
    zoom: { enabled: false },
    foreColor: "#A6B0CF",
    background: "transparent"
  };
  areaChart = {
    type: "area",
    height: 220,
    toolbar: { show: false },
    zoom: { enabled: false },
    foreColor: "#A6B0CF",
    background: "transparent"
  };
  donutChart = {
    type: "donut",
    height: 270,
    toolbar: { show: false },
    foreColor: "#A6B0CF",
    background: "transparent"
  };
  compactDonutChart = {
    type: "donut",
    height: 205,
    toolbar: { show: false },
    foreColor: "#A6B0CF",
    background: "transparent"
  };
  barChart = {
    type: "bar",
    height: 280,
    toolbar: { show: false },
    foreColor: "#A6B0CF",
    background: "transparent"
  };
  horizontalBarChart = {
    type: "bar",
    height: 205,
    toolbar: { show: false },
    foreColor: "#A6B0CF",
    background: "transparent"
  };
  gaugeChart = {
    type: "radialBar",
    height: 270,
    toolbar: { show: false },
    foreColor: "#A6B0CF",
    background: "transparent"
  };
  compactGaugeChart = {
    type: "radialBar",
    height: 185,
    toolbar: { show: false },
    foreColor: "#A6B0CF",
    background: "transparent"
  };
  strokeLine = { curve: "smooth", width: 3 };
  grid = { borderColor: "rgba(255,255,255,.08)", strokeDashArray: 4, padding: { left: 8, right: 8 } };
  legend = { labels: { colors: "#A6B0CF" }, markers: { size: 6 }, itemMargin: { horizontal: 12 } };
  compactLegend = {
    position: "right",
    horizontalAlign: "center",
    fontSize: "11px",
    labels: { colors: "#A6B0CF" },
    markers: { size: 5 },
    itemMargin: { horizontal: 8, vertical: 2 }
  };
  dataLabelsOff = { enabled: false };
  donutPlotOptions = {
    pie: {
      donut: {
        size: "68%",
        labels: {
          show: true,
          name: { color: "#A6B0CF" },
          value: { color: "#FFFFFF", fontSize: "24px", fontWeight: 800 },
          total: { show: true, label: "Total", color: "#A6B0CF" }
        }
      }
    }
  };
  livestockDonutPlotOptions = {
    pie: {
      donut: {
        size: "66%",
        labels: {
          show: true,
          name: { color: "#A6B0CF", fontSize: "11px" },
          value: { color: "#FFFFFF", fontSize: "20px", fontWeight: 800 },
          total: { show: true, label: "Animales", color: "#A6B0CF" }
        }
      }
    }
  };
  barPlotOptions = {
    bar: {
      horizontal: false,
      borderRadius: 8,
      columnWidth: "44%",
      dataLabels: { position: "top" }
    }
  };
  horizontalBarPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 4,
      barHeight: "48%",
      distributed: false,
      dataLabels: { position: "right" }
    }
  };
  reproductiveBarPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 3,
      barHeight: "42%",
      distributed: true,
      dataLabels: { position: "right" }
    }
  };
  barDataLabels = {
    enabled: true,
    offsetY: -18,
    style: { colors: ["#FFFFFF"], fontWeight: 700 }
  };
  horizontalBarDataLabels = {
    enabled: true,
    offsetX: 6,
    style: { colors: ["#A6B0CF"], fontSize: "10px", fontWeight: 600 },
    formatter: (value) => Math.round(value).toLocaleString("es-AR")
  };
  reproductiveBarDataLabels = {
    enabled: true,
    offsetX: 6,
    style: { colors: ["#FFFFFF"], fontSize: "10px", fontWeight: 700 },
    formatter: (value, opts) => {
      const total = opts?.w?.config?.series?.[0]?.data?.reduce((sum, item) => sum + Number(item ?? 0), 0) ?? 0;
      const pct = total > 0 ? Math.round(Number(value ?? 0) / total * 100) : 0;
      return `${Math.round(value).toLocaleString("es-AR")}   ${pct}%`;
    }
  };
  areaDataLabels = {
    enabled: true,
    offsetY: -8,
    style: { colors: ["#FFFFFF"], fontSize: "10px", fontWeight: 700 },
    background: { enabled: false }
  };
  areaFill = {
    type: "gradient",
    gradient: { shade: "dark", type: "vertical", opacityFrom: 0.42, opacityTo: 0.04, stops: [0, 100] }
  };
  compactGrid = {
    borderColor: "rgba(255,255,255,.06)",
    strokeDashArray: 0,
    padding: { left: 0, right: 6, top: -8, bottom: -8 }
  };
  gaugePlotOptions = {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: { size: "64%", background: "#081225" },
      track: { background: "rgba(255,255,255,.08)", strokeWidth: "96%" },
      dataLabels: {
        name: { color: "#A6B0CF", fontSize: "13px" },
        value: { color: "#FFFFFF", fontSize: "32px", fontWeight: 800, formatter: (value) => `${Math.round(value)}%` }
      }
    }
  };
  fillGradient = {
    type: "gradient",
    gradient: { shade: "dark", type: "vertical", opacityFrom: 0.85, opacityTo: 0.35, stops: [0, 100] }
  };
  ngOnInit() {
    this.load();
  }
  load() {
    this.loading.set(true);
    this.error.set(null);
    this.ganaderiaService.getGanaderoDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("No se pudo cargar el dashboard ganadero.");
        this.loading.set(false);
      }
    });
  }
  lineSeries(points, name) {
    return [{ name, data: points.map((point) => Number(point.valor ?? 0)) }];
  }
  multiLineSeries(series) {
    return series.map((item) => ({ name: item.categoria, data: item.puntos.map((point) => Number(point.valor ?? 0)) }));
  }
  categories(points) {
    return points.map((point) => point.etiqueta);
  }
  categoriesFromSeries(series) {
    return series[0]?.puntos.map((point) => point.etiqueta) ?? [];
  }
  donutSeries(items) {
    return items.map((item) => Number(item.cantidad ?? 0));
  }
  donutLabels(items) {
    return items.map((item) => item.categoria ?? this.titleCase(item.severidad ?? "Sin dato"));
  }
  chartColors(items) {
    return items?.map((item, index) => item.color ?? this.serieColor(index)) ?? this.palette();
  }
  barSeries(items) {
    return [{ name: "Animales", data: items.map((item) => Number(item.valor ?? 0)) }];
  }
  barCategories(items) {
    return items.map((item) => item.etiqueta);
  }
  reproductiveSeries(data) {
    return [{
      name: "Estado reproductivo",
      data: [
        data.estadoReproductivo.prenadas,
        data.estadoReproductivo.vacias,
        data.estadoReproductivo.enControl,
        data.estadoReproductivo.proximasAParir,
        data.estadoReproductivo.torosActivos
      ]
    }];
  }
  reproductiveHorizontalSeries(data) {
    return [{
      name: "Animales",
      data: [
        data.estadoReproductivo.prenadas,
        data.estadoReproductivo.vacias,
        data.estadoReproductivo.enControl,
        data.estadoReproductivo.proximasAParir,
        data.estadoReproductivo.torosActivos
      ]
    }];
  }
  reproductiveCategories() {
    return ["Pre\xF1adas", "Vac\xEDas", "En control", "Pr\xF3x. parto", "Toros"];
  }
  reproductiveColors() {
    return ["#69C94F", "#FFB84D", "#6EA8FF", "#9A7DFF", "#4CD8C4"];
  }
  reproductiveItems(data) {
    const labels = this.reproductiveCategories();
    const values = [
      data.estadoReproductivo.prenadas,
      data.estadoReproductivo.vacias,
      data.estadoReproductivo.enControl,
      data.estadoReproductivo.proximasAParir,
      data.estadoReproductivo.torosActivos
    ];
    const colors = this.reproductiveColors();
    const total = values.reduce((sum, value) => sum + Number(value ?? 0), 0);
    const max = Math.max(...values, 1);
    return values.map((value, index) => ({
      label: labels[index],
      value,
      percent: total > 0 ? Math.round(value / total * 100) : 0,
      width: `${Math.max(value > 0 ? 6 : 0, Math.round(value / max * 100))}%`,
      color: colors[index]
    }));
  }
  genealogyGapItems(data) {
    return [
      { label: "Sin madre", value: data.genealogiaTrazabilidad.sinMadre, color: "#FFB84D" },
      { label: "Sin padre", value: data.genealogiaTrazabilidad.sinPadre, color: "#FFB84D" },
      { label: "Sin raza", value: data.genealogiaTrazabilidad.sinRaza, color: "#6EA8FF" },
      { label: "Sin fecha nacimiento", value: data.genealogiaTrazabilidad.sinFechaNacimiento, color: "#6EA8FF" },
      { label: "Sin trazabilidad completa", value: data.genealogiaTrazabilidad.sinTrazabilidad, color: "#FF6B6B" }
    ];
  }
  gaugeSeries(value) {
    return [Math.max(0, Math.min(100, Number(value ?? 0)))];
  }
  donutTooltip(title, subtitle, items) {
    return {
      enabled: true,
      custom: ({ seriesIndex, w }) => {
        const item = items[seriesIndex];
        const label = item?.categoria ?? this.titleCase(item?.severidad ?? w.globals.labels?.[seriesIndex] ?? title);
        const value = item?.cantidad ?? w.globals.series?.[seriesIndex] ?? 0;
        const pct = item?.porcentaje ?? 0;
        const color = item?.color ?? this.serieColor(seriesIndex);
        return this.tooltipHtml({
          title: label,
          subtitle,
          status: `${pct}%`,
          accent: color,
          rows: [
            ["Cantidad", `${value}`],
            ["Participaci\xF3n", `${pct}%`],
            ["Serie", title]
          ],
          legends: [[label, color]]
        });
      }
    };
  }
  lineTooltip(title, subtitle, suffix, showStatus = true) {
    return {
      enabled: true,
      shared: false,
      intersect: false,
      followCursor: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const safeSeriesIndex = seriesIndex ?? 0;
        const label = w.globals.categoryLabels?.[dataPointIndex] ?? w.globals.labels?.[dataPointIndex] ?? "Sin per\xEDodo";
        const name = w.globals.seriesNames?.[safeSeriesIndex] ?? title;
        const value = series?.[safeSeriesIndex]?.[dataPointIndex] ?? 0;
        const color = w.globals.colors?.[safeSeriesIndex] ?? "#9FE870";
        return this.tooltipHtml({
          title,
          subtitle,
          status: name,
          showStatus,
          accent: color,
          rows: [
            ["Valor", `${this.formatNumber(value, 1)} ${suffix}`.trim()],
            ["Per\xEDodo", label],
            ["Serie", name]
          ],
          legends: [[name, color]]
        });
      }
    };
  }
  barTooltip(title, subtitle, suffix, showStatus = true) {
    return {
      enabled: true,
      custom: ({ series, dataPointIndex, w }) => {
        const label = w.globals.labels?.[dataPointIndex] ?? w.globals.categoryLabels?.[dataPointIndex] ?? title;
        const value = series?.[0]?.[dataPointIndex] ?? 0;
        return this.tooltipHtml({
          title: label,
          subtitle,
          status: title,
          showStatus,
          accent: "#9FE870",
          rows: [
            ["Valor", `${this.formatNumber(value)} ${suffix}`.trim()],
            ["Categor\xEDa", label],
            ["Serie", title]
          ],
          legends: [[title, "#9FE870"]]
        });
      }
    };
  }
  gaugeTooltip(title, subtitle) {
    return {
      enabled: true,
      custom: ({ series }) => this.tooltipHtml({
        title,
        subtitle,
        status: "Activo",
        accent: "#9FE870",
        rows: [
          ["Completitud", `${Math.round(series?.[0] ?? 0)}%`],
          ["Indicador", title]
        ],
        legends: [[title, "#9FE870"]]
      })
    };
  }
  progressWidth(value) {
    return `${Math.max(0, Math.min(100, Number(value ?? 0)))}%`;
  }
  sanitaryWidth(value, type) {
    const maxByType = { vencidas: 18, proximas: 30, programadas: 45 };
    const pct = Number(value ?? 0) / maxByType[type] * 100;
    return `${Math.max(8, Math.min(100, pct))}%`;
  }
  progressTone(value) {
    const pct = Number(value ?? 0);
    if (pct >= 100)
      return "danger";
    if (pct >= 85)
      return "orange";
    if (pct >= 60)
      return "warning";
    return "green";
  }
  formatNumber(value, digits = 0) {
    return new Intl.NumberFormat("es-AR", { maximumFractionDigits: digits }).format(Number(value ?? 0));
  }
  formatCurrency(value) {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value ?? 0));
  }
  formatDateTime(value) {
    if (!value) {
      return "Sin fecha";
    }
    return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  }
  serieColor(index) {
    return this.palette()[index % this.palette().length];
  }
  totalSerie(serie) {
    return Number(serie.total ?? serie.puntos.reduce((sum, point) => sum + Number(point.valor ?? 0), 0));
  }
  trackByCode(_, item) {
    return item.codigo ?? item.titulo ?? String(_);
  }
  palette() {
    return ["#9FE870", "#6EA8FF", "#9A7DFF", "#FFB84D", "#4CD8C4", "#FF6B6B"];
  }
  titleCase(value) {
    return value.toLowerCase().replace(/(^|\s|_)\S/g, (match) => match.toUpperCase()).replaceAll("_", " ");
  }
  tooltipHtml(config) {
    const rows = config.rows.map(([label, value]) => `<div class="apex-tooltip-row"><span>${label}</span><strong>${value}</strong></div>`).join("");
    const legends = config.legends.map(([label, color]) => `<span><i style="background:${color}"></i>${label}</span>`).join("");
    const status = config.showStatus === false ? "" : `<em>${config.status}</em>`;
    return `
      <div class="apex-tooltip-card" style="--accent:${config.accent}">
        <div class="apex-tooltip-band"></div>
        <div class="apex-tooltip-head">
          <span class="apex-tooltip-icon">
            <svg viewBox="0 0 24 24"><path d="M5 8c0-3 3-5 7-5s7 2 7 5c0 4-3 7-7 7S5 12 5 8Z" /><path d="M10 15v4h4v-4" /></svg>
          </span>
          <div><strong>${config.title}</strong><small>${config.subtitle}</small></div>
          ${status}
        </div>
        <div class="apex-tooltip-rows">${rows}</div>
        <div class="apex-tooltip-footer">${legends}</div>
      </div>
    `;
  }
  static \u0275fac = function ReportesGanaderiaPageComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ReportesGanaderiaPageComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ReportesGanaderiaPageComponent, selectors: [["app-reportes-ganaderia-page"]], decls: 33, vars: 3, consts: [[1, "ganadero-dashboard"], [1, "page-header"], [1, "eyebrow"], [1, "header-actions"], ["type", "button", 1, "ghost-button"], ["viewBox", "0 0 24 24"], ["d", "M4 7h16"], ["d", "M7 12h10"], ["d", "M10 17h4"], ["d", "M6 3v4"], ["d", "M18 3v4"], ["d", "M4 9h16"], ["d", "M5 5h14v16H5z"], ["type", "button", 1, "primary-button"], ["d", "M4 18h16"], ["d", "M7 15v-5"], ["d", "M12 15V6"], ["d", "M17 15v-3"], ["class", "state-panel", 4, "ngIf"], ["class", "state-panel error", 4, "ngIf"], [4, "ngIf"], [1, "state-panel"], [1, "state-panel", "error"], [1, "kpi-grid"], ["class", "kpi-card", 3, "class", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "dashboard-grid", "row-livestock"], [1, "panel-card", "chart-card", "compact-chart-card"], [1, "panel-head"], [3, "series", "chart", "labels", "colors", "plotOptions", "dataLabels", "legend", "tooltip"], [3, "series", "chart", "xaxis", "yaxis", "colors", "plotOptions", "dataLabels", "grid", "tooltip"], [1, "panel-card", "occupancy-card"], [1, "occupancy-header"], [1, "occupancy-list"], ["class", "occupancy-row", 4, "ngFor", "ngForOf"], [1, "dashboard-grid", "row-three", "row-health"], [1, "panel-card", "sanitary-card"], [1, "sanitary-grid-head"], [1, "sanitary-bars-list"], ["class", "sanitary-row", 4, "ngFor", "ngForOf"], [1, "sanitary-axis"], [1, "panel-card", "operative-card", "treatment-card"], [1, "treatment-list"], [1, "treatment-row", "tone-green"], [1, "treatment-icon"], ["d", "M5 8c0-3 3-5 7-5s7 2 7 5c0 4-3 7-7 7S5 12 5 8Z"], ["d", "M8 5L5 3"], ["d", "M16 5l3-2"], ["d", "M10 15v4h4v-4"], [1, "treatment-row", "tone-blue"], ["d", "M8 3h8l1 3h2v15H5V6h2l1-3Z"], ["d", "M9 10h6"], ["d", "M9 14h6"], [1, "treatment-row", "tone-red"], ["d", "M12 3 2 20h20L12 3Z"], ["d", "M12 9v5"], ["d", "M12 17h.01"], [1, "dashboard-grid", "row-three", "row-reproductive"], [1, "panel-card", "compact-chart-card", "reproductive-card"], [1, "repro-table-head"], [1, "repro-list"], ["class", "repro-row", 4, "ngFor", "ngForOf"], [1, "panel-card", "compact-chart-card", "partos-card"], [3, "series", "chart", "xaxis", "yaxis", "colors", "stroke", "fill", "dataLabels", "grid", "legend", "tooltip"], [1, "panel-card", "genealogy-card"], [1, "genealogy-layout"], [1, "genealogy-ring"], [1, "genealogy-gap-list"], [4, "ngFor", "ngForOf"], [1, "dashboard-grid", "row-four"], [1, "panel-card", "wide"], [3, "series", "chart", "xaxis", "yaxis", "colors", "stroke", "dataLabels", "grid", "legend", "tooltip"], [1, "panel-card", "gauge-card"], [1, "gauge-copy"], [1, "panel-card", "diets-card"], [1, "soft-badge"], [1, "nutrition-list"], ["class", "nutrition-row", 4, "ngFor", "ngForOf"], [1, "dashboard-grid", "row-one"], [1, "panel-card", "alert-panel"], [1, "timeline"], ["class", "timeline-row", 3, "class", 4, "ngFor", "ngForOf"], ["class", "empty-state", 4, "ngIf"], [1, "kpi-card"], ["aria-hidden", "true", 1, "kpi-icon"], ["viewBox", "0 0 24 24", 4, "ngIf"], [1, "kpi-copy"], ["d", "M6 20h12l-2-10H8L6 20Z"], ["d", "M9 10a3 3 0 0 1 6 0"], ["d", "M12 14v2"], ["d", "M6 15l4-4 3 2 5-7"], ["d", "M18 6v5h-5"], ["d", "M12 21s7-4 7-11V5l-7-3-7 3v5c0 7 7 11 7 11Z"], ["d", "M9 12h6"], ["d", "M12 9v6"], ["d", "M8 2v4"], ["d", "M16 2v4"], ["d", "M3 10h18"], ["d", "M8 15h8"], ["d", "M4 20 15 9"], ["d", "m12 6 6 6"], ["d", "M14 4l6 6"], ["d", "m7 17 3 3"], ["d", "M4 7l8-3 8 3v10l-8 3-8-3V7Z"], ["d", "M12 4v16"], ["d", "M4 7l8 3 8-3"], ["d", "M4 19c6-9 12-9 16 0"], ["d", "M8 13c2-4 6-4 8 0"], ["d", "M12 5v15"], ["d", "M12 21s7-5 7-11a7 7 0 0 0-14 0c0 6 7 11 7 11Z"], ["d", "M12 10h.01"], [1, "occupancy-row"], [1, "occ-name"], [1, "bar-track", "occupancy"], [1, "sanitary-row"], [1, "sanitary-meter", "danger-meter"], [1, "sanitary-meter", "warning-meter"], [1, "sanitary-meter", "green-meter"], [1, "repro-row"], [1, "repro-name"], [1, "repro-track"], [1, "nutrition-row"], [1, "nutrition-icon"], [1, "timeline-row"], [1, "empty-state"]], template: function ReportesGanaderiaPageComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "section", 0)(1, "header", 1)(2, "div")(3, "p", 2);
      \u0275\u0275text(4, "Campo App \xB7 Ganader\xEDa");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "h1");
      \u0275\u0275text(6, "Dashboard Ganadero");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "p");
      \u0275\u0275text(8, "Resumen ejecutivo del rodeo y principales indicadores.");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(9, "div", 3)(10, "button", 4);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(11, "svg", 5);
      \u0275\u0275element(12, "path", 6)(13, "path", 7)(14, "path", 8);
      \u0275\u0275elementEnd();
      \u0275\u0275text(15, " Filtros ");
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(16, "button", 4);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(17, "svg", 5);
      \u0275\u0275element(18, "path", 9)(19, "path", 10)(20, "path", 11)(21, "path", 12);
      \u0275\u0275elementEnd();
      \u0275\u0275text(22, " Selector de fechas ");
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(23, "button", 13);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(24, "svg", 5);
      \u0275\u0275element(25, "path", 14)(26, "path", 15)(27, "path", 16)(28, "path", 17);
      \u0275\u0275elementEnd();
      \u0275\u0275text(29, " Comparar per\xEDodo ");
      \u0275\u0275elementEnd()()();
      \u0275\u0275template(30, ReportesGanaderiaPageComponent_div_30_Template, 2, 0, "div", 18)(31, ReportesGanaderiaPageComponent_div_31_Template, 2, 1, "div", 19)(32, ReportesGanaderiaPageComponent_ng_container_32_Template, 181, 105, "ng-container", 20);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(30);
      \u0275\u0275property("ngIf", ctx.loading());
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.loading() && ctx.error());
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.loading() && !ctx.error() && ctx.dashboard());
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, NgApexchartsModule, ChartComponent], styles: ['\n[_nghost-%COMP%] {\n  display: block;\n}\n.ganadero-dashboard[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 24px;\n  color: #fff;\n}\n.page-header[_ngcontent-%COMP%], \n.panel-card[_ngcontent-%COMP%], \n.state-panel[_ngcontent-%COMP%] {\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  background:\n    radial-gradient(\n      circle at top left,\n      rgba(159, 232, 112, 0.08),\n      transparent 34%),\n    linear-gradient(\n      145deg,\n      rgba(11, 23, 48, 0.98),\n      rgba(8, 18, 37, 0.96));\n  border-radius: 24px;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.24), 0 0 42px rgba(110, 168, 255, 0.05);\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  gap: 24px;\n  align-items: flex-start;\n  padding: 28px;\n}\n.eyebrow[_ngcontent-%COMP%] {\n  margin: 0 0 10px;\n  color: #9fe870;\n  font-size: 0.78rem;\n  font-weight: 800;\n  letter-spacing: 0.16em;\n  text-transform: uppercase;\n}\nh1[_ngcontent-%COMP%], \nh2[_ngcontent-%COMP%], \np[_ngcontent-%COMP%] {\n  margin: 0;\n}\nh1[_ngcontent-%COMP%] {\n  font-size: clamp(2.3rem, 4vw, 4rem);\n  line-height: 0.95;\n  letter-spacing: -0.06em;\n}\n.page-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]:not(.eyebrow) {\n  margin-top: 14px;\n  color: #9fb5da;\n  font-size: 1.02rem;\n}\n.header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: flex-end;\n  gap: 12px;\n}\nbutton[_ngcontent-%COMP%] {\n  border: 0;\n  color: #fff;\n  font: inherit;\n}\n.ghost-button[_ngcontent-%COMP%], \n.primary-button[_ngcontent-%COMP%] {\n  display: inline-flex;\n  gap: 10px;\n  align-items: center;\n  justify-content: center;\n  min-height: 48px;\n  padding: 0 18px;\n  border-radius: 14px;\n  font-weight: 700;\n  cursor: pointer;\n}\n.ghost-button[_ngcontent-%COMP%] {\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  background: rgba(255, 255, 255, 0.06);\n}\n.primary-button[_ngcontent-%COMP%] {\n  background: #4d8f06;\n  box-shadow: 0 14px 36px rgba(159, 232, 112, 0.18);\n}\nsvg[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 1.8;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n.state-panel[_ngcontent-%COMP%] {\n  padding: 20px 24px;\n  color: #a6b0cf;\n}\n.state-panel.error[_ngcontent-%COMP%] {\n  color: #ff6b6b;\n}\n.kpi-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(5, minmax(0, 1fr));\n  gap: 14px;\n}\n.kpi-card[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 52px minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 14px;\n  min-height: 112px;\n  padding: 18px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 20px;\n  background:\n    linear-gradient(\n      145deg,\n      rgba(12, 28, 58, 0.94),\n      rgba(8, 18, 37, 0.92));\n}\n.kpi-icon[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  width: 52px;\n  height: 52px;\n  color: #9fe870;\n  border: 1px solid rgba(159, 232, 112, 0.25);\n  border-radius: 16px;\n  background: rgba(159, 232, 112, 0.1);\n}\n.tone-blue[_ngcontent-%COMP%]   .kpi-icon[_ngcontent-%COMP%] {\n  color: #6ea8ff;\n  border-color: rgba(110, 168, 255, 0.25);\n  background: rgba(110, 168, 255, 0.1);\n}\n.tone-purple[_ngcontent-%COMP%]   .kpi-icon[_ngcontent-%COMP%] {\n  color: #9a7dff;\n  border-color: rgba(154, 125, 255, 0.25);\n  background: rgba(154, 125, 255, 0.1);\n}\n.tone-orange[_ngcontent-%COMP%]   .kpi-icon[_ngcontent-%COMP%] {\n  color: #ffb84d;\n  border-color: rgba(255, 184, 77, 0.25);\n  background: rgba(255, 184, 77, 0.1);\n}\n.tone-red[_ngcontent-%COMP%]   .kpi-icon[_ngcontent-%COMP%] {\n  color: #ff6b6b;\n  border-color: rgba(255, 107, 107, 0.25);\n  background: rgba(255, 107, 107, 0.1);\n}\n.kpi-copy[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 5px;\n  min-width: 0;\n}\n.kpi-copy[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: #b7c8ea;\n  font-size: 0.9rem;\n  font-weight: 500;\n}\n.kpi-copy[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  color: #9fe870;\n  font-size: 0.76rem;\n}\n.kpi-card[_ngcontent-%COMP%]    > strong[_ngcontent-%COMP%] {\n  font-size: 1.72rem;\n  letter-spacing: -0.04em;\n  white-space: nowrap;\n}\n.dashboard-grid[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 18px;\n}\n.row-three[_ngcontent-%COMP%] {\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n}\n.row-health[_ngcontent-%COMP%] {\n  grid-template-columns: minmax(0, 5fr) minmax(0, 4fr) minmax(0, 3fr);\n}\n.row-livestock[_ngcontent-%COMP%] {\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 12px;\n  align-items: stretch;\n}\n.row-four[_ngcontent-%COMP%] {\n  grid-template-columns: minmax(0, 1.7fr) minmax(240px, 0.65fr) minmax(260px, 0.75fr);\n}\n.row-one[_ngcontent-%COMP%] {\n  grid-template-columns: minmax(0, 1fr);\n}\n.panel-card[_ngcontent-%COMP%] {\n  min-height: 330px;\n  padding: 22px;\n  overflow: visible;\n}\n.panel-card.wide[_ngcontent-%COMP%] {\n  min-height: 360px;\n}\n.row-livestock[_ngcontent-%COMP%]   .panel-card[_ngcontent-%COMP%] {\n  min-height: 218px;\n  padding: 16px;\n  border-radius: 12px;\n  background:\n    radial-gradient(\n      circle at 12% 0%,\n      rgba(110, 168, 255, 0.08),\n      transparent 34%),\n    linear-gradient(\n      145deg,\n      rgba(9, 24, 50, 0.98),\n      rgba(7, 17, 36, 0.98));\n}\n.row-livestock[_ngcontent-%COMP%]   .panel-head[_ngcontent-%COMP%] {\n  margin-bottom: 4px;\n}\n.row-livestock[_ngcontent-%COMP%]   .panel-head[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.88rem;\n  letter-spacing: -0.02em;\n}\n.compact-chart-card[_ngcontent-%COMP%]   apx-chart[_ngcontent-%COMP%] {\n  margin: -8px -8px -16px;\n}\n.panel-head[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  gap: 16px;\n  align-items: flex-start;\n  margin-bottom: 22px;\n}\n.panel-head[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: #9fe870;\n  font-size: 0.72rem;\n  font-weight: 800;\n  letter-spacing: 0.1em;\n  text-transform: uppercase;\n}\n.panel-head[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin-top: 6px;\n  font-size: 1.08rem;\n  letter-spacing: -0.03em;\n}\n.soft-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  min-height: 30px;\n  padding: 0 10px;\n  border: 1px solid rgba(159, 232, 112, 0.18);\n  border-radius: 999px;\n  background: rgba(159, 232, 112, 0.08);\n  color: #9fe870 !important;\n  white-space: nowrap;\n}\n.donut-layout[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 170px minmax(0, 1fr);\n  gap: 24px;\n  align-items: center;\n}\n.donut-layout.compact[_ngcontent-%COMP%] {\n  grid-template-columns: 140px minmax(0, 1fr);\n}\n.donut-chart[_ngcontent-%COMP%], \n.radial-chart[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  width: 170px;\n  height: 170px;\n  border-radius: 50%;\n  box-shadow: 0 0 34px rgba(159, 232, 112, 0.12);\n}\n.donut-chart[_ngcontent-%COMP%]::before, \n.radial-chart[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n}\n.donut-chart[_ngcontent-%COMP%] {\n  position: relative;\n}\n.tooltip-host[_ngcontent-%COMP%] {\n  position: relative;\n}\n.premium-tooltip[_ngcontent-%COMP%] {\n  position: absolute;\n  z-index: 40;\n  left: 50%;\n  bottom: calc(100% + 16px);\n  width: min(380px, 84vw);\n  min-height: 320px;\n  padding: 28px;\n  color: #fff;\n  border: 1px solid rgba(159, 232, 112, 0.2);\n  border-radius: 24px;\n  background:\n    radial-gradient(\n      circle at 18% 12%,\n      rgba(159, 232, 112, 0.12),\n      transparent 32%),\n    linear-gradient(\n      145deg,\n      rgba(8, 18, 37, 0.98),\n      rgba(11, 23, 48, 0.98));\n  box-shadow: 0 15px 60px rgba(0, 0, 0, 0.35), 0 0 40px rgba(159, 232, 112, 0.08);\n  opacity: 0;\n  pointer-events: none;\n  transform: translate(-50%, 10px) scale(0.98);\n  transition: opacity 160ms ease, transform 160ms ease;\n}\n.tooltip-host[_ngcontent-%COMP%]:hover    > .premium-tooltip[_ngcontent-%COMP%], \n.tooltip-host[_ngcontent-%COMP%]:focus-within    > .premium-tooltip[_ngcontent-%COMP%] {\n  opacity: 1;\n  transform: translate(-50%, 0) scale(1);\n}\n.compact-tooltip[_ngcontent-%COMP%] {\n  width: min(340px, 78vw);\n  min-height: 240px;\n  padding: 22px;\n}\n.mini-tooltip[_ngcontent-%COMP%] {\n  width: min(320px, 76vw);\n  min-height: 190px;\n  padding: 20px;\n}\n.tooltip-band[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0 auto auto 0;\n  width: 72%;\n  height: 8px;\n  border-radius: 24px 0 16px 0;\n  background:\n    linear-gradient(\n      90deg,\n      #9fe870,\n      #6ea8ff);\n  box-shadow: 0 0 22px rgba(159, 232, 112, 0.25);\n}\n.tooltip-head[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 64px minmax(0, 1fr) auto;\n  gap: 18px;\n  align-items: center;\n  padding-bottom: 22px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n}\n.tooltip-icon[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  width: 64px;\n  height: 64px;\n  color: #9fe870;\n  border: 1px solid rgba(159, 232, 112, 0.24);\n  border-radius: 50%;\n  background: rgba(159, 232, 112, 0.1);\n  box-shadow: 0 0 28px rgba(159, 232, 112, 0.12);\n}\n.tooltip-icon[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  width: 34px;\n  height: 34px;\n}\n.tooltip-head[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 6px;\n  min-width: 0;\n}\n.tooltip-head[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  font-size: 1.65rem;\n  line-height: 1;\n  letter-spacing: -0.04em;\n}\n.premium-tooltip[_ngcontent-%COMP%]:not(.compact-tooltip):not(.mini-tooltip)   .tooltip-head[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  font-size: 2.1rem;\n}\n.tooltip-head[_ngcontent-%COMP%]   small[_ngcontent-%COMP%], \n.tooltip-metrics[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.tooltip-footer[_ngcontent-%COMP%] {\n  color: #a6b0cf;\n}\n.tooltip-head[_ngcontent-%COMP%]   em[_ngcontent-%COMP%] {\n  align-self: start;\n  padding: 8px 12px;\n  color: #9fe870;\n  font-style: normal;\n  font-weight: 800;\n  border: 1px solid rgba(159, 232, 112, 0.2);\n  border-radius: 999px;\n  background: rgba(159, 232, 112, 0.1);\n  white-space: nowrap;\n}\n.tooltip-metrics[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 14px;\n  margin-top: 22px;\n}\n.tooltip-metrics[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 18px minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 10px;\n  min-height: 28px;\n}\n.tooltip-metrics[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:not(:has(i)) {\n  grid-template-columns: minmax(0, 1fr) auto;\n}\n.tooltip-metrics[_ngcontent-%COMP%]   i[_ngcontent-%COMP%], \n.tooltip-footer[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  width: 12px;\n  height: 12px;\n  border-radius: 50%;\n  background: #9fe870;\n  box-shadow: 0 0 18px rgba(159, 232, 112, 0.35);\n}\n.tooltip-metrics[_ngcontent-%COMP%]   b[_ngcontent-%COMP%] {\n  color: #fff;\n  font-size: 1rem;\n  text-align: right;\n}\n.tooltip-footer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  margin-top: 22px;\n  padding-top: 18px;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n.pie-tooltip[_ngcontent-%COMP%] {\n  width: min(330px, 84vw);\n  min-height: 390px;\n  padding: 30px 26px 22px;\n  border-color: rgba(159, 232, 112, 0.26);\n  background:\n    radial-gradient(\n      circle at 16% 18%,\n      rgba(159, 232, 112, 0.14),\n      transparent 28%),\n    linear-gradient(\n      145deg,\n      rgba(8, 18, 37, 0.99),\n      rgba(11, 23, 48, 0.99));\n}\n.pie-tooltip[_ngcontent-%COMP%]   .tooltip-band[_ngcontent-%COMP%] {\n  width: 56%;\n  height: 8px;\n  background: #f4c542;\n  box-shadow: 0 0 22px rgba(244, 197, 66, 0.28);\n}\n.pie-tooltip-head[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 64px minmax(0, 1fr) auto;\n  gap: 18px;\n  align-items: center;\n  padding-bottom: 24px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n}\n.pie-tooltip-title[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 8px;\n}\n.pie-tooltip-title[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  font-size: 2rem;\n  line-height: 0.96;\n  letter-spacing: -0.06em;\n}\n.pie-tooltip-title[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  max-width: 120px;\n  color: #a6b0cf;\n  font-size: 1rem;\n  line-height: 1.35;\n}\n.pie-tooltip-head[_ngcontent-%COMP%]   em[_ngcontent-%COMP%] {\n  align-self: start;\n  padding: 9px 14px;\n  color: #9fe870;\n  font-style: normal;\n  font-weight: 800;\n  border: 1px solid rgba(159, 232, 112, 0.25);\n  border-radius: 13px;\n  background: rgba(159, 232, 112, 0.11);\n}\n.pie-tooltip-metrics[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 0;\n  margin-top: 20px;\n}\n.pie-tooltip-metrics[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 28px minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 12px;\n  min-height: 40px;\n  color: #a6b0cf;\n}\n.pie-tooltip-metrics[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]    + div[_ngcontent-%COMP%] {\n  border-top: 1px dashed rgba(255, 255, 255, 0.08);\n}\n.pie-tooltip-metrics[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  width: 19px;\n  height: 19px;\n  color: #9fe870;\n}\n.pie-tooltip-metrics[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: #fff;\n  font-size: 0.98rem;\n  text-align: right;\n  white-space: nowrap;\n}\n.pie-tooltip-footer[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 22px;\n  align-items: center;\n  margin-top: 20px;\n  padding-top: 16px;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n.pie-tooltip-footer[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  color: #a6b0cf;\n  font-size: 0.86rem;\n}\n.pie-tooltip-footer[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  width: 13px;\n  height: 13px;\n  border-radius: 50%;\n  box-shadow: 0 0 16px rgba(159, 232, 112, 0.3);\n}\n.donut-chart[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%], \n.radial-chart[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  width: 108px;\n  height: 108px;\n  border-radius: 50%;\n  background: #081225;\n  text-align: center;\n}\n.donut-chart.small[_ngcontent-%COMP%] {\n  width: 140px;\n  height: 140px;\n}\n.donut-chart.small[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] {\n  width: 88px;\n  height: 88px;\n}\n.donut-chart[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], \n.radial-chart[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n}\n.donut-chart[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.radial-chart[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: #a6b0cf;\n  font-size: 0.76rem;\n}\n.legend-list[_ngcontent-%COMP%], \n.bar-list[_ngcontent-%COMP%], \n.occupancy-list[_ngcontent-%COMP%], \n.sanitary-list[_ngcontent-%COMP%], \n.diet-list[_ngcontent-%COMP%], \n.gap-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 12px;\n}\n.legend-row[_ngcontent-%COMP%], \n.bar-label[_ngcontent-%COMP%], \n.occ-title[_ngcontent-%COMP%], \n.occ-meta[_ngcontent-%COMP%], \n.sanitary-row[_ngcontent-%COMP%], \n.cost-line[_ngcontent-%COMP%], \n.series-legend[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n}\n.legend-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 10px minmax(0, 1fr) auto auto;\n}\n.legend-row[_ngcontent-%COMP%]   i[_ngcontent-%COMP%], \n.series-legend[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n}\n.legend-row[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.bar-label[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.occ-title[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.cost-line[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.gap-list[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.timeline[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: #a6b0cf;\n}\n.legend-row[_ngcontent-%COMP%]   small[_ngcontent-%COMP%], \n.occ-meta[_ngcontent-%COMP%], \n.sanitary-row[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.sanitary-row[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  color: #7f90b2;\n}\n.bar-row[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 8px;\n}\n.bar-track[_ngcontent-%COMP%] {\n  height: 10px;\n  overflow: hidden;\n  border-radius: 999px;\n  background: rgba(255, 255, 255, 0.07);\n}\n.bar-track[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  display: block;\n  height: 100%;\n  border-radius: inherit;\n  background:\n    linear-gradient(\n      90deg,\n      #9fe870,\n      #6ea8ff);\n  box-shadow: 0 0 24px rgba(159, 232, 112, 0.24);\n}\n.bar-track.warning[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  background: #ffb84d;\n}\n.bar-track.orange[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  background: #ff8a4d;\n}\n.bar-track.danger[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  background: #ff6b6b;\n}\n.occupancy-row[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 8px;\n}\n.occupancy-card[_ngcontent-%COMP%]   .panel-head[_ngcontent-%COMP%] {\n  margin-bottom: 14px;\n}\n.occupancy-header[_ngcontent-%COMP%], \n.occupancy-card[_ngcontent-%COMP%]   .occupancy-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(74px, 0.9fr) 54px 54px minmax(92px, 1fr) 34px;\n  align-items: center;\n  gap: 8px;\n}\n.occupancy-header[_ngcontent-%COMP%] {\n  min-height: 24px;\n  color: #7f90b2;\n  font-size: 0.61rem;\n}\n.occupancy-header[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:last-child {\n  grid-column: 4 / 6;\n  text-align: center;\n}\n.occupancy-card[_ngcontent-%COMP%]   .occupancy-list[_ngcontent-%COMP%] {\n  gap: 0;\n}\n.occupancy-card[_ngcontent-%COMP%]   .occupancy-row[_ngcontent-%COMP%] {\n  min-height: 29px;\n  padding: 3px 0;\n  border-top: 1px solid rgba(255, 255, 255, 0.055);\n}\n.occupancy-card[_ngcontent-%COMP%]   .occupancy-row[_ngcontent-%COMP%]   .occ-name[_ngcontent-%COMP%] {\n  color: #fff;\n  font-size: 0.72rem;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.occupancy-card[_ngcontent-%COMP%]   .occupancy-row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: #dbe8ff;\n  font-size: 0.7rem;\n  font-weight: 600;\n  text-align: right;\n}\n.occupancy-card[_ngcontent-%COMP%]   .occupancy-row[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  color: #fff;\n  font-size: 0.68rem;\n  text-align: right;\n}\n.occupancy-card[_ngcontent-%COMP%]   .bar-track[_ngcontent-%COMP%] {\n  height: 7px;\n}\n.sanitary-row[_ngcontent-%COMP%] {\n  min-height: 52px;\n  padding-bottom: 12px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06);\n}\n.sanitary-row[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 4px;\n}\n.danger[_ngcontent-%COMP%] {\n  color: #ff6b6b !important;\n}\n.warning[_ngcontent-%COMP%] {\n  color: #ffb84d !important;\n}\n.triple-metric[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 12px;\n}\n.triple-metric[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 8px;\n  padding: 16px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 18px;\n  background: rgba(255, 255, 255, 0.04);\n}\n.triple-metric[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: #a6b0cf;\n  font-size: 0.78rem;\n}\n.triple-metric[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], \n.big-number[_ngcontent-%COMP%] {\n  font-size: 2.4rem;\n  letter-spacing: -0.05em;\n}\n.cost-line[_ngcontent-%COMP%] {\n  margin-top: 22px;\n  padding-top: 18px;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n.row-health[_ngcontent-%COMP%]   .panel-card[_ngcontent-%COMP%] {\n  min-height: 218px;\n  padding: 16px;\n  border-radius: 12px;\n  background:\n    radial-gradient(\n      circle at 12% 0%,\n      rgba(110, 168, 255, 0.08),\n      transparent 34%),\n    linear-gradient(\n      145deg,\n      rgba(9, 24, 50, 0.98),\n      rgba(7, 17, 36, 0.98));\n}\n.row-health[_ngcontent-%COMP%]   .panel-head[_ngcontent-%COMP%] {\n  margin-bottom: 10px;\n}\n.row-health[_ngcontent-%COMP%]   .panel-head[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.88rem;\n  letter-spacing: -0.02em;\n}\n.sanitary-grid-head[_ngcontent-%COMP%], \n.sanitary-card[_ngcontent-%COMP%]   .sanitary-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(70px, 0.75fr) minmax(56px, 0.75fr) minmax(92px, 1.15fr) minmax(92px, 1.15fr);\n  align-items: center;\n  gap: 10px;\n}\n.sanitary-grid-head[_ngcontent-%COMP%] {\n  margin-bottom: 7px;\n  color: #7f90b2;\n  font-size: 0.58rem;\n}\n.sanitary-bars-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 7px;\n}\n.sanitary-card[_ngcontent-%COMP%]   .sanitary-row[_ngcontent-%COMP%] {\n  min-height: 23px;\n  padding: 0;\n  border: 0;\n}\n.sanitary-card[_ngcontent-%COMP%]   .sanitary-row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  overflow: hidden;\n  color: #dbe8ff;\n  font-size: 0.68rem;\n  font-weight: 600;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.sanitary-meter[_ngcontent-%COMP%] {\n  position: relative;\n  height: 14px;\n  overflow: hidden;\n  border-radius: 4px;\n  background: rgba(255, 255, 255, 0.055);\n}\n.sanitary-meter[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  display: block;\n  height: 100%;\n  min-width: 14px;\n  border-radius: inherit;\n}\n.sanitary-meter[_ngcontent-%COMP%]   b[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  display: grid;\n  place-items: center;\n  color: #fff;\n  font-size: 0.58rem;\n  font-weight: 800;\n}\n.danger-meter[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  background: #ff6b6b;\n}\n.warning-meter[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  background: #ffb84d;\n}\n.green-meter[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  background: #69c94f;\n}\n.sanitary-axis[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  margin: 8px 0 0 calc(25% + 10px);\n  color: #7f90b2;\n  font-size: 0.58rem;\n}\n.treatment-card[_ngcontent-%COMP%]   .panel-head[_ngcontent-%COMP%] {\n  margin-bottom: 14px;\n}\n.treatment-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 10px;\n}\n.treatment-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 34px minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 12px;\n  min-height: 43px;\n  padding-bottom: 10px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.055);\n}\n.treatment-row[_ngcontent-%COMP%]:last-child {\n  border-bottom: 0;\n}\n.treatment-row[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:not(.treatment-icon) {\n  color: #dbe8ff;\n  font-size: 0.74rem;\n}\n.treatment-row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: #fff;\n  font-size: 0.88rem;\n}\n.treatment-icon[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  width: 30px;\n  height: 30px;\n  border-radius: 9px;\n}\n.treatment-icon[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  width: 17px;\n  height: 17px;\n}\n.treatment-row.tone-green[_ngcontent-%COMP%]   .treatment-icon[_ngcontent-%COMP%] {\n  color: #9fe870;\n  border: 1px solid rgba(159, 232, 112, 0.22);\n  background: rgba(159, 232, 112, 0.09);\n}\n.treatment-row.tone-blue[_ngcontent-%COMP%]   .treatment-icon[_ngcontent-%COMP%] {\n  color: #6ea8ff;\n  border: 1px solid rgba(110, 168, 255, 0.22);\n  background: rgba(110, 168, 255, 0.09);\n}\n.treatment-row.tone-red[_ngcontent-%COMP%]   .treatment-icon[_ngcontent-%COMP%] {\n  color: #ff6b6b;\n  border: 1px solid rgba(255, 107, 107, 0.22);\n  background: rgba(255, 107, 107, 0.09);\n}\n.row-reproductive[_ngcontent-%COMP%]   .panel-card[_ngcontent-%COMP%] {\n  min-height: 218px;\n  padding: 16px;\n  border-radius: 12px;\n  background:\n    radial-gradient(\n      circle at 12% 0%,\n      rgba(154, 125, 255, 0.08),\n      transparent 34%),\n    linear-gradient(\n      145deg,\n      rgba(9, 24, 50, 0.98),\n      rgba(7, 17, 36, 0.98));\n}\n.row-reproductive[_ngcontent-%COMP%]   .panel-head[_ngcontent-%COMP%] {\n  margin-bottom: 4px;\n}\n.row-reproductive[_ngcontent-%COMP%]   .panel-head[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.88rem;\n  letter-spacing: -0.02em;\n}\n.partos-card[_ngcontent-%COMP%]   apx-chart[_ngcontent-%COMP%] {\n  display: block;\n  margin: -4px -8px -18px;\n}\n.repro-table-head[_ngcontent-%COMP%], \n.repro-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 82px minmax(0, 1fr) 34px 32px;\n  align-items: center;\n  gap: 9px;\n}\n.repro-table-head[_ngcontent-%COMP%] {\n  margin: 8px 0 9px;\n  color: #7f90b2;\n  font-size: 0.6rem;\n}\n.repro-table-head[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:first-child {\n  grid-column: 1 / 3;\n}\n.repro-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 9px;\n}\n.repro-row[_ngcontent-%COMP%] {\n  min-height: 22px;\n}\n.repro-name[_ngcontent-%COMP%] {\n  overflow: hidden;\n  color: #fff;\n  font-size: 0.68rem;\n  font-weight: 600;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.repro-track[_ngcontent-%COMP%] {\n  height: 8px;\n  overflow: hidden;\n  border-radius: 999px;\n  background: rgba(255, 255, 255, 0.07);\n}\n.repro-track[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  display: block;\n  height: 100%;\n  min-width: 0;\n  border-radius: inherit;\n  box-shadow: 0 0 18px rgba(159, 232, 112, 0.16);\n}\n.repro-row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], \n.repro-row[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  color: #fff;\n  font-size: 0.68rem;\n  font-weight: 700;\n  text-align: right;\n}\n.repro-row[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  color: #a6b0cf;\n}\n.genealogy-card[_ngcontent-%COMP%] {\n  overflow: hidden;\n}\n.genealogy-layout[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 170px minmax(0, 1fr);\n  gap: 20px;\n  align-items: center;\n}\n.genealogy-ring[_ngcontent-%COMP%] {\n  position: relative;\n  display: grid;\n  place-items: center;\n  width: 136px;\n  height: 136px;\n  margin-left: 8px;\n  border-radius: 50%;\n  background:\n    radial-gradient(\n      circle at center,\n      #081225 0 53%,\n      transparent 54%),\n    conic-gradient(#69c94f 0 calc(var(--value) * 1%), rgba(255, 255, 255, 0.08) 0 100%);\n  box-shadow: 0 0 30px rgba(105, 201, 79, 0.12);\n}\n.genealogy-ring[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  inset: 13px;\n  border-radius: 50%;\n  background: #081225;\n}\n.genealogy-ring[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 1;\n  display: grid;\n  place-items: center;\n  max-width: 104px;\n  text-align: center;\n}\n.genealogy-ring[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: #fff;\n  font-size: 2rem;\n  line-height: 1;\n  letter-spacing: -0.06em;\n}\n.genealogy-ring[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  margin-top: 6px;\n  color: #dbe8ff;\n  font-size: 0.68rem;\n  line-height: 1.15;\n}\n.genealogy-gap-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 8px;\n  min-width: 0;\n}\n.genealogy-gap-list[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 8px minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 9px;\n  min-height: 24px;\n  padding-bottom: 6px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.055);\n}\n.genealogy-gap-list[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:last-child {\n  border-bottom: 0;\n}\n.genealogy-gap-list[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  box-shadow: 0 0 14px rgba(159, 232, 112, 0.22);\n}\n.genealogy-gap-list[_ngcontent-%COMP%]   em[_ngcontent-%COMP%] {\n  overflow: hidden;\n  color: #dbe8ff;\n  font-size: 0.68rem;\n  font-style: normal;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.genealogy-gap-list[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: #fff;\n  font-size: 0.74rem;\n}\n.stack-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 15px;\n}\n.stack-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;\n  gap: 8px 14px;\n}\n.stack-row[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: #a6b0cf;\n}\n.stack-row[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  grid-column: 1 / -1;\n  height: 9px;\n  border-radius: 999px;\n  background:\n    linear-gradient(\n      90deg,\n      var(--c),\n      transparent var(--w));\n  box-shadow: 0 0 18px color-mix(in srgb, var(--c) 35%, transparent);\n}\n.series-legend[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  gap: 10px;\n  color: #7f90b2;\n  font-size: 0.78rem;\n}\n.radial-layout[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 160px minmax(0, 1fr);\n  gap: 20px;\n  align-items: center;\n}\n.radial-chart[_ngcontent-%COMP%] {\n  position: relative;\n  width: 160px;\n  height: 160px;\n}\n.gap-list[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  gap: 10px;\n  padding-bottom: 9px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06);\n}\n.gauge-card[_ngcontent-%COMP%], \n.diets-card[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n.gauge-copy[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  gap: 12px;\n  margin: auto 0;\n  text-align: center;\n}\n.gauge-copy[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  font-size: 2.4rem;\n  letter-spacing: -0.05em;\n}\n.gauge-copy[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: #a6b0cf;\n  font-size: 0.78rem;\n}\n.diet-list[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  gap: 10px;\n  padding: 10px 0;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06);\n}\n.diet-list[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  color: #9fe870;\n}\n.nutrition-list[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 10px;\n}\n.nutrition-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 34px minmax(0, 1fr);\n  align-items: center;\n  gap: 12px;\n  min-height: 50px;\n  padding: 10px 12px;\n  border: 1px solid rgba(255, 255, 255, 0.07);\n  border-radius: 14px;\n  background: rgba(255, 255, 255, 0.035);\n}\n.nutrition-icon[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  width: 32px;\n  height: 32px;\n  border: 1px solid color-mix(in srgb, currentColor 28%, transparent);\n  border-radius: 10px;\n  background: color-mix(in srgb, currentColor 10%, transparent);\n}\n.nutrition-icon[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  width: 18px;\n  height: 18px;\n}\n.nutrition-row[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 4px;\n  min-width: 0;\n}\n.nutrition-row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  overflow: hidden;\n  color: #fff;\n  font-size: 0.82rem;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.nutrition-row[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  overflow: hidden;\n  color: #a6b0cf;\n  font-size: 0.7rem;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.series-legend[_ngcontent-%COMP%] {\n  flex-wrap: wrap;\n  justify-content: flex-start;\n}\n.series-legend[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  color: #a6b0cf;\n}\napx-chart[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n}\n  .ganadero-dashboard .apexcharts-canvas, \n  .ganadero-dashboard .apexcharts-svg {\n  background: transparent !important;\n}\n  .ganadero-dashboard .apexcharts-tooltip {\n  overflow: visible !important;\n  color: #fff !important;\n  border: 0 !important;\n  background: transparent !important;\n  box-shadow: none !important;\n}\n  .ganadero-dashboard .apexcharts-tooltip-title {\n  display: none !important;\n}\n  .ganadero-dashboard .apex-tooltip-card {\n  width: 330px;\n  min-height: 290px;\n  padding: 28px 24px 20px;\n  color: #fff;\n  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);\n  border-radius: 24px;\n  background:\n    radial-gradient(\n      circle at 16% 18%,\n      color-mix(in srgb, var(--accent) 16%, transparent),\n      transparent 28%),\n    linear-gradient(\n      145deg,\n      rgba(8, 18, 37, 0.99),\n      rgba(11, 23, 48, 0.99));\n  box-shadow: 0 15px 60px rgba(0, 0, 0, 0.35), 0 0 40px color-mix(in srgb, var(--accent) 12%, transparent);\n}\n  .ganadero-dashboard .apex-tooltip-band {\n  position: absolute;\n  inset: 0 auto auto 0;\n  width: 58%;\n  height: 8px;\n  border-radius: 24px 0 16px 0;\n  background: var(--accent);\n  box-shadow: 0 0 22px color-mix(in srgb, var(--accent) 35%, transparent);\n}\n  .ganadero-dashboard .apex-tooltip-head {\n  display: grid;\n  grid-template-columns: 58px minmax(0, 1fr) auto;\n  gap: 16px;\n  align-items: center;\n  padding-bottom: 20px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n}\n  .ganadero-dashboard .apex-tooltip-icon {\n  display: grid;\n  place-items: center;\n  width: 58px;\n  height: 58px;\n  color: var(--accent);\n  border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);\n  border-radius: 50%;\n  background: color-mix(in srgb, var(--accent) 12%, transparent);\n}\n  .ganadero-dashboard .apex-tooltip-icon svg {\n  width: 31px;\n  height: 31px;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 1.8;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n  .ganadero-dashboard .apex-tooltip-head strong {\n  display: block;\n  font-size: 1.7rem;\n  line-height: 0.98;\n  letter-spacing: -0.05em;\n}\n  .ganadero-dashboard .apex-tooltip-head small {\n  display: block;\n  margin-top: 6px;\n  color: #a6b0cf;\n}\n  .ganadero-dashboard .apex-tooltip-head em {\n  align-self: start;\n  padding: 8px 12px;\n  color: #9fe870;\n  font-style: normal;\n  font-weight: 800;\n  border: 1px solid rgba(159, 232, 112, 0.25);\n  border-radius: 13px;\n  background: rgba(159, 232, 112, 0.11);\n  white-space: nowrap;\n}\n  .ganadero-dashboard .apex-tooltip-rows {\n  display: grid;\n  gap: 0;\n  margin-top: 18px;\n}\n  .ganadero-dashboard .apex-tooltip-row {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;\n  gap: 12px;\n  align-items: center;\n  min-height: 38px;\n  color: #a6b0cf;\n}\n  .ganadero-dashboard .apex-tooltip-row + .apex-tooltip-row {\n  border-top: 1px dashed rgba(255, 255, 255, 0.08);\n}\n  .ganadero-dashboard .apex-tooltip-row strong {\n  color: #fff;\n  text-align: right;\n  white-space: nowrap;\n}\n  .ganadero-dashboard .apex-tooltip-footer {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 14px;\n  margin-top: 18px;\n  padding-top: 16px;\n  color: #a6b0cf;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n  .ganadero-dashboard .apex-tooltip-footer span {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n}\n  .ganadero-dashboard .apex-tooltip-footer i {\n  width: 12px;\n  height: 12px;\n  border-radius: 50%;\n  box-shadow: 0 0 16px rgba(159, 232, 112, 0.3);\n}\n.timeline[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 12px;\n}\n.timeline-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 14px minmax(0, 1fr) auto auto;\n  gap: 14px;\n  align-items: center;\n  min-height: 62px;\n  padding: 12px 0;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06);\n}\n.timeline-row[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  width: 12px;\n  height: 12px;\n  border-radius: 50%;\n  background: #9fe870;\n  box-shadow: 0 0 20px rgba(159, 232, 112, 0.4);\n}\n.timeline-row.alta[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  background: #ff6b6b;\n  box-shadow: 0 0 20px rgba(255, 107, 107, 0.4);\n}\n.timeline-row.media[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  background: #ffb84d;\n  box-shadow: 0 0 20px rgba(255, 184, 77, 0.4);\n}\n.timeline-row[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 4px;\n}\n.timeline-row[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  color: #9fe870;\n}\n.timeline-row[_ngcontent-%COMP%]   time[_ngcontent-%COMP%] {\n  color: #7f90b2;\n  font-size: 0.8rem;\n  white-space: nowrap;\n}\n.empty-state[_ngcontent-%COMP%] {\n  padding: 18px;\n  color: #a6b0cf;\n  border: 1px dashed rgba(255, 255, 255, 0.1);\n  border-radius: 18px;\n}\n@media (max-width: 1537px) {\n  .kpi-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(5, minmax(0, 1fr));\n  }\n  .kpi-card[_ngcontent-%COMP%] {\n    grid-template-columns: 44px minmax(0, 1fr) auto;\n    gap: 10px;\n    padding: 14px;\n  }\n  .kpi-icon[_ngcontent-%COMP%] {\n    width: 44px;\n    height: 44px;\n  }\n  .kpi-card[_ngcontent-%COMP%]    > strong[_ngcontent-%COMP%] {\n    font-size: 1.35rem;\n  }\n}\n@media (max-width: 1280px) {\n  .page-header[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n  .header-actions[_ngcontent-%COMP%] {\n    justify-content: flex-start;\n  }\n  .kpi-grid[_ngcontent-%COMP%], \n   .row-livestock[_ngcontent-%COMP%], \n   .row-three[_ngcontent-%COMP%], \n   .row-four[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n}\n@media (max-width: 760px) {\n  .kpi-grid[_ngcontent-%COMP%], \n   .row-livestock[_ngcontent-%COMP%], \n   .row-three[_ngcontent-%COMP%], \n   .row-four[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .donut-layout[_ngcontent-%COMP%], \n   .radial-layout[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .timeline-row[_ngcontent-%COMP%] {\n    grid-template-columns: 14px minmax(0, 1fr);\n  }\n  .timeline-row[_ngcontent-%COMP%]   small[_ngcontent-%COMP%], \n   .timeline-row[_ngcontent-%COMP%]   time[_ngcontent-%COMP%] {\n    grid-column: 2;\n  }\n}\n/*# sourceMappingURL=reportes-ganaderia-page.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ReportesGanaderiaPageComponent, [{
    type: Component,
    args: [{ selector: "app-reportes-ganaderia-page", standalone: true, imports: [CommonModule, NgApexchartsModule], template: `<section class="ganadero-dashboard">\r
  <header class="page-header">\r
    <div>\r
      <p class="eyebrow">Campo App \xB7 Ganader\xEDa</p>\r
      <h1>Dashboard Ganadero</h1>\r
      <p>Resumen ejecutivo del rodeo y principales indicadores.</p>\r
    </div>\r
    <div class="header-actions">\r
      <button type="button" class="ghost-button">\r
        <svg viewBox="0 0 24 24"><path d="M4 7h16" /><path d="M7 12h10" /><path d="M10 17h4" /></svg>\r
        Filtros\r
      </button>\r
      <button type="button" class="ghost-button">\r
        <svg viewBox="0 0 24 24"><path d="M6 3v4" /><path d="M18 3v4" /><path d="M4 9h16" /><path d="M5 5h14v16H5z" /></svg>\r
        Selector de fechas\r
      </button>\r
      <button type="button" class="primary-button">\r
        <svg viewBox="0 0 24 24"><path d="M4 18h16" /><path d="M7 15v-5" /><path d="M12 15V6" /><path d="M17 15v-3" /></svg>\r
        Comparar per\xEDodo\r
      </button>\r
    </div>\r
  </header>\r
\r
  <div class="state-panel" *ngIf="loading()">Cargando indicadores ganaderos...</div>\r
  <div class="state-panel error" *ngIf="!loading() && error()">{{ error() }}</div>\r
\r
  <ng-container *ngIf="!loading() && !error() && dashboard() as data">\r
    <section class="kpi-grid">\r
      <article class="kpi-card" *ngFor="let kpi of kpis(); trackBy: trackByCode" [class]="'kpi-card tone-' + kpi.tono">\r
        <div class="kpi-icon" aria-hidden="true">\r
          <svg viewBox="0 0 24 24" *ngIf="kpi.codigo === 'ANIMALES_ACTIVOS'"><path d="M5 8c0-3 3-5 7-5s7 2 7 5c0 4-3 7-7 7S5 12 5 8Z" /><path d="M8 5L5 3" /><path d="M16 5l3-2" /><path d="M10 15v4h4v-4" /></svg>\r
          <svg viewBox="0 0 24 24" *ngIf="kpi.codigo === 'PESO_PROMEDIO'"><path d="M6 20h12l-2-10H8L6 20Z" /><path d="M9 10a3 3 0 0 1 6 0" /><path d="M12 14v2" /></svg>\r
          <svg viewBox="0 0 24 24" *ngIf="kpi.codigo === 'GANANCIA_DIARIA'"><path d="M4 18h16" /><path d="M6 15l4-4 3 2 5-7" /><path d="M18 6v5h-5" /></svg>\r
          <svg viewBox="0 0 24 24" *ngIf="kpi.codigo === 'PRENADAS_ACTIVAS'"><path d="M12 21s7-4 7-11V5l-7-3-7 3v5c0 7 7 11 7 11Z" /><path d="M9 12h6" /><path d="M12 9v6" /></svg>\r
          <svg viewBox="0 0 24 24" *ngIf="kpi.codigo === 'PARTOS_PROXIMOS'"><path d="M8 2v4" /><path d="M16 2v4" /><path d="M3 10h18" /><path d="M5 5h14v16H5z" /><path d="M8 15h8" /></svg>\r
          <svg viewBox="0 0 24 24" *ngIf="kpi.codigo === 'VACUNAS_PROXIMAS'"><path d="M4 20 15 9" /><path d="m12 6 6 6" /><path d="M14 4l6 6" /><path d="m7 17 3 3" /></svg>\r
          <svg viewBox="0 0 24 24" *ngIf="kpi.codigo === 'ALERTAS_SANITARIAS'"><path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5" /><path d="M12 17h.01" /></svg>\r
          <svg viewBox="0 0 24 24" *ngIf="kpi.codigo === 'OCUPACION_POTREROS'"><path d="M4 7l8-3 8 3v10l-8 3-8-3V7Z" /><path d="M12 4v16" /><path d="M4 7l8 3 8-3" /></svg>\r
          <svg viewBox="0 0 24 24" *ngIf="kpi.codigo === 'DIETAS_ACTIVAS'"><path d="M4 19c6-9 12-9 16 0" /><path d="M8 13c2-4 6-4 8 0" /><path d="M12 5v15" /></svg>\r
          <svg viewBox="0 0 24 24" *ngIf="kpi.codigo === 'SIN_UBICACION'"><path d="M12 21s7-5 7-11a7 7 0 0 0-14 0c0 6 7 11 7 11Z" /><path d="M12 10h.01" /></svg>\r
        </div>\r
        <div class="kpi-copy">\r
          <span>{{ kpi.titulo }}</span>\r
          <small>{{ kpi.subtitulo }}</small>\r
        </div>\r
        <strong>{{ kpi.valor }}</strong>\r
      </article>\r
    </section>\r
\r
    <section class="dashboard-grid row-livestock">\r
      <article class="panel-card chart-card compact-chart-card">\r
        <div class="panel-head">\r
          <div>\r
            <h2>Distribuci?n del Rodeo</h2>\r
          </div>\r
        </div>\r
        <apx-chart\r
          [series]="donutSeries(data.distribucionRodeo)"\r
          [chart]="compactDonutChart"\r
          [labels]="donutLabels(data.distribucionRodeo)"\r
          [colors]="chartColors(data.distribucionRodeo)"\r
          [plotOptions]="livestockDonutPlotOptions"\r
          [dataLabels]="dataLabelsOff"\r
          [legend]="compactLegend"\r
          [tooltip]="donutTooltip('Rodeo', 'Dashboard ganadero', data.distribucionRodeo)"\r
        />\r
      </article>\r
\r
      <article class="panel-card chart-card compact-chart-card">\r
        <div class="panel-head">\r
          <div>\r
            <h2>Animales por Potrero</h2>\r
          </div>\r
        </div>\r
        <apx-chart\r
          [series]="barSeries(data.animalesPorPotrero)"\r
          [chart]="horizontalBarChart"\r
          [xaxis]="{ categories: barCategories(data.animalesPorPotrero), labels: { style: { colors: '#A6B0CF', fontSize: '10px' } } }"\r
          [yaxis]="{ labels: { style: { colors: '#FFFFFF', fontSize: '11px' } } }"\r
          [colors]="['#9FE870']"\r
          [plotOptions]="horizontalBarPlotOptions"\r
          [dataLabels]="horizontalBarDataLabels"\r
          [grid]="compactGrid"\r
          [tooltip]="barTooltip('Animales', 'Animales por potrero', 'animales', false)"\r
        />\r
      </article>\r
\r
      <article class="panel-card occupancy-card">\r
        <div class="panel-head">\r
          <div>\r
            <h2>Ocupaci?n de Potreros</h2>\r
          </div>\r
        </div>\r
        <div class="occupancy-header">\r
          <span>Potrero</span>\r
          <span>Carga actual</span>\r
          <span>Capacidad</span>\r
          <span>Ocupaci?n</span>\r
        </div>\r
        <div class="occupancy-list">\r
          <div class="occupancy-row" *ngFor="let item of data.ocupacionPotreros">\r
            <span class="occ-name">{{ item.nombre }}</span>\r
            <strong>{{ item.cargaActual }}</strong>\r
            <strong>{{ item.capacidad }}</strong>\r
            <div class="bar-track occupancy" [class]="progressTone(item.porcentaje)">\r
              <i [style.width]="progressWidth(item.porcentaje)"></i>\r
            </div>\r
            <small>{{ item.porcentaje }}%</small>\r
          </div>\r
        </div>\r
      </article>\r
    </section>\r
\r
    <section class="dashboard-grid row-three row-health">\r
      <article class="panel-card sanitary-card">\r
        <div class="panel-head">\r
          <div>\r
            <h2>Calendario Sanitario</h2>\r
          </div>\r
        </div>\r
        <div class="sanitary-grid-head">\r
          <span>Vacuna</span>\r
          <span>Vencidas</span>\r
          <span>Proximas (30 dias)</span>\r
          <span>Programadas</span>\r
        </div>\r
        <div class="sanitary-bars-list">\r
          <div class="sanitary-row" *ngFor="let item of data.calendarioSanitario">\r
            <strong>{{ item.vacuna }}</strong>\r
            <div class="sanitary-meter danger-meter">\r
              <i [style.width]="sanitaryWidth(item.vencidas, 'vencidas')"></i>\r
              <b>{{ item.vencidas }}</b>\r
            </div>\r
            <div class="sanitary-meter warning-meter">\r
              <i [style.width]="sanitaryWidth(item.proximas, 'proximas')"></i>\r
              <b>{{ item.proximas }}</b>\r
            </div>\r
            <div class="sanitary-meter green-meter">\r
              <i [style.width]="sanitaryWidth(item.programadas, 'programadas')"></i>\r
              <b>{{ item.programadas }}</b>\r
            </div>\r
          </div>\r
        </div>\r
        <div class="sanitary-axis">\r
          <span>Hoy</span>\r
          <span>15 dias</span>\r
          <span>30 dias</span>\r
          <span>60 dias</span>\r
        </div>\r
      </article>\r
\r
      <article class="panel-card chart-card compact-chart-card">\r
        <div class="panel-head">\r
          <div>\r
            <h2>Diagnosticos por Severidad</h2>\r
          </div>\r
        </div>\r
        <apx-chart\r
          [series]="donutSeries(data.diagnosticosPorSeveridad)"\r
          [chart]="compactDonutChart"\r
          [labels]="donutLabels(data.diagnosticosPorSeveridad)"\r
          [colors]="chartColors(data.diagnosticosPorSeveridad)"\r
          [plotOptions]="livestockDonutPlotOptions"\r
          [dataLabels]="dataLabelsOff"\r
          [legend]="compactLegend"\r
          [tooltip]="donutTooltip('Sanidad', 'Severidad de diagnosticos', data.diagnosticosPorSeveridad)"\r
        />\r
      </article>\r
\r
      <article class="panel-card operative-card treatment-card">\r
        <div class="panel-head">\r
          <div>\r
            <h2>Tratamientos Activos</h2>\r
          </div>\r
        </div>\r
        <div class="treatment-list">\r
          <div class="treatment-row tone-green">\r
            <span class="treatment-icon">\r
              <svg viewBox="0 0 24 24"><path d="M5 8c0-3 3-5 7-5s7 2 7 5c0 4-3 7-7 7S5 12 5 8Z" /><path d="M8 5L5 3" /><path d="M16 5l3-2" /><path d="M10 15v4h4v-4" /></svg>\r
            </span>\r
            <span>Animales en tratamiento</span>\r
            <strong>{{ data.tratamientosActivos.animalesEnTratamiento }}</strong>\r
          </div>\r
          <div class="treatment-row tone-blue">\r
            <span class="treatment-icon">\r
              <svg viewBox="0 0 24 24"><path d="M8 3h8l1 3h2v15H5V6h2l1-3Z" /><path d="M9 10h6" /><path d="M9 14h6" /></svg>\r
            </span>\r
            <span>Diagnosticos abiertos</span>\r
            <strong>{{ data.tratamientosActivos.diagnosticosAbiertos }}</strong>\r
          </div>\r
          <div class="treatment-row tone-red">\r
            <span class="treatment-icon">\r
              <svg viewBox="0 0 24 24"><path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5" /><path d="M12 17h.01" /></svg>\r
            </span>\r
            <span>Criticos</span>\r
            <strong>{{ data.tratamientosActivos.casosCriticos }}</strong>\r
          </div>\r
        </div>\r
      </article>\r
    </section>\r
\r
    <section class="dashboard-grid row-three row-reproductive">\r
      <article class="panel-card compact-chart-card reproductive-card">\r
        <div class="panel-head">\r
          <div>\r
            <h2>Estado Reproductivo</h2>\r
          </div>\r
        </div>\r
        <div class="repro-table-head">\r
          <span>Estado</span>\r
          <span>Animales</span>\r
          <span>%</span>\r
        </div>\r
        <div class="repro-list">\r
          <div class="repro-row" *ngFor="let item of reproductiveItems(data)">\r
            <span class="repro-name">{{ item.label }}</span>\r
            <div class="repro-track">\r
              <i [style.width]="item.width" [style.background]="item.color"></i>\r
            </div>\r
            <strong>{{ item.value }}</strong>\r
            <small>{{ item.percent }}%</small>\r
          </div>\r
        </div>\r
      </article>\r
\r
      <article class="panel-card compact-chart-card partos-card">\r
        <div class="panel-head">\r
          <div>\r
            <h2>Partos Estimados por Mes</h2>\r
          </div>\r
        </div>\r
        <apx-chart\r
          [series]="lineSeries(data.partosEstimadosPorMes, 'Partos estimados')"\r
          [chart]="areaChart"\r
          [xaxis]="{ categories: categories(data.partosEstimadosPorMes), labels: { style: { colors: '#A6B0CF', fontSize: '10px' } } }"\r
          [yaxis]="{ labels: { style: { colors: '#A6B0CF', fontSize: '10px' } }, title: { text: 'Cantidad', style: { color: '#A6B0CF', fontSize: '10px' } } }"\r
          [colors]="['#9A7DFF']"\r
          [stroke]="strokeLine"\r
          [fill]="areaFill"\r
          [dataLabels]="areaDataLabels"\r
          [grid]="compactGrid"\r
          [legend]="{ show: false }"\r
          [tooltip]="lineTooltip('Partos', 'Partos estimados por mes', 'partos', false)"\r
        />\r
      </article>\r
\r
      <article class="panel-card genealogy-card">\r
        <div class="panel-head">\r
          <div>\r
            <h2>Genealogia y Trazabilidad</h2>\r
          </div>\r
        </div>\r
        <div class="genealogy-layout">\r
          <div class="genealogy-ring" [style.--value]="data.genealogiaTrazabilidad.porcentajeCompleta">\r
            <div>\r
              <strong>{{ data.genealogiaTrazabilidad.porcentajeCompleta }}%</strong>\r
              <span>Con genealogia completa</span>\r
            </div>\r
          </div>\r
          <div class="genealogy-gap-list">\r
            <span *ngFor="let item of genealogyGapItems(data)">\r
              <i [style.background]="item.color"></i>\r
              <em>{{ item.label }}</em>\r
              <strong>{{ item.value }}</strong>\r
            </span>\r
          </div>\r
        </div>\r
      </article>\r
    </section>\r
\r
    <section class="dashboard-grid row-four">\r
      <article class="panel-card wide">\r
        <div class="panel-head">\r
          <div>\r
            <span>Alimentaci\xF3n</span>\r
            <h2>Consumo de alimento por potrero</h2>\r
          </div>\r
        </div>\r
        <apx-chart\r
          [series]="multiLineSeries(data.consumoAlimentoPorPotrero)"\r
          [chart]="lineChart"\r
          [xaxis]="{ categories: categoriesFromSeries(data.consumoAlimentoPorPotrero), labels: { style: { colors: '#A6B0CF' } } }"\r
          [yaxis]="{ labels: { style: { colors: '#A6B0CF' } } }"\r
          [colors]="chartColors()"\r
          [stroke]="strokeLine"\r
          [dataLabels]="dataLabelsOff"\r
          [grid]="grid"\r
          [legend]="legend"\r
          [tooltip]="lineTooltip('Alimento', 'Consumo por potrero', 'kg', false)"\r
        />\r
      </article>\r
\r
      <article class="panel-card gauge-card">\r
        <div class="panel-head">\r
          <div>\r
            <span>Eficiencia</span>\r
            <h2>Conversi\xF3n Alimenticia</h2>\r
          </div>\r
        </div>\r
        <div class="gauge-copy">\r
          <strong>{{ data.conversionAlimenticia.valor }} : 1</strong>\r
          <span>{{ data.conversionAlimenticia.unidad }}</span>\r
        </div>\r
      </article>\r
\r
      <article class="panel-card diets-card">\r
        <div class="panel-head">\r
          <div>\r
            <span>Nutrici\xF3n</span>\r
            <h2>Dietas Activas</h2>\r
          </div>\r
          <span class="soft-badge">{{ data.dietasActivas.length }}</span>\r
        </div>\r
        <div class="nutrition-list">\r
          <div class="nutrition-row" *ngFor="let dieta of data.dietasActivas; let i = index">\r
            <span class="nutrition-icon" [style.color]="serieColor(i)">\r
              <svg viewBox="0 0 24 24"><path d="M4 19c6-9 12-9 16 0" /><path d="M8 13c2-4 6-4 8 0" /><path d="M12 5v15" /></svg>\r
            </span>\r
            <div>\r
              <strong>{{ dieta.nombre }}</strong>\r
              <small>{{ dieta.tipoAnimal }} \xB7 {{ dieta.materiaSecaKg || 0 }} kg MS</small>\r
            </div>\r
          </div>\r
        </div>\r
      </article>\r
    </section>\r
\r
    <section class="dashboard-grid row-one">\r
      <article class="panel-card alert-panel">\r
        <div class="panel-head">\r
          <div>\r
            <span>Operaci\xF3n</span>\r
            <h2>Alertas Operativas</h2>\r
          </div>\r
          <span class="soft-badge">\xDAltima actualizaci\xF3n: {{ formatDateTime(data.ultimaActualizacion) }}</span>\r
        </div>\r
        <div class="timeline">\r
          <div class="timeline-row" *ngFor="let alert of data.alertasOperativas" [class]="alert.prioridad.toLowerCase()">\r
            <i></i>\r
            <div>\r
              <strong>{{ alert.titulo }}</strong>\r
              <span>{{ alert.detalle }}</span>\r
            </div>\r
            <small>{{ alert.tipo }}</small>\r
            <time>{{ formatDateTime(alert.fechaGeneracion) }}</time>\r
          </div>\r
          <div class="empty-state" *ngIf="!data.alertasOperativas.length">No hay alertas operativas vigentes.</div>\r
        </div>\r
      </article>\r
    </section>\r
  </ng-container>\r
</section>\r
`, styles: ['/* src/app/pages/reportes-ganaderia-page/reportes-ganaderia-page.component.css */\n:host {\n  display: block;\n}\n.ganadero-dashboard {\n  display: grid;\n  gap: 24px;\n  color: #fff;\n}\n.page-header,\n.panel-card,\n.state-panel {\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  background:\n    radial-gradient(\n      circle at top left,\n      rgba(159, 232, 112, 0.08),\n      transparent 34%),\n    linear-gradient(\n      145deg,\n      rgba(11, 23, 48, 0.98),\n      rgba(8, 18, 37, 0.96));\n  border-radius: 24px;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.24), 0 0 42px rgba(110, 168, 255, 0.05);\n}\n.page-header {\n  display: flex;\n  justify-content: space-between;\n  gap: 24px;\n  align-items: flex-start;\n  padding: 28px;\n}\n.eyebrow {\n  margin: 0 0 10px;\n  color: #9fe870;\n  font-size: 0.78rem;\n  font-weight: 800;\n  letter-spacing: 0.16em;\n  text-transform: uppercase;\n}\nh1,\nh2,\np {\n  margin: 0;\n}\nh1 {\n  font-size: clamp(2.3rem, 4vw, 4rem);\n  line-height: 0.95;\n  letter-spacing: -0.06em;\n}\n.page-header p:not(.eyebrow) {\n  margin-top: 14px;\n  color: #9fb5da;\n  font-size: 1.02rem;\n}\n.header-actions {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: flex-end;\n  gap: 12px;\n}\nbutton {\n  border: 0;\n  color: #fff;\n  font: inherit;\n}\n.ghost-button,\n.primary-button {\n  display: inline-flex;\n  gap: 10px;\n  align-items: center;\n  justify-content: center;\n  min-height: 48px;\n  padding: 0 18px;\n  border-radius: 14px;\n  font-weight: 700;\n  cursor: pointer;\n}\n.ghost-button {\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  background: rgba(255, 255, 255, 0.06);\n}\n.primary-button {\n  background: #4d8f06;\n  box-shadow: 0 14px 36px rgba(159, 232, 112, 0.18);\n}\nsvg {\n  width: 20px;\n  height: 20px;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 1.8;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n.state-panel {\n  padding: 20px 24px;\n  color: #a6b0cf;\n}\n.state-panel.error {\n  color: #ff6b6b;\n}\n.kpi-grid {\n  display: grid;\n  grid-template-columns: repeat(5, minmax(0, 1fr));\n  gap: 14px;\n}\n.kpi-card {\n  display: grid;\n  grid-template-columns: 52px minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 14px;\n  min-height: 112px;\n  padding: 18px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 20px;\n  background:\n    linear-gradient(\n      145deg,\n      rgba(12, 28, 58, 0.94),\n      rgba(8, 18, 37, 0.92));\n}\n.kpi-icon {\n  display: grid;\n  place-items: center;\n  width: 52px;\n  height: 52px;\n  color: #9fe870;\n  border: 1px solid rgba(159, 232, 112, 0.25);\n  border-radius: 16px;\n  background: rgba(159, 232, 112, 0.1);\n}\n.tone-blue .kpi-icon {\n  color: #6ea8ff;\n  border-color: rgba(110, 168, 255, 0.25);\n  background: rgba(110, 168, 255, 0.1);\n}\n.tone-purple .kpi-icon {\n  color: #9a7dff;\n  border-color: rgba(154, 125, 255, 0.25);\n  background: rgba(154, 125, 255, 0.1);\n}\n.tone-orange .kpi-icon {\n  color: #ffb84d;\n  border-color: rgba(255, 184, 77, 0.25);\n  background: rgba(255, 184, 77, 0.1);\n}\n.tone-red .kpi-icon {\n  color: #ff6b6b;\n  border-color: rgba(255, 107, 107, 0.25);\n  background: rgba(255, 107, 107, 0.1);\n}\n.kpi-copy {\n  display: grid;\n  gap: 5px;\n  min-width: 0;\n}\n.kpi-copy span {\n  color: #b7c8ea;\n  font-size: 0.9rem;\n  font-weight: 500;\n}\n.kpi-copy small {\n  color: #9fe870;\n  font-size: 0.76rem;\n}\n.kpi-card > strong {\n  font-size: 1.72rem;\n  letter-spacing: -0.04em;\n  white-space: nowrap;\n}\n.dashboard-grid {\n  display: grid;\n  gap: 18px;\n}\n.row-three {\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n}\n.row-health {\n  grid-template-columns: minmax(0, 5fr) minmax(0, 4fr) minmax(0, 3fr);\n}\n.row-livestock {\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 12px;\n  align-items: stretch;\n}\n.row-four {\n  grid-template-columns: minmax(0, 1.7fr) minmax(240px, 0.65fr) minmax(260px, 0.75fr);\n}\n.row-one {\n  grid-template-columns: minmax(0, 1fr);\n}\n.panel-card {\n  min-height: 330px;\n  padding: 22px;\n  overflow: visible;\n}\n.panel-card.wide {\n  min-height: 360px;\n}\n.row-livestock .panel-card {\n  min-height: 218px;\n  padding: 16px;\n  border-radius: 12px;\n  background:\n    radial-gradient(\n      circle at 12% 0%,\n      rgba(110, 168, 255, 0.08),\n      transparent 34%),\n    linear-gradient(\n      145deg,\n      rgba(9, 24, 50, 0.98),\n      rgba(7, 17, 36, 0.98));\n}\n.row-livestock .panel-head {\n  margin-bottom: 4px;\n}\n.row-livestock .panel-head h2 {\n  margin: 0;\n  font-size: 0.88rem;\n  letter-spacing: -0.02em;\n}\n.compact-chart-card apx-chart {\n  margin: -8px -8px -16px;\n}\n.panel-head {\n  display: flex;\n  justify-content: space-between;\n  gap: 16px;\n  align-items: flex-start;\n  margin-bottom: 22px;\n}\n.panel-head span {\n  color: #9fe870;\n  font-size: 0.72rem;\n  font-weight: 800;\n  letter-spacing: 0.1em;\n  text-transform: uppercase;\n}\n.panel-head h2 {\n  margin-top: 6px;\n  font-size: 1.08rem;\n  letter-spacing: -0.03em;\n}\n.soft-badge {\n  display: inline-flex;\n  align-items: center;\n  min-height: 30px;\n  padding: 0 10px;\n  border: 1px solid rgba(159, 232, 112, 0.18);\n  border-radius: 999px;\n  background: rgba(159, 232, 112, 0.08);\n  color: #9fe870 !important;\n  white-space: nowrap;\n}\n.donut-layout {\n  display: grid;\n  grid-template-columns: 170px minmax(0, 1fr);\n  gap: 24px;\n  align-items: center;\n}\n.donut-layout.compact {\n  grid-template-columns: 140px minmax(0, 1fr);\n}\n.donut-chart,\n.radial-chart {\n  display: grid;\n  place-items: center;\n  width: 170px;\n  height: 170px;\n  border-radius: 50%;\n  box-shadow: 0 0 34px rgba(159, 232, 112, 0.12);\n}\n.donut-chart::before,\n.radial-chart::before {\n  content: "";\n  position: absolute;\n}\n.donut-chart {\n  position: relative;\n}\n.tooltip-host {\n  position: relative;\n}\n.premium-tooltip {\n  position: absolute;\n  z-index: 40;\n  left: 50%;\n  bottom: calc(100% + 16px);\n  width: min(380px, 84vw);\n  min-height: 320px;\n  padding: 28px;\n  color: #fff;\n  border: 1px solid rgba(159, 232, 112, 0.2);\n  border-radius: 24px;\n  background:\n    radial-gradient(\n      circle at 18% 12%,\n      rgba(159, 232, 112, 0.12),\n      transparent 32%),\n    linear-gradient(\n      145deg,\n      rgba(8, 18, 37, 0.98),\n      rgba(11, 23, 48, 0.98));\n  box-shadow: 0 15px 60px rgba(0, 0, 0, 0.35), 0 0 40px rgba(159, 232, 112, 0.08);\n  opacity: 0;\n  pointer-events: none;\n  transform: translate(-50%, 10px) scale(0.98);\n  transition: opacity 160ms ease, transform 160ms ease;\n}\n.tooltip-host:hover > .premium-tooltip,\n.tooltip-host:focus-within > .premium-tooltip {\n  opacity: 1;\n  transform: translate(-50%, 0) scale(1);\n}\n.compact-tooltip {\n  width: min(340px, 78vw);\n  min-height: 240px;\n  padding: 22px;\n}\n.mini-tooltip {\n  width: min(320px, 76vw);\n  min-height: 190px;\n  padding: 20px;\n}\n.tooltip-band {\n  position: absolute;\n  inset: 0 auto auto 0;\n  width: 72%;\n  height: 8px;\n  border-radius: 24px 0 16px 0;\n  background:\n    linear-gradient(\n      90deg,\n      #9fe870,\n      #6ea8ff);\n  box-shadow: 0 0 22px rgba(159, 232, 112, 0.25);\n}\n.tooltip-head {\n  display: grid;\n  grid-template-columns: 64px minmax(0, 1fr) auto;\n  gap: 18px;\n  align-items: center;\n  padding-bottom: 22px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n}\n.tooltip-icon {\n  display: grid;\n  place-items: center;\n  width: 64px;\n  height: 64px;\n  color: #9fe870;\n  border: 1px solid rgba(159, 232, 112, 0.24);\n  border-radius: 50%;\n  background: rgba(159, 232, 112, 0.1);\n  box-shadow: 0 0 28px rgba(159, 232, 112, 0.12);\n}\n.tooltip-icon svg {\n  width: 34px;\n  height: 34px;\n}\n.tooltip-head div {\n  display: grid;\n  gap: 6px;\n  min-width: 0;\n}\n.tooltip-head strong {\n  font-size: 1.65rem;\n  line-height: 1;\n  letter-spacing: -0.04em;\n}\n.premium-tooltip:not(.compact-tooltip):not(.mini-tooltip) .tooltip-head strong {\n  font-size: 2.1rem;\n}\n.tooltip-head small,\n.tooltip-metrics span,\n.tooltip-footer {\n  color: #a6b0cf;\n}\n.tooltip-head em {\n  align-self: start;\n  padding: 8px 12px;\n  color: #9fe870;\n  font-style: normal;\n  font-weight: 800;\n  border: 1px solid rgba(159, 232, 112, 0.2);\n  border-radius: 999px;\n  background: rgba(159, 232, 112, 0.1);\n  white-space: nowrap;\n}\n.tooltip-metrics {\n  display: grid;\n  gap: 14px;\n  margin-top: 22px;\n}\n.tooltip-metrics span {\n  display: grid;\n  grid-template-columns: 18px minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 10px;\n  min-height: 28px;\n}\n.tooltip-metrics span:not(:has(i)) {\n  grid-template-columns: minmax(0, 1fr) auto;\n}\n.tooltip-metrics i,\n.tooltip-footer i {\n  width: 12px;\n  height: 12px;\n  border-radius: 50%;\n  background: #9fe870;\n  box-shadow: 0 0 18px rgba(159, 232, 112, 0.35);\n}\n.tooltip-metrics b {\n  color: #fff;\n  font-size: 1rem;\n  text-align: right;\n}\n.tooltip-footer {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  margin-top: 22px;\n  padding-top: 18px;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n.pie-tooltip {\n  width: min(330px, 84vw);\n  min-height: 390px;\n  padding: 30px 26px 22px;\n  border-color: rgba(159, 232, 112, 0.26);\n  background:\n    radial-gradient(\n      circle at 16% 18%,\n      rgba(159, 232, 112, 0.14),\n      transparent 28%),\n    linear-gradient(\n      145deg,\n      rgba(8, 18, 37, 0.99),\n      rgba(11, 23, 48, 0.99));\n}\n.pie-tooltip .tooltip-band {\n  width: 56%;\n  height: 8px;\n  background: #f4c542;\n  box-shadow: 0 0 22px rgba(244, 197, 66, 0.28);\n}\n.pie-tooltip-head {\n  display: grid;\n  grid-template-columns: 64px minmax(0, 1fr) auto;\n  gap: 18px;\n  align-items: center;\n  padding-bottom: 24px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n}\n.pie-tooltip-title {\n  display: grid;\n  gap: 8px;\n}\n.pie-tooltip-title strong {\n  font-size: 2rem;\n  line-height: 0.96;\n  letter-spacing: -0.06em;\n}\n.pie-tooltip-title small {\n  max-width: 120px;\n  color: #a6b0cf;\n  font-size: 1rem;\n  line-height: 1.35;\n}\n.pie-tooltip-head em {\n  align-self: start;\n  padding: 9px 14px;\n  color: #9fe870;\n  font-style: normal;\n  font-weight: 800;\n  border: 1px solid rgba(159, 232, 112, 0.25);\n  border-radius: 13px;\n  background: rgba(159, 232, 112, 0.11);\n}\n.pie-tooltip-metrics {\n  display: grid;\n  gap: 0;\n  margin-top: 20px;\n}\n.pie-tooltip-metrics div {\n  display: grid;\n  grid-template-columns: 28px minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 12px;\n  min-height: 40px;\n  color: #a6b0cf;\n}\n.pie-tooltip-metrics div + div {\n  border-top: 1px dashed rgba(255, 255, 255, 0.08);\n}\n.pie-tooltip-metrics svg {\n  width: 19px;\n  height: 19px;\n  color: #9fe870;\n}\n.pie-tooltip-metrics strong {\n  color: #fff;\n  font-size: 0.98rem;\n  text-align: right;\n  white-space: nowrap;\n}\n.pie-tooltip-footer {\n  display: flex;\n  gap: 22px;\n  align-items: center;\n  margin-top: 20px;\n  padding-top: 16px;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n.pie-tooltip-footer span {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  color: #a6b0cf;\n  font-size: 0.86rem;\n}\n.pie-tooltip-footer i {\n  width: 13px;\n  height: 13px;\n  border-radius: 50%;\n  box-shadow: 0 0 16px rgba(159, 232, 112, 0.3);\n}\n.donut-chart > div,\n.radial-chart > div {\n  display: grid;\n  place-items: center;\n  width: 108px;\n  height: 108px;\n  border-radius: 50%;\n  background: #081225;\n  text-align: center;\n}\n.donut-chart.small {\n  width: 140px;\n  height: 140px;\n}\n.donut-chart.small > div {\n  width: 88px;\n  height: 88px;\n}\n.donut-chart strong,\n.radial-chart strong {\n  font-size: 1.5rem;\n}\n.donut-chart span,\n.radial-chart span {\n  color: #a6b0cf;\n  font-size: 0.76rem;\n}\n.legend-list,\n.bar-list,\n.occupancy-list,\n.sanitary-list,\n.diet-list,\n.gap-list {\n  display: grid;\n  gap: 12px;\n}\n.legend-row,\n.bar-label,\n.occ-title,\n.occ-meta,\n.sanitary-row,\n.cost-line,\n.series-legend {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n}\n.legend-row {\n  display: grid;\n  grid-template-columns: 10px minmax(0, 1fr) auto auto;\n}\n.legend-row i,\n.series-legend i {\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n}\n.legend-row span,\n.bar-label span,\n.occ-title span,\n.cost-line span,\n.gap-list span,\n.timeline span {\n  color: #a6b0cf;\n}\n.legend-row small,\n.occ-meta,\n.sanitary-row span,\n.sanitary-row small {\n  color: #7f90b2;\n}\n.bar-row {\n  display: grid;\n  gap: 8px;\n}\n.bar-track {\n  height: 10px;\n  overflow: hidden;\n  border-radius: 999px;\n  background: rgba(255, 255, 255, 0.07);\n}\n.bar-track i {\n  display: block;\n  height: 100%;\n  border-radius: inherit;\n  background:\n    linear-gradient(\n      90deg,\n      #9fe870,\n      #6ea8ff);\n  box-shadow: 0 0 24px rgba(159, 232, 112, 0.24);\n}\n.bar-track.warning i {\n  background: #ffb84d;\n}\n.bar-track.orange i {\n  background: #ff8a4d;\n}\n.bar-track.danger i {\n  background: #ff6b6b;\n}\n.occupancy-row {\n  display: grid;\n  gap: 8px;\n}\n.occupancy-card .panel-head {\n  margin-bottom: 14px;\n}\n.occupancy-header,\n.occupancy-card .occupancy-row {\n  display: grid;\n  grid-template-columns: minmax(74px, 0.9fr) 54px 54px minmax(92px, 1fr) 34px;\n  align-items: center;\n  gap: 8px;\n}\n.occupancy-header {\n  min-height: 24px;\n  color: #7f90b2;\n  font-size: 0.61rem;\n}\n.occupancy-header span:last-child {\n  grid-column: 4 / 6;\n  text-align: center;\n}\n.occupancy-card .occupancy-list {\n  gap: 0;\n}\n.occupancy-card .occupancy-row {\n  min-height: 29px;\n  padding: 3px 0;\n  border-top: 1px solid rgba(255, 255, 255, 0.055);\n}\n.occupancy-card .occupancy-row .occ-name {\n  color: #fff;\n  font-size: 0.72rem;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.occupancy-card .occupancy-row strong {\n  color: #dbe8ff;\n  font-size: 0.7rem;\n  font-weight: 600;\n  text-align: right;\n}\n.occupancy-card .occupancy-row small {\n  color: #fff;\n  font-size: 0.68rem;\n  text-align: right;\n}\n.occupancy-card .bar-track {\n  height: 7px;\n}\n.sanitary-row {\n  min-height: 52px;\n  padding-bottom: 12px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06);\n}\n.sanitary-row > div {\n  display: grid;\n  gap: 4px;\n}\n.danger {\n  color: #ff6b6b !important;\n}\n.warning {\n  color: #ffb84d !important;\n}\n.triple-metric {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 12px;\n}\n.triple-metric div {\n  display: grid;\n  gap: 8px;\n  padding: 16px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 18px;\n  background: rgba(255, 255, 255, 0.04);\n}\n.triple-metric span {\n  color: #a6b0cf;\n  font-size: 0.78rem;\n}\n.triple-metric strong,\n.big-number {\n  font-size: 2.4rem;\n  letter-spacing: -0.05em;\n}\n.cost-line {\n  margin-top: 22px;\n  padding-top: 18px;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n.row-health .panel-card {\n  min-height: 218px;\n  padding: 16px;\n  border-radius: 12px;\n  background:\n    radial-gradient(\n      circle at 12% 0%,\n      rgba(110, 168, 255, 0.08),\n      transparent 34%),\n    linear-gradient(\n      145deg,\n      rgba(9, 24, 50, 0.98),\n      rgba(7, 17, 36, 0.98));\n}\n.row-health .panel-head {\n  margin-bottom: 10px;\n}\n.row-health .panel-head h2 {\n  margin: 0;\n  font-size: 0.88rem;\n  letter-spacing: -0.02em;\n}\n.sanitary-grid-head,\n.sanitary-card .sanitary-row {\n  display: grid;\n  grid-template-columns: minmax(70px, 0.75fr) minmax(56px, 0.75fr) minmax(92px, 1.15fr) minmax(92px, 1.15fr);\n  align-items: center;\n  gap: 10px;\n}\n.sanitary-grid-head {\n  margin-bottom: 7px;\n  color: #7f90b2;\n  font-size: 0.58rem;\n}\n.sanitary-bars-list {\n  display: grid;\n  gap: 7px;\n}\n.sanitary-card .sanitary-row {\n  min-height: 23px;\n  padding: 0;\n  border: 0;\n}\n.sanitary-card .sanitary-row strong {\n  overflow: hidden;\n  color: #dbe8ff;\n  font-size: 0.68rem;\n  font-weight: 600;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.sanitary-meter {\n  position: relative;\n  height: 14px;\n  overflow: hidden;\n  border-radius: 4px;\n  background: rgba(255, 255, 255, 0.055);\n}\n.sanitary-meter i {\n  display: block;\n  height: 100%;\n  min-width: 14px;\n  border-radius: inherit;\n}\n.sanitary-meter b {\n  position: absolute;\n  inset: 0;\n  display: grid;\n  place-items: center;\n  color: #fff;\n  font-size: 0.58rem;\n  font-weight: 800;\n}\n.danger-meter i {\n  background: #ff6b6b;\n}\n.warning-meter i {\n  background: #ffb84d;\n}\n.green-meter i {\n  background: #69c94f;\n}\n.sanitary-axis {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  margin: 8px 0 0 calc(25% + 10px);\n  color: #7f90b2;\n  font-size: 0.58rem;\n}\n.treatment-card .panel-head {\n  margin-bottom: 14px;\n}\n.treatment-list {\n  display: grid;\n  gap: 10px;\n}\n.treatment-row {\n  display: grid;\n  grid-template-columns: 34px minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 12px;\n  min-height: 43px;\n  padding-bottom: 10px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.055);\n}\n.treatment-row:last-child {\n  border-bottom: 0;\n}\n.treatment-row span:not(.treatment-icon) {\n  color: #dbe8ff;\n  font-size: 0.74rem;\n}\n.treatment-row strong {\n  color: #fff;\n  font-size: 0.88rem;\n}\n.treatment-icon {\n  display: grid;\n  place-items: center;\n  width: 30px;\n  height: 30px;\n  border-radius: 9px;\n}\n.treatment-icon svg {\n  width: 17px;\n  height: 17px;\n}\n.treatment-row.tone-green .treatment-icon {\n  color: #9fe870;\n  border: 1px solid rgba(159, 232, 112, 0.22);\n  background: rgba(159, 232, 112, 0.09);\n}\n.treatment-row.tone-blue .treatment-icon {\n  color: #6ea8ff;\n  border: 1px solid rgba(110, 168, 255, 0.22);\n  background: rgba(110, 168, 255, 0.09);\n}\n.treatment-row.tone-red .treatment-icon {\n  color: #ff6b6b;\n  border: 1px solid rgba(255, 107, 107, 0.22);\n  background: rgba(255, 107, 107, 0.09);\n}\n.row-reproductive .panel-card {\n  min-height: 218px;\n  padding: 16px;\n  border-radius: 12px;\n  background:\n    radial-gradient(\n      circle at 12% 0%,\n      rgba(154, 125, 255, 0.08),\n      transparent 34%),\n    linear-gradient(\n      145deg,\n      rgba(9, 24, 50, 0.98),\n      rgba(7, 17, 36, 0.98));\n}\n.row-reproductive .panel-head {\n  margin-bottom: 4px;\n}\n.row-reproductive .panel-head h2 {\n  margin: 0;\n  font-size: 0.88rem;\n  letter-spacing: -0.02em;\n}\n.partos-card apx-chart {\n  display: block;\n  margin: -4px -8px -18px;\n}\n.repro-table-head,\n.repro-row {\n  display: grid;\n  grid-template-columns: 82px minmax(0, 1fr) 34px 32px;\n  align-items: center;\n  gap: 9px;\n}\n.repro-table-head {\n  margin: 8px 0 9px;\n  color: #7f90b2;\n  font-size: 0.6rem;\n}\n.repro-table-head span:first-child {\n  grid-column: 1 / 3;\n}\n.repro-list {\n  display: grid;\n  gap: 9px;\n}\n.repro-row {\n  min-height: 22px;\n}\n.repro-name {\n  overflow: hidden;\n  color: #fff;\n  font-size: 0.68rem;\n  font-weight: 600;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.repro-track {\n  height: 8px;\n  overflow: hidden;\n  border-radius: 999px;\n  background: rgba(255, 255, 255, 0.07);\n}\n.repro-track i {\n  display: block;\n  height: 100%;\n  min-width: 0;\n  border-radius: inherit;\n  box-shadow: 0 0 18px rgba(159, 232, 112, 0.16);\n}\n.repro-row strong,\n.repro-row small {\n  color: #fff;\n  font-size: 0.68rem;\n  font-weight: 700;\n  text-align: right;\n}\n.repro-row small {\n  color: #a6b0cf;\n}\n.genealogy-card {\n  overflow: hidden;\n}\n.genealogy-layout {\n  display: grid;\n  grid-template-columns: 170px minmax(0, 1fr);\n  gap: 20px;\n  align-items: center;\n}\n.genealogy-ring {\n  position: relative;\n  display: grid;\n  place-items: center;\n  width: 136px;\n  height: 136px;\n  margin-left: 8px;\n  border-radius: 50%;\n  background:\n    radial-gradient(\n      circle at center,\n      #081225 0 53%,\n      transparent 54%),\n    conic-gradient(#69c94f 0 calc(var(--value) * 1%), rgba(255, 255, 255, 0.08) 0 100%);\n  box-shadow: 0 0 30px rgba(105, 201, 79, 0.12);\n}\n.genealogy-ring::before {\n  content: "";\n  position: absolute;\n  inset: 13px;\n  border-radius: 50%;\n  background: #081225;\n}\n.genealogy-ring div {\n  position: relative;\n  z-index: 1;\n  display: grid;\n  place-items: center;\n  max-width: 104px;\n  text-align: center;\n}\n.genealogy-ring strong {\n  color: #fff;\n  font-size: 2rem;\n  line-height: 1;\n  letter-spacing: -0.06em;\n}\n.genealogy-ring span {\n  margin-top: 6px;\n  color: #dbe8ff;\n  font-size: 0.68rem;\n  line-height: 1.15;\n}\n.genealogy-gap-list {\n  display: grid;\n  gap: 8px;\n  min-width: 0;\n}\n.genealogy-gap-list span {\n  display: grid;\n  grid-template-columns: 8px minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 9px;\n  min-height: 24px;\n  padding-bottom: 6px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.055);\n}\n.genealogy-gap-list span:last-child {\n  border-bottom: 0;\n}\n.genealogy-gap-list i {\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  box-shadow: 0 0 14px rgba(159, 232, 112, 0.22);\n}\n.genealogy-gap-list em {\n  overflow: hidden;\n  color: #dbe8ff;\n  font-size: 0.68rem;\n  font-style: normal;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.genealogy-gap-list strong {\n  color: #fff;\n  font-size: 0.74rem;\n}\n.stack-list {\n  display: grid;\n  gap: 15px;\n}\n.stack-row {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;\n  gap: 8px 14px;\n}\n.stack-row span {\n  color: #a6b0cf;\n}\n.stack-row i {\n  grid-column: 1 / -1;\n  height: 9px;\n  border-radius: 999px;\n  background:\n    linear-gradient(\n      90deg,\n      var(--c),\n      transparent var(--w));\n  box-shadow: 0 0 18px color-mix(in srgb, var(--c) 35%, transparent);\n}\n.series-legend {\n  display: flex;\n  justify-content: space-between;\n  gap: 10px;\n  color: #7f90b2;\n  font-size: 0.78rem;\n}\n.radial-layout {\n  display: grid;\n  grid-template-columns: 160px minmax(0, 1fr);\n  gap: 20px;\n  align-items: center;\n}\n.radial-chart {\n  position: relative;\n  width: 160px;\n  height: 160px;\n}\n.gap-list span {\n  display: flex;\n  justify-content: space-between;\n  gap: 10px;\n  padding-bottom: 9px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06);\n}\n.gauge-card,\n.diets-card {\n  display: flex;\n  flex-direction: column;\n}\n.gauge-copy {\n  display: grid;\n  place-items: center;\n  gap: 12px;\n  margin: auto 0;\n  text-align: center;\n}\n.gauge-copy strong {\n  font-size: 2.4rem;\n  letter-spacing: -0.05em;\n}\n.gauge-copy span {\n  color: #a6b0cf;\n  font-size: 0.78rem;\n}\n.diet-list span {\n  display: flex;\n  justify-content: space-between;\n  gap: 10px;\n  padding: 10px 0;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06);\n}\n.diet-list small {\n  color: #9fe870;\n}\n.nutrition-list {\n  display: grid;\n  gap: 10px;\n}\n.nutrition-row {\n  display: grid;\n  grid-template-columns: 34px minmax(0, 1fr);\n  align-items: center;\n  gap: 12px;\n  min-height: 50px;\n  padding: 10px 12px;\n  border: 1px solid rgba(255, 255, 255, 0.07);\n  border-radius: 14px;\n  background: rgba(255, 255, 255, 0.035);\n}\n.nutrition-icon {\n  display: grid;\n  place-items: center;\n  width: 32px;\n  height: 32px;\n  border: 1px solid color-mix(in srgb, currentColor 28%, transparent);\n  border-radius: 10px;\n  background: color-mix(in srgb, currentColor 10%, transparent);\n}\n.nutrition-icon svg {\n  width: 18px;\n  height: 18px;\n}\n.nutrition-row div {\n  display: grid;\n  gap: 4px;\n  min-width: 0;\n}\n.nutrition-row strong {\n  overflow: hidden;\n  color: #fff;\n  font-size: 0.82rem;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.nutrition-row small {\n  overflow: hidden;\n  color: #a6b0cf;\n  font-size: 0.7rem;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.series-legend {\n  flex-wrap: wrap;\n  justify-content: flex-start;\n}\n.series-legend span {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  color: #a6b0cf;\n}\napx-chart {\n  display: block;\n  width: 100%;\n}\n::ng-deep .ganadero-dashboard .apexcharts-canvas,\n::ng-deep .ganadero-dashboard .apexcharts-svg {\n  background: transparent !important;\n}\n::ng-deep .ganadero-dashboard .apexcharts-tooltip {\n  overflow: visible !important;\n  color: #fff !important;\n  border: 0 !important;\n  background: transparent !important;\n  box-shadow: none !important;\n}\n::ng-deep .ganadero-dashboard .apexcharts-tooltip-title {\n  display: none !important;\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-card {\n  width: 330px;\n  min-height: 290px;\n  padding: 28px 24px 20px;\n  color: #fff;\n  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);\n  border-radius: 24px;\n  background:\n    radial-gradient(\n      circle at 16% 18%,\n      color-mix(in srgb, var(--accent) 16%, transparent),\n      transparent 28%),\n    linear-gradient(\n      145deg,\n      rgba(8, 18, 37, 0.99),\n      rgba(11, 23, 48, 0.99));\n  box-shadow: 0 15px 60px rgba(0, 0, 0, 0.35), 0 0 40px color-mix(in srgb, var(--accent) 12%, transparent);\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-band {\n  position: absolute;\n  inset: 0 auto auto 0;\n  width: 58%;\n  height: 8px;\n  border-radius: 24px 0 16px 0;\n  background: var(--accent);\n  box-shadow: 0 0 22px color-mix(in srgb, var(--accent) 35%, transparent);\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-head {\n  display: grid;\n  grid-template-columns: 58px minmax(0, 1fr) auto;\n  gap: 16px;\n  align-items: center;\n  padding-bottom: 20px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-icon {\n  display: grid;\n  place-items: center;\n  width: 58px;\n  height: 58px;\n  color: var(--accent);\n  border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);\n  border-radius: 50%;\n  background: color-mix(in srgb, var(--accent) 12%, transparent);\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-icon svg {\n  width: 31px;\n  height: 31px;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 1.8;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-head strong {\n  display: block;\n  font-size: 1.7rem;\n  line-height: 0.98;\n  letter-spacing: -0.05em;\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-head small {\n  display: block;\n  margin-top: 6px;\n  color: #a6b0cf;\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-head em {\n  align-self: start;\n  padding: 8px 12px;\n  color: #9fe870;\n  font-style: normal;\n  font-weight: 800;\n  border: 1px solid rgba(159, 232, 112, 0.25);\n  border-radius: 13px;\n  background: rgba(159, 232, 112, 0.11);\n  white-space: nowrap;\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-rows {\n  display: grid;\n  gap: 0;\n  margin-top: 18px;\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-row {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;\n  gap: 12px;\n  align-items: center;\n  min-height: 38px;\n  color: #a6b0cf;\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-row + .apex-tooltip-row {\n  border-top: 1px dashed rgba(255, 255, 255, 0.08);\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-row strong {\n  color: #fff;\n  text-align: right;\n  white-space: nowrap;\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-footer {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 14px;\n  margin-top: 18px;\n  padding-top: 16px;\n  color: #a6b0cf;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-footer span {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n}\n::ng-deep .ganadero-dashboard .apex-tooltip-footer i {\n  width: 12px;\n  height: 12px;\n  border-radius: 50%;\n  box-shadow: 0 0 16px rgba(159, 232, 112, 0.3);\n}\n.timeline {\n  display: grid;\n  gap: 12px;\n}\n.timeline-row {\n  display: grid;\n  grid-template-columns: 14px minmax(0, 1fr) auto auto;\n  gap: 14px;\n  align-items: center;\n  min-height: 62px;\n  padding: 12px 0;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06);\n}\n.timeline-row i {\n  width: 12px;\n  height: 12px;\n  border-radius: 50%;\n  background: #9fe870;\n  box-shadow: 0 0 20px rgba(159, 232, 112, 0.4);\n}\n.timeline-row.alta i {\n  background: #ff6b6b;\n  box-shadow: 0 0 20px rgba(255, 107, 107, 0.4);\n}\n.timeline-row.media i {\n  background: #ffb84d;\n  box-shadow: 0 0 20px rgba(255, 184, 77, 0.4);\n}\n.timeline-row div {\n  display: grid;\n  gap: 4px;\n}\n.timeline-row small {\n  color: #9fe870;\n}\n.timeline-row time {\n  color: #7f90b2;\n  font-size: 0.8rem;\n  white-space: nowrap;\n}\n.empty-state {\n  padding: 18px;\n  color: #a6b0cf;\n  border: 1px dashed rgba(255, 255, 255, 0.1);\n  border-radius: 18px;\n}\n@media (max-width: 1537px) {\n  .kpi-grid {\n    grid-template-columns: repeat(5, minmax(0, 1fr));\n  }\n  .kpi-card {\n    grid-template-columns: 44px minmax(0, 1fr) auto;\n    gap: 10px;\n    padding: 14px;\n  }\n  .kpi-icon {\n    width: 44px;\n    height: 44px;\n  }\n  .kpi-card > strong {\n    font-size: 1.35rem;\n  }\n}\n@media (max-width: 1280px) {\n  .page-header {\n    flex-direction: column;\n  }\n  .header-actions {\n    justify-content: flex-start;\n  }\n  .kpi-grid,\n  .row-livestock,\n  .row-three,\n  .row-four {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n}\n@media (max-width: 760px) {\n  .kpi-grid,\n  .row-livestock,\n  .row-three,\n  .row-four {\n    grid-template-columns: 1fr;\n  }\n  .donut-layout,\n  .radial-layout {\n    grid-template-columns: 1fr;\n  }\n  .timeline-row {\n    grid-template-columns: 14px minmax(0, 1fr);\n  }\n  .timeline-row small,\n  .timeline-row time {\n    grid-column: 2;\n  }\n}\n/*# sourceMappingURL=reportes-ganaderia-page.component.css.map */\n'] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ReportesGanaderiaPageComponent, { className: "ReportesGanaderiaPageComponent", filePath: "src/app/pages/reportes-ganaderia-page/reportes-ganaderia-page.component.ts", lineNumber: 21 });
})();
export {
  ReportesGanaderiaPageComponent
};
//# sourceMappingURL=chunk-ONOIFFMP.js.map
