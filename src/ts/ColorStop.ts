namespace RadarSoft {
    export class ColorStop {
        color: string;
        position: number;

        constructor(position: number, color: string) {
            this.position = position;
            this.color = color;
        }
    }
}