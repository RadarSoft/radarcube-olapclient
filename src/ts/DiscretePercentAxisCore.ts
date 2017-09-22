namespace RadarSoft {
    export class DiscretePercentAxisCore extends DiscreteAxisCore {

        constructor(descriptor: Descriptor) {
            super(null, descriptor);
        }
        getMarkSize(ctx: CanvasRenderingContext2D) {
            var max = this.max();
            var min = this.min();
            var maxSize = 0;
            var i = 0;
            var rangeCount = this.getMarksCount() - 1;
            var step = Math.round((max - min) / rangeCount);
            this.descriptor.font.apply(ctx);
            if (step > 0) {
                for (i = min; i <= rangeCount * step + min; i += step) {
                    var cur = i - min;
                    var mark = Math.round(cur * 100 / (max - min));
                    var currSize = ctx.measureText(mark.toString()).width;
                    if (currSize > maxSize) {
                        maxSize = currSize;
                    }
                }
            } else {
                maxSize = ctx.measureText("100").width;
            }

            return maxSize;
        }

        drawAxis(layer: Layer) {
            var ctx = layer.GetContext();
            ctx.translate(0.5, 0.5);
            var scale = this.getScale();
            this.descriptor.brush.apply(ctx);
            var max = this.max();
            var min = this.min();
            var x = 0;
            var y = 0;
            var i = 0;
            var step = this.getStep();
            for (i = min; i <= max; i += step) {
                var cur = i - min;
                var mark = Math.round(cur * 100 / (max - min));
                if (this.descriptor.orientation == Orientation.horizontalOrientation) {
                    x = this.getCanvasValue(i);
                    this.drawVerticalMark(ctx, x, mark.toString());
                } else if (this.descriptor.orientation == Orientation.verticalOrientation) {
                    y = this.getCanvasValue(i);
                    this.drawHorizontalMark(ctx, y, mark.toString());
                }
            }
        }
    }
}