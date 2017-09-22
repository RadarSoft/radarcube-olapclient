namespace RadarSoft {
    export class InfinityAxisCore extends AxisCore {
        scaleVal: number;
        minVal: string;
        maxVal: string;

        constructor(chartManager: ChartManager, descriptor?: Descriptor) {
            super(chartManager, descriptor);
        }

        CorrectScale(max: number, min: number) {
            // if (this.descriptor.marks[this.descriptor.marks.length - 1] == "") {
            // this.descriptor.marks.pop();
            // }
            // if (this.descriptor.marks[this.descriptor.marks.length - 1] != "") {
            // this.descriptor.marks.push("");
            // }
        }

        popVoidMeasure() {
            if (this.descriptor.marks[this.descriptor.marks.length - 1] == "") {
                this.descriptor.marks.pop();
            }
        }

        pushVoidMeasure() {
            if (this.descriptor.marks[this.descriptor.marks.length - 1] != "") {
                this.descriptor.marks.push("");
            }
        }

        drawAxis(layer: Layer) {
            var ctx = layer.GetContext();
            ctx.translate(0.5, 0.5);

            if (this.descriptor.orientation == Orientation.horizontalOrientation && this.descriptor.title)
                this.drawXTitle(ctx);
            else if (this.descriptor.orientation == Orientation.verticalOrientation && this.descriptor.title)
                this.drawYTitle(ctx);

            var maxLoop = this.descriptor.marks.length;
            var scale = this.getScale();
            var x = 0;
            var y = 0;
            var i = 0;
            for (i = 0; i < maxLoop; i++) {
                if (this.descriptor.orientation == Orientation.horizontalOrientation) {
                    x = this.getCanvasValue(this.descriptor.marks[i]);
                    if (i == 0) {
                        this.computeAngle(x);
                    }
                    this.drawVerticalMark(ctx, x, this.descriptor.marks[i]);
                } else if (this.descriptor.orientation == Orientation.verticalOrientation) {
                    y = this.getCanvasValue(this.descriptor.marks[i]);
                    this.drawHorizontalMark(ctx, y, this.descriptor.marks[i]);
                }
            }
        }

        getScale(): number {
            var scale = 1;
            var marksCount = this.getMarksCount();
            if (this.descriptor.orientation == Orientation.horizontalOrientation) {
                scale = (this.descriptor.size.width - 2 * this.descriptor.margin) / (marksCount);
            } else if (this.descriptor.orientation == Orientation.verticalOrientation) {
                scale = (this.descriptor.size.height - 2 * this.descriptor.margin) / (marksCount);
            }
            this.scaleVal = scale;
            return this.scaleVal;
        }

        getCanvasValueAt(i: number): number {
            var maxI = this.getMarksCount();
            if (i > maxI - 1) {
                alert('error at getCanvasValueAt');
                return null;
            }
            return this.getCanvasValue(this.descriptor.marks[i]);
        }

        getCanvasValue(axisVal: string): number {
            var canvasVal = 0;
            var val = this.descriptor.marks.indexOf(axisVal);
            var max = this.descriptor.marks.length - 1;
            var min = 0;
            if (max == min) {
                max = min + 1;
            }
            switch (this.descriptor.orientation) {
                case Orientation.verticalOrientation:
                var ywmin = this.descriptor.position.top + this.descriptor.margin;
                var ywmax = this.descriptor.position.top + this.descriptor.size.height
                    - this.descriptor.margin;
                canvasVal = ywmax - (ywmax - ywmin) * (val - min) / (max - min);
                break;
                case Orientation.horizontalOrientation:
                var xwmin = this.descriptor.position.left + this.descriptor.margin;
                var xwmax = this.descriptor.position.left + this.descriptor.size.width
                    - this.descriptor.margin;
                canvasVal = xwmin + (xwmax - xwmin) * (val - min) / (max - min);
                break;
            }
            return Math.round(canvasVal);
        }

        getMarkSize(ctx: CanvasRenderingContext2D): number {
            var maxSize = 0;
            var i = 0;
            var maxLoop = this.descriptor.marks.length;
            this.descriptor.font.apply(ctx);
            for (i = 0; i < maxLoop; i++) {
                var currSize = ctx.measureText(this.descriptor.marks[i]).width;
                if (currSize > maxSize) {
                    maxSize = currSize;
                }
            }
            return maxSize;
        }

        getMarksCount(): number {
            return this.descriptor.marks.length;
        }

        sortAsc(a: string, b: string) {
            return 0;
        }

        sortDesc(a: string, b: string) {
            return 0;
        }

        min(): number {
            this.minVal = this.descriptor.marks[0];
            return parseInt(this.minVal);
        }

        max(): number {
            this.maxVal = this.descriptor.marks[this.descriptor.marks.length - 1];
            return parseInt(this.maxVal);
        }
    }
}