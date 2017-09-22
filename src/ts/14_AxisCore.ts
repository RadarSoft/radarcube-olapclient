namespace RadarSoft {
    export abstract class AxisCore extends DrawableObject {
        stepV: number;
        scaleV: number;
        markSizeV: number;
        minV: number;
        maxV: number;
        sin: number;
        cos: number;
        testctx: CanvasRenderingContext2D;
        availSpace: number;
        angle: number;
        chartManager: ChartManager;

        constructor(chartManager?: ChartManager, descriptor?: Descriptor) {
            super(descriptor);
            this.chartManager = chartManager;
            SelectableObject.call(this, descriptor);
            this.angle = 0;
            this.availSpace = 0;
            var cavas = createCanvas();
            if (cavas == null)
                return;
            this.testctx = cavas.getContext('2d');
        }

        abstract getCanvasValue(axisVal: number | string): number;

        abstract popVoidMeasure(): void;

        abstract pushVoidMeasure(): void;

        abstract getMarksCount(): number;

        GetType() {
            return this.descriptor.type;
        }

        Hide() {
            this.descriptor.visible = false;
        }

        Show() {
            this.descriptor.visible = true;
        }

        SetMarks(marks: any) {
            if (this.descriptor) {
                this.descriptor.SetMarks(marks);
                this.computeAll();
            }
        }

        computeAll() {
            this.minV = this.computeMin();
            this.maxV = this.computeMax();
            var canv = createCanvas();
            var ctx = canv.getContext("2d");
            this.markSizeV = this.computeMarkSize(ctx);
            this.scaleV = this.computeScale();
            this.stepV = this.computeStep();
        }

        computeStep() {
            return 1;
        }

        getStep() {
            if (!this.stepV) {
                this.stepV = this.computeStep();
            }
            return this.stepV;
        }

        computeScale() {
            return 1;
        }

        getScale() {
            if (!this.scaleV) {
                this.scaleV = this.computeScale();
            }
            return this.scaleV;
        }

        computeMarkSize(ctx: CanvasRenderingContext2D): number {
            return 30;
        }

        getMarkSize(ctx: CanvasRenderingContext2D): number {
            if (!this.markSizeV) {
                this.markSizeV = this.computeMarkSize(ctx);
            }
            return this.markSizeV;
        }

        getTitleSize(ctx: CanvasRenderingContext2D): Size {
            var titleSize = new Size(0, 0);
            if (this.descriptor.title) {
                var oldFont = ctx.font;
                this.descriptor.font.apply(ctx);
                ctx.font = "bold " + ctx.font;
                titleSize = new Size(ctx.measureText(this.descriptor.title).width, 1.5 * this.descriptor.font.size);
                ctx.font = oldFont;
            }
            return titleSize;
        }

        computeMin(): number {
            return 0;
        }

        min(): number {
            if (!this.minV) {
                this.minV = this.computeMin();
            }
            return this.minV;
        }

        computeMax(): number {
            return 1;
        }

        max(): number {
            if (!this.maxV) {
                this.maxV = this.computeMax();
            }
            return this.maxV;
        }

        CorrectScale(max: number, min: number) {
            alert(max + " " + min);
        }

        getCanvasValueAt(i: number): number {
            return 0;
        }

        beginDraw(layer: Layer) {
            if (this.descriptor.visible) {
                this.drawAxis(layer);
            }
        }

        GetMarks(): string[] {
            return this.descriptor ? this.descriptor.marks : [];
        }

        GetSize(): Size {
            return this.descriptor.size;
        }

        SetSize(newSize: Size) {
            this.descriptor.size = cpy(newSize);
        }

        GetPosition(): Position {
            return this.descriptor.position;
        }

        SetPosition(newPos: Position) {
            this.descriptor.position = cpy(newPos);
        }

        beginPath(layer: Layer) {
            var ctx = layer.GetContext();
            ctx.beginPath();
            ctx.rect(this.descriptor.position.left, this.descriptor.position.top,
                this.descriptor.size.width, this.descriptor.size.height);
        }

        drawHorizontalMark(ctx: CanvasRenderingContext2D, y: number, mark: string) {
            var start = 0;
            var markerSize = 0;
            var labelWidth = 0;
            var margin = 0;
            switch (this.descriptor.dock) {
            case DockStyle.left:
                start = this.descriptor.position.left + this.descriptor.size.width;
                markerSize = -this.descriptor.markerSize;
                this.descriptor.font.apply(ctx);
                labelWidth = -ctx.measureText(mark).width;
                margin = 2;
                break;
            case DockStyle.right:
                start = this.descriptor.position.left;
                markerSize = this.descriptor.markerSize;
                labelWidth = 0;
                margin = -2;
                break;
            }

            var x = start;
            ctx.beginPath();
            ctx.moveTo(x, y);
            x += markerSize;
            ctx.lineTo(x + margin, y);
            this.descriptor.brush.apply(ctx);
            ctx.stroke();
            x += labelWidth;
            this.descriptor.font.apply(ctx);
            ctx.fillText(mark, Math.round(x), Math.round(y)); //- this.descriptor.font.size
            //			/ 2));
        }

        drawYTitle(ctx: CanvasRenderingContext2D) {
            var titleSize = this.getTitleSize(ctx);
            var transX = -Math.round((this.descriptor.size.height + titleSize.width) / 2);
            var transY = titleSize.height;
            var x = 0;
            var y = 0;//this.descriptor.titleMargin / 2;
            ctx.save();
            ctx.rotate(-Math.PI / 2);
            ctx.translate(transX, transY);
            //ctx.translate(0.5, 0.5);
            this.descriptor.font.apply(ctx);
            ctx.font = "bold " + ctx.font;
            //this.descriptor.brush.apply(ctx);
            ctx.fillText(this.descriptor.title, x, y);
            ctx.restore();
        }

        drawXTitle(ctx: CanvasRenderingContext2D) {
            var titleSize = this.getTitleSize(ctx);
            var availW = this.descriptor.margin * 1.5;
            var w = this.getMarkSize(ctx);
            var angle = 0;
            var cos = 1;
            var sin = 0;

            if (w > availW) {
                angle = -Math.acos(availW / w);
                cos = Math.cos(angle);
                sin = Math.sin(angle);
            }

            var start = 0;
            var margin = 0;

            switch (this.descriptor.dock) {
            case DockStyle.top:
                start = this.descriptor.position.top + this.descriptor.size.height;
                margin = 2;
                break;
            case DockStyle.bottom:
                start = this.descriptor.position.top;
                margin = this.descriptor.markerSize
                    + Math.abs(w * sin)
                    + titleSize.height
                    + this.descriptor.titleMargin;
                break;
            }

            var x = (this.descriptor.size.width - titleSize.width) / 2;
            var y = start + margin;
            //ctx.translate(0.5, 0);
            this.descriptor.font.apply(ctx);
            ctx.font = "bold " + ctx.font;
            //this.descriptor.brush.apply(ctx);
            ctx.fillText(this.descriptor.title, x, y);
        }

        computeAngle(p0?: number) {
            var availW = this.descriptor.margin * 1.5;
            var ctx = createCanvas().getContext('2d');
            this.descriptor.brush.apply(ctx);
            var w = this.getMarkSize(ctx);
            this.angle = 0;
            this.cos = 1;
            this.sin = 0;

            if (w > availW) {
                this.angle = -Math.acos(availW / w);
                this.cos = Math.cos(this.angle);
                this.sin = Math.sin(this.angle);
            }
        }

        drawVerticalMark(ctx: CanvasRenderingContext2D, x: number, mark: string) {
            ctx.save();
            ctx.beginPath();
            var start = 0;
            var markerSize = 0;
            var fontSize = 0;
            var margin = 0;

            switch (this.descriptor.dock) {
            case DockStyle.top:
                start = this.descriptor.position.top + this.descriptor.size.height;
                markerSize = -this.descriptor.markerSize;
                fontSize = -1;
                margin = 2;
                break;
            case DockStyle.bottom:
                start = this.descriptor.position.top;
                markerSize = this.descriptor.markerSize;
                fontSize = this.descriptor.font.size;
                margin = -2;
                break;
            }
            var y = start;
            ctx.moveTo(x, y);
            y += markerSize;
            ctx.lineTo(x, y + margin);
            this.descriptor.brush.apply(ctx);
            ctx.stroke();


            this.descriptor.font.apply(ctx);

            var w = this.getMarkSize(ctx);
            var realW = ctx.measureText(mark).width;

            var h = fontSize;
            var x0 = x;
            x -= realW / 2;
            var y0 = y + h / 2;
            var x1 = x0 + (0 - x0) * this.cos - (0 - y0) * this.sin;
            var y1 = y0 + (0 - x0) * this.sin + (0 - y0) * this.cos;
            ctx.translate(3, Math.abs(realW * this.sin / 2) + h * this.cos / 2);
            ctx.translate(Math.round(x1), Math.round(y1));
            ctx.rotate(this.angle);
            ctx.fillText(mark, Math.round(x), Math.round(y));
            ctx.restore();
        }

        SetOrientation(orientation: Orientation) {
            this.descriptor.orientation = orientation;
        }

        correctSize(ctx: CanvasRenderingContext2D) {
            //var cavas = createCanvas();
            //if (cavas == null)
            //    return;
            //var ctx = cavas.getContext('2d');
            var size = this.descriptor.size;
            switch (this.descriptor.orientation) {
            case Orientation.verticalOrientation:
            {
                var oldSize = size.width;
                size.width = this.getMarkSize(ctx) + this.descriptor.markerSize
                    + (this.descriptor.title ? this.getTitleSize(ctx).height + 1.5 * this.descriptor.titleMargin : 0);

                this.descriptor.position.left += oldSize - size.width;
                break;
            }
            case Orientation.horizontalOrientation:
            {
                var availW = this.descriptor.margin * 1.5;
                this.descriptor.brush.apply(ctx);
                var w = this.getMarkSize(ctx);
                var angle = 0;
                var cos = 1;
                var sin = 0;

                if (w > availW) {
                    angle = -Math.acos(availW / w);
                    cos = Math.cos(angle);
                    sin = Math.sin(angle);
                }

                var oldSize = size.height;
                size.height = this.descriptor.markerSize
                    + this.descriptor.font.size * 1.5 + Math.abs(w * sin)
                    + (this.descriptor.title ? this.getTitleSize(ctx).height + this.descriptor.titleMargin : 0);
                this.descriptor.position.top += oldSize - size.height;
                break;
            }
            }
        }

        drawAxis(layer: Layer) {
            throw new Error("Not implemented"); 
        }

        getRowHeight(): number {
            var intCount = this.descriptor.marks.length - 1;
        	return (this.descriptor.size.height - this.descriptor.position.top) / intCount;
        }

        getColumnWidth(): number {
            var width = 1;
            if (this.descriptor.marks.length > 1) {
                var first = this.getCanvasValueAt(0);
                var second = this.getCanvasValueAt(1);
                width = Math.floor(Math.abs(second - first));
            }
            return width;// (this.descriptor.size.width - this.descriptor.position.left) / intCount;
        }
    }
}