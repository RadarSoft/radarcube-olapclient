namespace RadarSoft {
    export class Pie extends Shape {
        endAngle: number;
        startAngle: number;
        radius: number;

        constructor(descriptor: Descriptor, radius: number, startAngle: number, endAngle: number) {
            super(descriptor);
            this.radius = radius;
            this.startAngle = startAngle;
            this.endAngle = endAngle;
        }

        beginPath(layer: Layer) {
            var ctx = layer.GetContext();
            ctx.beginPath();
            ctx.closePath();
            var x = this.descriptor.position.left;
            var y = this.descriptor.position.top;
            ctx.moveTo(x, y);
            ctx.lineTo(this.radius * Math.cos(this.startAngle) + x, this.radius
                * Math.cos(Math.PI / 2 - this.startAngle) + y);
            ctx.arc(x, y, this.radius, this.startAngle, this.endAngle, false);
        }

        beginDraw(layer: Layer) {
            var ctx = layer.GetContext();
            ctx.beginPath();
            ctx.closePath();
            var x = this.descriptor.position.left;
            var y = this.descriptor.position.top;
            if (this.descriptor.gradientBrush) {
                this.descriptor.brush.setFillStyle(this.descriptor.gradientBrush
                    .createRadialGradient(ctx, x, y, this.radius, x, y,
                    this.radius * 0.3));
            }
            ctx.moveTo(x, y);
            ctx.lineTo(this.radius * Math.cos(this.startAngle) + x, this.radius
                * Math.cos(Math.PI / 2 - this.startAngle) + y);
            ctx.arc(x, y, this.radius, this.startAngle, this.endAngle, false);
            // this.brush.apply(ctx, this.descriptor.useShadow);
            // ctx.fill();
            // ctx.stroke();
            this.descriptor.brush.apply(ctx, !this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
        }
    }
}