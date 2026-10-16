/**
 * Chart colors that follow Toolpad/MUI color-scheme CSS variables.
 * Do not bake theme.palette.* into SVG fills — with cssVariables that often
 * stays stuck on the light scheme and produces dark text on dark charts.
 */

export const chartTickFill = "var(--mui-palette-text-secondary)";
export const chartLabelFill = "var(--mui-palette-text-primary)";
export const chartGridStroke =
  "color-mix(in srgb, var(--mui-palette-text-primary) 14%, transparent)";
export const chartPaper = "var(--mui-palette-background-paper)";
export const chartDivider = "var(--mui-palette-divider)";

export const chartTooltipStyle = {
  background: chartPaper,
  border: `1px solid ${chartDivider}`,
  color: chartLabelFill,
};

/** Spread onto the dashboard page Box so Recharts + MUI X Charts inherit scheme. */
export const chartThemeSx = {
  "& .recharts-cartesian-axis-tick-value, & .recharts-cartesian-axis-tick-value tspan, & .recharts-text, & .recharts-text tspan, & .recharts-label, & .recharts-label tspan":
    {
      fill: `${chartTickFill} !important`,
    },
  "& .recharts-cartesian-axis-line, & .recharts-cartesian-axis-tick-line": {
    stroke: `${chartDivider} !important`,
  },
  "& .recharts-legend-item-text": {
    color: `${chartTickFill} !important`,
    fill: `${chartTickFill} !important`,
  },
  "& .recharts-default-tooltip": {
    backgroundColor: `${chartPaper} !important`,
    borderColor: `${chartDivider} !important`,
    color: `${chartLabelFill} !important`,
  },
  "& .recharts-tooltip-label, & .recharts-tooltip-item, & .recharts-tooltip-item-name, & .recharts-tooltip-item-value":
    {
      color: `${chartLabelFill} !important`,
    },
  "& .MuiChartsAxis-tickLabel, & .MuiChartsAxis-tickLabel tspan, & .MuiChartsAxis-label, & .MuiChartsAxis-label tspan":
    {
      fill: `${chartTickFill} !important`,
    },
  "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": {
    stroke: `${chartDivider} !important`,
  },
  "& .MuiChartsLegend-root text, & .MuiChartsLegend-label, & .MuiChartsLegend-series text, & .MuiChartsLegend-series tspan":
    {
      fill: `${chartLabelFill} !important`,
      color: `${chartLabelFill} !important`,
    },
  "& .MuiPieArcLabel-root, & .MuiChartsArcLabel-root": {
    fill: `${chartLabelFill} !important`,
  },
};

export const pieChartSlotProps = {
  legend: {
    labelStyle: {
      fill: chartLabelFill,
      color: chartLabelFill,
      fontSize: 12,
    },
  },
};
