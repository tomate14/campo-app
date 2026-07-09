export interface ApexTooltipRow {
  label: string;
  value: string;
}

export interface ApexTooltipLegend {
  label: string;
  color: string;
}

export interface ApexTooltipConfig {
  title: string;
  subtitle: string;
  status?: string;
  showStatus?: boolean;
  accent: string;
  rows: ApexTooltipRow[];
  legends: ApexTooltipLegend[];
}

export function buildApexTooltipHtml(config: ApexTooltipConfig): string {
  const rows = config.rows
    .map((row) => `<div class="apex-tooltip-row"><span>${row.label}</span><strong>${row.value}</strong></div>`)
    .join('');
  const legends = config.legends
    .map((legend) => `<span><i style="background:${legend.color}"></i>${legend.label}</span>`)
    .join('');
  const status = config.showStatus === false ? '' : `<em>${config.status ?? ''}</em>`;
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
