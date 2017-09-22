namespace RadarSoft {
    export class HSVobject {
        h: number;
        s: number;
        v: number;

        constructor(hue?: number, saturation?: number, value?: number) {
            this.h = hue;
            this.s = saturation;
            this.v = value;
            this.validate();
        }

        validate() {
            if (this.h <= 0) {
                this.h = 0;
            }
            if (this.s <= 0) {
                this.s = 0;
            }
            if (this.v <= 0) {
                this.v = 0;
            }
            if (this.h > 360) {
                this.h = 360;
            }
            if (this.s > 100) {
                this.s = 100;
            }
            if (this.v > 100) {
                this.v = 100;
            }
        };

    }
}