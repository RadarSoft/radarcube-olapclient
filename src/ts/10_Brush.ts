namespace RadarSoft {
    export class Brush {
        strokeStyle: string;
        fillStyle: string;
        lineCap: any;
        lineJoin: any;
        lineWidth: number;
        miterLimit: any;
        shadowColor: string;
        shadowOffsetX: number;
        shadowOffsetY: number;
        shadowBlur: number;
        shadowOpacity: number;
        opacity: number;

        constructor(strokeColor?: string, fillColor?: string, lineCap?: any, lineJoin?: any, lineWidth?: number,
            miterLimit?: any, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number, shadowBlur?: number,
            shadowOpacity?: number, opacity?: number) {
            this.strokeStyle = strokeColor;
            this.fillStyle = fillColor;
            this.lineCap = lineCap;
            this.lineJoin = lineJoin;
            this.lineWidth = lineWidth;
            this.miterLimit = miterLimit;
            this.shadowColor = shadowColor;
            this.shadowOffsetX = shadowOffsetX;
            this.shadowOffsetY = shadowOffsetY;
            this.shadowBlur = shadowBlur;
            this.shadowOpacity = shadowOpacity;
            this.opacity = opacity;
        }

        apply(ctx: CanvasRenderingContext2D, useShadow?: boolean) {
            this.setDefaults(ctx);
            if (this.strokeStyle) {
                ctx.strokeStyle = this.strokeStyle;
            }
            if (this.fillStyle) {
                ctx.fillStyle = this.fillStyle;
            }
            if (this.lineCap) {
                ctx.lineCap = this.lineCap;
            }
            if (this.lineJoin) {
                ctx.lineJoin = this.lineJoin;
            }
            if (this.lineWidth) {
                ctx.lineWidth = this.lineWidth;
            }
            if (this.miterLimit) {
                ctx.miterLimit = this.miterLimit;
            }
            if (useShadow) {
                if (this.shadowColor) {
                    ctx.shadowColor = this.shadowColor;
                }
                if (this.shadowOffsetX) {
                    ctx.shadowOffsetX = this.shadowOffsetX;
                }
                if (this.shadowOffsetY) {
                    ctx.shadowOffsetY = this.shadowOffsetY;
                }
                if (this.shadowBlur) {
                    ctx.shadowBlur = this.shadowBlur;
                }
                if (this.shadowOpacity) {
                    ctx.globalAlpha = this.shadowOpacity;
                }
            } else {
                ctx.globalAlpha = this.opacity;
            }
        }
        setDefaults(ctx: CanvasRenderingContext2D) {
            ctx.strokeStyle = "black";
            ctx.fillStyle = "black";
            ctx.lineCap = "butt";
            ctx.lineJoin = "miter";
            ctx.lineWidth = 1;
            ctx.miterLimit = 10;
            ctx.shadowColor = "black";
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
        }

        setFillStyle(color: string) {
            this.fillStyle = color;
        }


    }
}

