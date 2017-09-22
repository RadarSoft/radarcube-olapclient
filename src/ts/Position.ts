namespace RadarSoft {
    export class Position {
        left: number;
        top: number;

        constructor(top?: number, left?: number) {
            this.top = top;
            this.left = left;
        }
    }
}