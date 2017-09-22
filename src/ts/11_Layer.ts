namespace RadarSoft {
    export class Layer {
        name: string;
        size: Size;
        position: Position;
        chart: Chart;
        shapes: DrawableObject[];
        context: CanvasRenderingContext2D;
        canvas: HTMLCanvasElement;

        constructor(name?: string) {
            this.canvas = createCanvas();
            if (this.canvas == null)
                return;
            this.context = this.canvas.getContext("2d");
            //this.context.translate(0.5, 0.5);
            this.canvas.style.position = "absolute";
            this.shapes = [];
            this.chart = null;
            this.position = new Position(0, 0);
            this.size = new Size(0, 0);
            this.name = name;
        }

        afterDraw() {
            this.cropLayer();
        }

        beforeDraw() {
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.translate(0.5, 0.5);
            // this.shapes.sort(this.sortFunc);
        }

        sortFunc(a: any, b: any) {
            var res = 0;
            if (!b.descriptor.size) {
                res = 1;
            } else if (!a.descriptor.size) {
                res = -1;
            } else if (b.descriptor.size && a.descriptor.size) {
                if (b.descriptor.size.height && a.descriptor.size.height) {
                    res = a.descriptor.position.top - b.descriptor.position.top;
                }
            }
            return res;
        }

        RemoveShapes() {
            this.shapes.splice(0, this.shapes.length);
        }

        Destroy(chartManager: ChartManager) {
            chartManager.jqRS_OG("#" + this.canvas.id).remove();
        }

        Clear() {
            var ctx = this.GetContext();
            ctx.clearRect(0, 0, this.chart.size.width, this.chart.size.height);
        }

        cropLayer() {
            var ctx = this.GetContext();
            var imgData = ctx.getImageData(this.position.left, this.position.top,
                this.size.width, this.size.height);
            ctx.clearRect(0, 0, this.chart.size.width, this.chart.size.height);
            ctx.putImageData(imgData, this.position.left, this.position.top);
        }

        GetPoint(canvasPnt: any): DrawableObject {
            var shape = null;
            if (this.context.isPointInPath(canvasPnt.x, canvasPnt.y)) {
                shape = this.shapes[0];
            }

            return shape;
        }

        RemoveShape(shape: DrawableObject) {
            var ind = this.shapes.indexOf(shape);
            if (ind >= 0) {
                this.shapes.splice(ind, 1);
            }
        }

        AddShape(shape: DrawableObject) {
            shape.SetLayer(this);
            this.shapes.push(shape);
        }

        GetCanvas(): HTMLCanvasElement {
            return this.canvas;
        }

        GetContext(): CanvasRenderingContext2D {
            return this.context;
        }

        Draw() {
            this.beforeDraw();
            for (var i = 0; i < this.shapes.length; i++) {
                this.shapes[i].Draw(this);
            }
            this.afterDraw();
        }
    }
}