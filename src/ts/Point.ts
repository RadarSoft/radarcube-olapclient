namespace RadarSoft {
    export class Point extends Shape {
        type: any;

        constructor(hidePoints: boolean, descriptor: Descriptor, type: any, hideStroke?: boolean) {
            super(descriptor);
            if (hidePoints) {
                var strokeColor = hideStroke ? 'transparent' : descriptor.brush.strokeStyle;
                var holeBrush = new Brush(strokeColor, 'transparent', { lineWidth: 1, opacity: 1 });
                descriptor.brush = cpy(holeBrush);
            }
            this.type = type ? type : 0;
        }

        beginPath(layer: Layer) {
            var ctx = layer.context;
            ctx.beginPath();
            ctx.closePath();
            var x = this.descriptor.position.left;
            var y = this.descriptor.position.top;
            var pSize = this.descriptor.size.width;
            ctx.arc(x, y, pSize / 2, 0, 2 * Math.PI);
        }

        drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, pSize: Size) {
            if (this.descriptor.gradientBrush) {
                this.descriptor.brush.setFillStyle(this.descriptor.gradientBrush
                    .createRadialGradient(ctx, x, y, pSize.width / 2, x, y,
                        (pSize.width / 2) * 0.3));
            }

            var R = pSize.width / 2;
            var r = 0.87 * R;

            ctx.moveTo(x, y - R);
            ctx.lineTo(x + r, y - R / 2);
            ctx.lineTo(x + r, y + R / 2);
            ctx.lineTo(x, y + R);
            ctx.lineTo(x - r, y + R / 2);
            ctx.lineTo(x - r, y - R / 2);
            ctx.lineTo(x, y - R);
            this.descriptor.brush.apply(ctx, this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
            this.descriptor.brush.apply(ctx, !this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
        }

        drawPentagon(ctx: CanvasRenderingContext2D, x: number, y: number, pSize: Size) {
            if (this.descriptor.gradientBrush) {
                this.descriptor.brush.setFillStyle(this.descriptor.gradientBrush
                    .createRadialGradient(ctx, x, y, pSize.width / 2, x, y,
                        (pSize.width / 2) * 0.3));
            }

            var R = pSize.width / 2;
            var r = 0.81 * R;
            var t = 1.382 * R;
            ctx.moveTo(x, y - R);
            ctx.lineTo(x + R * Math.cos(Math.PI * 18 / 180), y - R
                * Math.sin(Math.PI * 18 / 180));
            ctx.lineTo(x + t / 2, y + r);
            ctx.lineTo(x - t / 2, y + r);
            ctx.lineTo(x - R * Math.cos(Math.PI * 18 / 180), y - R
                * Math.sin(Math.PI * 18 / 180));
            ctx.lineTo(x, y - R);
            this.descriptor.brush.apply(ctx, this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
            this.descriptor.brush.apply(ctx, !this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
        }

        drawSquare(ctx: CanvasRenderingContext2D, x: number, y: number, pSize: Size) {
            if (this.descriptor.gradientBrush) {
                this.descriptor.brush.setFillStyle(this.descriptor.gradientBrush
                    .createRadialGradient(ctx, x, y, pSize.width / 2, x, y,
                        (pSize.width / 2) * 0.3));
            }
            ctx
                .rect(x - pSize.width / 2, y - pSize.width / 2, pSize.width,
                    pSize.width);
            this.descriptor.brush.apply(ctx, this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
            this.descriptor.brush.apply(ctx, !this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
        }

        drawReverseTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, pSize: Size) {
            if (this.descriptor.gradientBrush) {
                this.descriptor.brush.setFillStyle(this.descriptor.gradientBrush
                    .createRadialGradient(ctx, x, y, pSize.width / 2, x, y,
                        (pSize.width / 2) * 0.3));
            }

            var a = 0.866 * pSize.width;
            var r = 0.289 * a;

            ctx.moveTo(x, y + pSize.width / 2);
            ctx.lineTo(x + a / 2, y - r);
            ctx.lineTo(x - a / 2, y - r);
            ctx.lineTo(x, y + pSize.width / 2);
            this.descriptor.brush.apply(ctx, this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
            this.descriptor.brush.apply(ctx, !this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
        }

        drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, pSize: Size) {
            if (this.descriptor.gradientBrush) {
                this.descriptor.brush.setFillStyle(this.descriptor.gradientBrush
                    .createRadialGradient(ctx, x, y, pSize.width / 2, x, y,
                        (pSize.width / 2) * 0.3));
            }

            var a = 0.866 * pSize.width;
            var r = 0.289 * a;

            ctx.moveTo(x, y - pSize.width / 2);
            ctx.lineTo(x + a / 2, y + r);
            ctx.lineTo(x - a / 2, y + r);
            ctx.lineTo(x, y - pSize.width / 2);
            this.descriptor.brush.apply(ctx, this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
            this.descriptor.brush.apply(ctx, !this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
        }

        drawConcentricCircle(ctx: CanvasRenderingContext2D, x: number, y: number, pSize: Size) {
            if (this.descriptor.gradientBrush) {
                this.descriptor.brush.setFillStyle(this.descriptor.gradientBrush
                    .createRadialGradient(ctx, x, y, pSize.width / 2, x, y,
                        (pSize.width / 2) * 0.3));
            }
            ctx.arc(x, y, pSize.width / 2, 0, 2 * Math.PI);
            this.descriptor.brush.apply(ctx, this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
            this.descriptor.brush.apply(ctx, !this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            var oldOp = ctx.globalCompositeOperation;
            ctx.globalCompositeOperation = 'xor';
            ctx.arc(x, y, pSize.width / 3, 0, 2 * Math.PI);
            this.descriptor.brush.apply(ctx, this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
            this.descriptor.brush.apply(ctx, !this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
            ctx.globalCompositeOperation = oldOp;
        }

        drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, pSize: Size) {
            if (this.descriptor.gradientBrush) {
                this.descriptor.brush.setFillStyle(this.descriptor.gradientBrush
                    .createRadialGradient(ctx, x, y, pSize.width / 2, x, y,
                        (pSize.width / 2) * 0.3));
            }
            ctx.arc(x, y, pSize.width / 2, 0, 2 * Math.PI);
            this.descriptor.brush.apply(ctx, this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
            this.descriptor.brush.apply(ctx, !this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
        }

        beginDraw(layer: Layer) {
            var ctx = layer.GetContext();
            ctx.beginPath();
            var x = this.descriptor.position.left;
            var y = this.descriptor.position.top;
            var pSize = this.descriptor.size;
            switch (this.type) {
            case pointTypes.triangle:
                this.drawTriangle(ctx, x, y, pSize);
                break;
            case pointTypes.square:
                this.drawSquare(ctx, x, y, pSize);
                break;
            case pointTypes.pentagon:
                this.drawPentagon(ctx, x, y, pSize);
                break;
            case pointTypes.hexagon:
                this.drawHexagon(ctx, x, y, pSize);
                break;
            case pointTypes.reverseTriangle:
                this.drawReverseTriangle(ctx, x, y, pSize);
                break;
            case pointTypes.concentricCircle:
                this.drawConcentricCircle(ctx, x, y, pSize);
            default:
                this.drawCircle(ctx, x, y, pSize);
                break;
            }

        }
    }
}