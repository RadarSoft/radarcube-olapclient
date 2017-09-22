namespace RadarSoft {
    export class RGBobject {
        r: number;
        g: number;
        b: number;

        constructor(red?: number, green?: number, blue?: number) {
            this.r = red;
            this.g = green;
            this.b = blue;
            this.validate();
        }

        validate() {
            if (this.r <= 0) {
                this.r = 0;
            }
            if (this.g <= 0) {
                this.g = 0;
            }
            if (this.b <= 0) {
                this.b = 0;
            }
            if (this.r > 255) {
                this.r = 255;
            }
            if (this.g > 255) {
                this.g = 255;
            }
            if (this.b > 255) {
                this.b = 255;
            }
        };

    }
}