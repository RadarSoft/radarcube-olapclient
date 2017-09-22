namespace RadarSoft {
    export class Area extends DrawableObject {
        endpoint: Position;

        constructor(descriptor: Descriptor, endpoint: Position) {
            super(descriptor);
            this.endpoint = endpoint;
        }

        beginPath(layer: Layer) {
            var ctx = layer.GetContext();
            ctx.beginPath();
            ctx.closePath();
        }

        beginDraw(layer: Layer) {
            var ctx = layer.GetContext();
            var oldOpacity = ctx.globalAlpha;
            var startX = this.descriptor.position.left;
            var startY = this.descriptor.position.top;
            var endX = this.endpoint.left;
            var endY = this.endpoint.top;
            ctx.beginPath();
            this.descriptor.brush.apply(ctx);
            ctx.moveTo(startX, layer.position.top + layer.size.height);
            ctx.lineTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.lineTo(endX, layer.position.top + layer.size.height);
            ctx.closePath();
            ctx.globalAlpha = 0.4;
            ctx.fill();
            ctx.beginPath();
            ctx.closePath();
            ctx.globalAlpha = oldOpacity;
        }
    }
}