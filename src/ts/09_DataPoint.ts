namespace RadarSoft {
    export class DataPoint {
        series: any;
        details: any;
        func: DataFunction;
        dimension: string;
        measure: number;
        chartManager: ChartManager;

        constructor(chartManager: ChartManager);
        constructor(chartManager?: ChartManager, dimension?: string, measure?: number, parentFunc?: DataFunction, details?: any, series?: any) {
            this.chartManager = chartManager;
            this.measure = measure;
            this.dimension = dimension;
            this.func = parentFunc;
            this.details = details;
            this.series = series;
        }

        getBrush() {
            var brush = null;
            if (this.details.ColorValue != 1e-300) {
                var colorInfo = this.chartManager.tOLAPChart.getColorByMeasureValue(this.details.ColorValue);
                if (colorInfo) {
                    brush = new Brush(colorInfo.borderColor, colorInfo.color, { lineWidth: 1, opacity: 0.5 });
                    return brush;
                }
                else
                    return this.func.brush;
            }

            return this.func.brush;

        }

        getSize() {

            var size = this.chartManager.GetDefaultPointSize();
            if (this.details.SizeValue != 1e-300) {
                var layout = this.chartManager.tOLAPChart.getLayout();
                var cellset = this.chartManager.tOLAPChart.getCellSet();
                if (layout.SizeAxisItem) {
                    var sizeMembers = this.chartManager.tOLAPChart._seriesInfo[layout.SizeAxisItem].sizeMembers;
                    var minSizeValue = sizeMembers.SizeMinValue;
                    var maxSizeValue = sizeMembers.SizeMaxValue;
                    var sizeK = maxSizeValue != minSizeValue ?
                        this.chartManager.minMultiplier + (this.chartManager.maxMultiplier - this.chartManager.minMultiplier) * (this.details.SizeValue - minSizeValue) / (maxSizeValue - minSizeValue) :
                        this.chartManager.maxMultiplier;


                    size.width *= sizeK;
                    size.height *= sizeK;
                }
            } else if (this.func.sizeInfo) {
                size.width *= this.func.sizeInfo.SizeMultiplier;
                size.height *= this.func.sizeInfo.SizeMultiplier;
            }

            return size;

        }

        getShape() {

        }

    }
}