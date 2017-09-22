namespace RadarSoft {
    export class DrawArea extends DrawableObject {
        columnStyle: Brush;
        evenRowStyle: Brush;
        oddRowStyle: Brush;
        chart: Chart;
        chartManager: ChartManager;

        constructor(chart: Chart, position: Position, size: Size, brush: Brush, oddRowStyle: Brush, evenRowStyle: Brush, columnStyle: Brush) {
            super(new Descriptor(position, size, brush));
            this.chartManager = chart.chartManager;
            this.chart = chart;
            this.oddRowStyle = oddRowStyle;
            this.evenRowStyle = evenRowStyle;
            this.columnStyle = columnStyle;

        }
        beginPath(layer: Layer) {
            var ctx = layer.GetContext();
            ctx.beginPath();
            ctx.rect(this.descriptor.position.left, this.descriptor.position.top,
                this.descriptor.size.width, this.descriptor.size.height);
        }

        drawColumns(ctx: CanvasRenderingContext2D, axis: AxisCore) {
            var marksCount = axis.getMarksCount();
            this.columnStyle.apply(ctx);
            for (var i = 0; i < marksCount; i++) {
                ctx.beginPath();
                var currX = axis.getCanvasValueAt(i);
                var y = this.descriptor.position.top;
                ctx.moveTo(currX, y);
                y += this.descriptor.size.height;
                ctx.lineTo(currX, y);
                ctx.stroke();
            }
        }

        drawRows(ctx: CanvasRenderingContext2D, axis: AxisCore) {
            var marksCount = axis.getMarksCount();
            this.oddRowStyle.apply(ctx);
            for (var i = 1; i < marksCount; i += 2) {
                var currY = axis.getCanvasValueAt(i);
                var nextY = axis.getCanvasValueAt(i - 1);
                var rowHeight = Math.abs(nextY - currY);
                ctx.fillRect(this.descriptor.position.left, currY, this.descriptor.size.width, rowHeight);
                ctx.strokeRect(this.descriptor.position.left, currY, this.descriptor.size.width, rowHeight);
            }
        }

        fillBackground(ctx: CanvasRenderingContext2D) {
            this.evenRowStyle.apply(ctx);
            ctx.fillRect(this.descriptor.position.left, this.descriptor.position.top,
                this.descriptor.size.width, this.descriptor.size.height);
        }

        beginDraw(layer: Layer) {
            var ctx = layer.GetContext();

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, this.chart.size.width, this.chart.size.height);
            ctx.restore();

            var mainAxisSystem = this.chart.axisSystems.GetMainSystem();

            this.fillBackground(ctx);
            if (this.chartManager.chartType != ChartTypes.pie && !(this.chartManager.chartsCount == 1 && this.chartManager.charts[0].series.length == 0)) {
                this.drawRows(ctx, mainAxisSystem.GetAxisY());
                this.drawColumns(ctx, mainAxisSystem.GetAxisX());
            }
            this.descriptor.brush.apply(ctx);
            var imgData = ctx.getImageData(this.descriptor.position.left,
                this.descriptor.position.top, this.descriptor.size.width,
                this.descriptor.size.height);
            ctx.putImageData(imgData, this.descriptor.position.left,
                this.descriptor.position.top);
            this.descriptor.brush.apply(ctx);
            ctx.strokeRect(this.descriptor.position.left, this.descriptor.position.top,
                this.descriptor.size.width, this.descriptor.size.height);

        }
    }
}