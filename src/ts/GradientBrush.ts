namespace RadarSoft {
    export class GradientBrush {
        firstColorStop: ColorStop;
        secondColorStop: ColorStop;

        constructor(firstColorStop: ColorStop, secondColorStop: ColorStop) {
            this.firstColorStop = firstColorStop;
            this.secondColorStop = secondColorStop;
        }

        createLinearGradient(ctx: any, x0: any, y0: any, x1: any, y1: any) {
            var grd = ctx.createLinearGradient(x0, y0, x1, y1);
            grd.addColorStop(this.firstColorStop.position,
                this.firstColorStop.color);
            grd.addColorStop(this.secondColorStop.position,
                this.secondColorStop.color);
            return grd;
        }

        createRadialGradient(ctx: any, x0: any, y0: any, r0: any, x1: any, y1: any, r1: any) {
            var grd = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
            grd.addColorStop(this.firstColorStop.position,
                this.firstColorStop.color);
            grd.addColorStop(this.secondColorStop.position,
                this.secondColorStop.color);
            return grd;
        }
    }
}