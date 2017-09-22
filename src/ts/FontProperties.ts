namespace RadarSoft {
    export class FontProperties {
        brush: Brush;
        size: number;
        chartManager: ChartManager;

        constructor(size?: Size, color?: string, chartManager?: ChartManager) {
            this.chartManager = chartManager;
            this.size = this.chartManager ? this.chartManager.settings.fontProperties.fontSize : 9;
            this.brush = new Brush(color, color);
        }

        apply(ctx: CanvasRenderingContext2D) {
            this.brush.apply(ctx);
            if (this.chartManager)
                ctx.font = this.chartManager.settings.fontProperties.html5Font;
            ctx.textBaseline = "middle";
        }
    }
}