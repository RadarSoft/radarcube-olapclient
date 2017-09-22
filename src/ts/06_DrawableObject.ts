namespace RadarSoft {
    export class DrawableObject {
        isDrawed: boolean;
        layer: Layer;
        descriptor: Descriptor;

        constructor(descriptor?: Descriptor) {
            this.descriptor = descriptor;
            this.layer = null;
            this.isDrawed = false;
        }

        GetPosition(): Position {
            return this.descriptor.position;
        }

        GetLayer(): Layer {
            return this.layer;
        }

        SetLayer(layer: Layer) {
            this.layer = layer;
        }

        CheckPath(layer: Layer, canvasPnt: CanvasPoint): any {
            var pnts = [];
            var ctx = layer.GetContext();
            this.Path(layer);
            if (ctx.isPointInPath(canvasPnt.x, canvasPnt.y)) {
                pnts.push(this);
            }
            return pnts;
        }

        beginPath(layer: Layer) {
            var ctx = layer.GetContext();
            this.descriptor.brush.apply(ctx);
            ctx.rect(this.descriptor.position.left, this.descriptor.position.top,
                this.descriptor.size.width, this.descriptor.size.height);
        }

        beginDraw(layer: Layer) {
            var ctx = layer.GetContext();
            this.descriptor.brush.apply(ctx);
            ctx.fillRect(this.descriptor.position.left,
                this.descriptor.position.top, this.descriptor.size.width,
                this.descriptor.size.height);
        }

        sortAsc(a: string, b: string) {
            var res = 0;
            var a_int = parseInt(a);
            var b_int = parseInt(b);
            if (a_int && b_int) {
                res = parseInt(a) - parseInt(b);
            }
            return res;
        }

        Path(layer: Layer) {
            if (this.descriptor) {
                this.beginPath(layer);
            }
        }

        Draw(layer: Layer) {
            if (this.descriptor) {
                var ctx = layer.GetContext();
                ctx.save();
                this.beginDraw(layer);
                this.isDrawed = true;
                ctx.restore();
            }
        }
    }
}