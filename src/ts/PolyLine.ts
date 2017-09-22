namespace RadarSoft {
    export class PolyLine extends DrawableObject {
        beginPath(layer: Layer) {
            var ctx = layer.GetContext();
            ctx.beginPath();
            ctx.closePath();
        }

        beginDraw(layer: Layer) {
            var ctx = layer.GetContext();
            var startX = this.descriptor.position.left;
            var startY = this.descriptor.position.top;
            var endX = this.endpoint.left;
            var endY = this.endpoint.top;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            this.descriptor.brush.apply(ctx);
            var i;
            var j;
            if (startX != endX) {
                startY = this.getY(startX);
                ctx.moveTo(startX, startY);
                if (this.isDotted) {
                    i = startX;
                    while (i <= endX - 1) {
                        for (j = i; ((j - i) < 20) && (i <= endX - 1); j++) {
                            ctx.lineTo(j + 1, this.getY(j + 1));
                        }
                        j += 5;
                        ctx.moveTo(j, this.getY(j));
                        i = j;
                    }
                } else {
                    for (i = startX; i <= endX - 1; i++) {
                        ctx.lineTo(i + 1, this.getY(i + 1));
                    }
                }
            } else {
                if (startY != endY) {
                    var start = 0;
                    var end = 0;
                    if (startY < endY) {
                        start = startY;
                        end = endY;
                    } else {
                        start = endY;
                        end = startY;
                    }
                    if (this.isDotted) {
                        i = start;
                        while (i <= end - 1) {
                            for (j = i; ((j - i) < 20) && (i <= end - 1); j++) {
                                ctx.lineTo(startX, j + 1);
                            }
                            j += 5;
                            ctx.moveTo(startX, j);
                            i = j;
                        }
                    } else {
                        for (i = start; i <= end - 1; i++) {
                            ctx.lineTo(startX, i + 1);
                        }
                    }
                }
            }

            ctx.stroke();
            ctx.beginPath();
            ctx.closePath();
        }

        getY(x: number): number {
            var res = this.spline.Func(x);
            return res;
        }

        isDotted: boolean;
        endpoint: Position;
        spline: Trend;

        constructor(descriptor: Descriptor, spline: Trend, endpoint: Position) {
            super(descriptor);
            this.spline = spline;
            this.endpoint = endpoint;
            this.isDotted = false;
        }
    }
}