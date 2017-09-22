namespace RadarSoft {
    export class Bar extends Shape {
        beginPath(layer: Layer) {
            var ctx = layer.GetContext();
            ctx.beginPath();
            ctx.closePath();
            var x = this.descriptor.position.left + 3;
            var y = this.descriptor.position.top;
            var height = this.descriptor.size.height;
            var width = this.descriptor.size.width - 6;
            ctx.rect(x, y, width, height);
        }

        beginDraw(layer: Layer) {
            var oldOpacity = this.descriptor.brush.opacity;
            this.descriptor.brush.opacity = 0.8;
            var ctx = layer.GetContext();
            ctx.beginPath();
            var x = this.descriptor.position.left + 3;
            var y = this.descriptor.position.top;
            var height = this.descriptor.size.height;
            var width = this.descriptor.size.width - 6;
            if (this.descriptor.gradientBrush) {
                this.descriptor.brush.setFillStyle(this.descriptor.gradientBrush
                    .createLinearGradient(ctx, x, y, x, y + height));
            }
            ctx.rect(x, y, width, height);
            this.descriptor.brush.apply(ctx, this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
            this.descriptor.brush.apply(ctx, !this.descriptor.useShadow);
            ctx.fill();
            ctx.stroke();
            this.descriptor.brush.opacity = oldOpacity;
            ctx.globalCompositeOperation = "source-over";
        }

        constructor(descriptor: Descriptor) {
            super(descriptor);
        }
    }
}