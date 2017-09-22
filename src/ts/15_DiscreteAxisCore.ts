namespace RadarSoft {
    export class DiscreteAxisCore extends AxisCore {
        minVal: string;

        constructor(chartManager?: ChartManager, descriptor?: Descriptor) {
            super(chartManager, descriptor);
        }

        popVoidMeasure() { }

        pushVoidMeasure() { }

        getStep() {
            var min = this.min();
            var max = this.max();
            var rangeCount = this.getMarksCount() - 1;
            var step = floor10((max - min) / rangeCount);
            if (step == 0) {
                step = Math.floor((max - min) / rangeCount);
                if (step == 0)
                    step = 1;
            }
            return step;
        }

        AddTo(val: number, delta: number) {
            var res = 0;
            res = this.getCanvasValue(val + Math.abs(delta));
            return res;
        }

        CorrectScale(max: number, min: number) {
            var rangeCount = this.getMarksCount() - 1;
            var axMax = Math.ceil(max * 1.1);
            var axMin = Math.floor(min * 0.9);
            var stepFract = (axMax - axMin) % rangeCount;
            if (stepFract != 0) {
                axMax += rangeCount - stepFract;
            }
            if (!axMax) {
                axMax = 1;
            }
            if (!axMin) {
                axMin = 0;
            }
            this.SetMarks([axMin.toString(), axMax.toString()]);
        }

        drawAxis(layer: Layer) {
            var ctx = layer.GetContext();
            ctx.translate(0.5, 0.5);
            var scale = this.getScale();
            this.descriptor.brush.apply(ctx);
            if (this.descriptor.orientation == Orientation.horizontalOrientation && this.descriptor.title)
                this.drawXTitle(ctx);
            else if (this.descriptor.orientation == Orientation.verticalOrientation && this.descriptor.title)
                this.drawYTitle(ctx);

            var max = this.max();
            var min = this.min();
            var i: number = min;
            var x = 0;
            var y = 0;
            var step = this.getStep();
            //for (i = min; i <= max; i += step) {	    
            for (var j = 0; j < this.getMarksCount(); j++) {
                if (this.descriptor.orientation == Orientation.horizontalOrientation) {
                    x = this.getCanvasValue(i);
                    if (i == min) {
                        this.computeAngle(x);
                    }
                    this.drawVerticalMark(ctx, x, i.toString());

                } else if (this.descriptor.orientation == Orientation.verticalOrientation) {
                    y = this.getCanvasValue(i);
                    this.drawHorizontalMark(ctx, y, i.toString());
                }
                i += step;
            }
        }

        getScale() {
            var scale = 1;
            if (this.descriptor.orientation == Orientation.horizontalOrientation) {

                scale = (this.descriptor.size.width - 2 * this.descriptor.margin) / (this.max() - this.min());

            } else if (this.descriptor.orientation == Orientation.verticalOrientation) {
                scale = (this.descriptor.size.height - 2 * this.descriptor.margin) / (this.max() - this.min());
            }
            return scale;
        }

        getCanvasValueAt(i: number) {
            var maxI = this.getMarksCount();
            if (i > maxI - 1) {
                alert('error at getCanvasValueAt');
                return null;
            }
            var step = this.getStep();
            var min = this.min();
            var val = min + step * i;
            return this.getCanvasValue(val);
        }

        getCanvasValue(val: number): number {
            var canvasVal = 0;
            switch (this.descriptor.orientation) {
                case Orientation.verticalOrientation:
                var ywmin = this.descriptor.position.top + this.descriptor.margin;
                var ywmax = this.descriptor.position.top + this.descriptor.size.height
                    - this.descriptor.margin;
                canvasVal = ywmax - (ywmax - ywmin) * (val - this.min())
                    / (this.max() - this.min());
                break;
                case Orientation.horizontalOrientation:
                var xwmin = this.descriptor.position.left + this.descriptor.margin;
                var xwmax = this.descriptor.position.left + this.descriptor.size.width
                    - this.descriptor.margin;
                canvasVal = xwmin + (xwmax - xwmin) * (val - this.min())
                    / (this.max() - this.min());
                break;
            }

            return Math.round(canvasVal);
        }

        computeMarkSize(ctx: CanvasRenderingContext2D) {
            var maxSize = 0;
            this.descriptor.font.apply(ctx);
            var min = this.min();
            var max = this.max();
            var i = 0;
            var rangeCount = this.getMarksCount() - 1;
            var step = this.getStep();
            for (i = min; i <= rangeCount * step + min; i += step) {
                var currSize = ctx.measureText(i.toString()).width;
                if (currSize > maxSize) {
                    maxSize = currSize;
                }
            }

            return maxSize;
        }

        getMarksCount() {
            return this.chartManager.tOLAPChart._yMarkCount;
        }

        computeMin(): number {
            var tmpArray:string[] = this.descriptor.marks.slice(0, this.descriptor.marks.length);
            tmpArray.sort(this.descriptor.sortAsc);
            this.minVal = tmpArray[0];
            //return this.minVal;
            return floor10(parseFloat(this.minVal));
        }

        computeMax(): number {
            var tmpArray = this.descriptor.marks.slice(0, this.descriptor.marks.length);
            tmpArray.sort(this.descriptor.sortAsc);
            var maxVal = tmpArray[tmpArray.length - 1];
            return parseFloat(maxVal);
        }
    }
}