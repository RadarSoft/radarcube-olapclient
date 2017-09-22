namespace RadarSoft {
    export class pointTypeManager {
        max: number;
        defaultType: number;
        current: number;

        constructor() {
            this.current = -1;
            this.defaultType = 0;
            this.max = 0;
            for (var i in pointTypes) {
                this.max = this.max + 1;
            }
        }

        next() {
            this.current = (this.current + 1) % this.max;
            return this.current;
        }
    }
}