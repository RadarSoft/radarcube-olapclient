namespace RadarSoft {
    export abstract class Trend {
        y: number[];
        x: number[];
        b: number;
        a: number;

        constructor() {
            this.a = 0.0;
            this.b = 0.0;
            this.x = [];
            this.y = [];
        }

        abstract Func(x: number): number;
        abstract BuildFunc(x: number[], y: number[], n: number): void;
    } 

    export class linearTrend extends Trend {

        constructor() {
            super();
        }

        BuildFunc(x: number[], y: number[], n: number) {
                this.x = x;
                this.y = y;

                var sumX = 0;
                var sumY = 0;
                var sumXY = 0;
                var sumXsq = 0;

                for (var i = 0; i < n; i++) {
                    sumX += x[i];
                    sumY += y[i];
                    sumXY += (x[i]) * (y[i]);
                    sumXsq += (x[i]) * (x[i]);
                }

                sumX /= n;
                sumXsq /= n;
                sumY /= n;
                sumXY /= n;

                this.b = (sumY * sumXsq - sumX * sumXY) / (sumXsq - sumX * sumX);

                this.a = (sumXY - sumX * sumY) / (sumXsq - sumX * sumX);
        }

        Func(x: number): number {
                return this.b + this.a * x;
            }

    }

    export class quadraticTrend extends Trend {
        c: number;

        constructor() {
            super();
            this.c = 0.0;
        }

        BuildFunc(x: number[], y: number[], n: number) {
            this.x = x;
            this.y = y;
            var sumX = 0;
            var sumXsq = 0;
            var sumXpow3 = 0;
            var sumXpow4 = 0;
            var sumY = 0;
            var sumXY = 0;
            var sumXsqY = 0;
            for (var i = 0; i < n; i++) {
                sumX += x[i];
                sumXsq += x[i] * x[i];
                sumY += y[i];
                sumXY += x[i] * y[i];
                sumXpow3 += x[i] * x[i] * x[i];
                sumXpow4 += x[i] * x[i] * x[i] * x[i];
                sumXsqY += x[i] * x[i] * y[i];
            }
            sumX /= n;
            sumY /= n;
            sumXsq /= n;
            sumXY /= n;
            sumXpow3 /= n;
            sumXpow4 /= n;
            sumXsqY /= n;

            var detA = sumXpow4 * sumXsq + sumXpow3 * sumX * sumXsq + sumXsq * sumXpow3
                * sumX - sumXpow3 * sumXpow3 - sumXsq * sumXsq * sumXsq
                - sumXpow4 * sumX * sumX;
            var detA1 = sumXsqY * sumXsq + sumXpow3 * sumX * sumY + sumXsq * sumXY
                * sumX - sumXsqY * sumX * sumX - sumXpow3 * sumXY - sumXsq
                * sumXsq * sumY;
            var detA2 = sumXpow4 * sumXY + sumXsqY * sumX * sumXsq + sumXsq * sumXpow3
                * sumY - sumXpow4 * sumX * sumY - sumXsqY * sumXpow3 - sumXsq
                * sumXY * sumXsq;
            var detA3 = sumXpow4 * sumXsq * sumY + sumXpow3 * sumXY * sumXsq + sumXsqY
                * sumXpow3 * sumX - sumXpow4 * sumXY * sumX - sumXpow3
                * sumXpow3 * sumY - sumXsqY * sumXsq * sumXsq;
            this.a = detA1 / detA;
            this.b = detA2 / detA;
            this.c = detA3 / detA;
        }

        Func(x: number): number {
            return this.a * x * x + this.b * x + this.c;
        }
    }

    export class cubicTrend extends Trend {
        c: number;
        d: number;

        constructor() {
            super();
            this.c = 0.0;
            this.d = 0.0;
        }

        Func(x: number): number {
            return this.a * x * x * x + this.b * x * x + this.c * x + this.d;
        }

        BuildFunc(x: number[], y: number[], n: number) {
            this.x = x;
            this.y = y;
            var sumX = 0;
            var sumXpow2 = 0;
            var sumXpow3 = 0;
            var sumXpow4 = 0;
            var sumXpow5 = 0;
            var sumXpow6 = 0;
            var sumY = 0;
            var sumXY = 0;
            var sumXpow2Y = 0;
            var sumXpow3Y = 0;
            for (var i = 0; i < n; i++) {
                sumX += x[i];
                sumXpow2 += x[i] * x[i];
                sumXpow3 += x[i] * x[i] * x[i];
                sumXpow4 += x[i] * x[i] * x[i] * x[i];
                sumXpow5 += x[i] * x[i] * x[i] * x[i] * x[i];
                sumXpow6 += x[i] * x[i] * x[i] * x[i] * x[i] * x[i];
                sumY += y[i];
                sumXY += x[i] * y[i];
                sumXpow2Y += x[i] * x[i] * y[i];
                sumXpow3Y += x[i] * x[i] * x[i] * y[i];
            }

            sumX /= n;
            sumXpow2 /= n;
            sumXpow3 /= n;
            sumXpow4 /= n;
            sumXpow5 /= n;
            sumXpow6 /= n;
            sumY /= n;
            sumXY /= n;
            sumXpow2Y /= n;
            sumXpow3Y /= n;

            var detA = // Mx^2*Mx5^2
                sumX * sumX * sumXpow5 * sumXpow5
                    // -Mx6*Mx^2*Mx4
                    - sumXpow6 * sumX * sumX * sumXpow4
                    // +2*Mx6*Mx*Mx2*Mx3
                    + 2 * sumXpow6 * sumX * sumXpow2 * sumXpow3
                    // -2*Mx*Mx2*Mx4*Mx5
                    - 2 * sumX * sumXpow2 * sumXpow4 * sumXpow5
                    // -2*Mx*Mx3^2*Mx5
                    - 2 * sumX * sumXpow3 * sumXpow3 * sumXpow5
                    // +2*Mx*Mx3*Mx4^2
                    + 2 * sumX * sumXpow3 * sumXpow4 * sumXpow4
                    // -Mx6*Mx2^3
                    - sumXpow6 * sumXpow2 * sumXpow2 * sumXpow2
                    // +2*Mx2^2*Mx3*Mx5
                    + 2 * sumXpow2 * sumXpow2 * sumXpow3 * sumXpow5
                    // +Mx2^2*Mx4^2
                    + sumXpow2 * sumXpow2 * sumXpow4 * sumXpow4
                    // -3*Mx2*Mx3^2*Mx4
                    - 3 * sumXpow2 * sumXpow3 * sumXpow3 * sumXpow4
                    // +Mx6*Mx2*Mx4
                    + sumXpow6 * sumXpow2 * sumXpow4
                    // -Mx2*Mx5^2
                    - sumXpow2 * sumXpow5 * sumXpow5
                    // +Mx3^4
                    + sumXpow3 * sumXpow3 * sumXpow3 * sumXpow3
                    // -Mx6*Mx3^2
                    - sumXpow6 * sumXpow3 * sumXpow3
                    // +2*Mx3*Mx4*Mx5
                    + 2 * sumXpow3 * sumXpow4 * sumXpow5
                    // -Mx4^3
                    - sumXpow4 * sumXpow4 * sumXpow4;
            var detA1 = // Mx3y*Mx2^2*Mx5
                sumXpow3Y * sumXpow2 * sumXpow2 * sumXpow5
                    // -Mx6*Mx2y*Mx2^2
                    - sumXpow6 * sumXpow2Y * sumXpow2 * sumXpow2
                    // -2*Mx3y*Mx2*Mx3*Mx4
                    - 2 * sumXpow3Y * sumXpow2 * sumXpow3 * sumXpow4
                    // +Mx2y*Mx2*Mx3*Mx5
                    + sumXpow2Y * sumXpow2 * sumXpow3 * sumXpow5
                    // +Mx6*Mxy*Mx2*Mx3
                    + sumXpow6 * sumXY * sumXpow2 * sumXpow3
                    // +Mx2y*Mx2*Mx4^2
                    + sumXpow2Y * sumXpow2 * sumXpow4 * sumXpow4
                    // -Mxy*Mx2*Mx4*Mx5
                    - sumXY * sumXpow2 * sumXpow4 * sumXpow5
                    // +My*Mx6*Mx2*Mx4
                    + sumY * sumXpow6 * sumXpow2 * sumXpow4
                    // -My*Mx2*Mx5^2
                    - sumY * sumXpow2 * sumXpow5 * sumXpow5
                    // +Mx3y*Mx3^3
                    + sumXpow3Y * sumXpow3 * sumXpow3 * sumXpow3
                    // -Mx2y*Mx3^2*Mx4
                    - sumXpow2Y * sumXpow3 * sumXpow3 * sumXpow4
                    // -Mxy*Mx3^2*Mx5
                    - sumXY * sumXpow3 * sumXpow3 * sumXpow5
                    // -My*Mx6*Mx3^2
                    - sumY * sumXpow6 * sumXpow3 * sumXpow3
                    // +Mxy*Mx3*Mx4^2
                    + sumXY * sumXpow3 * sumXpow4 * sumXpow4
                    // +2*My*Mx3*Mx4*Mx5
                    + 2 * sumY * sumXpow3 * sumXpow4 * sumXpow5
                    // -Mx*Mx3y*Mx3*Mx5
                    - sumX * sumXpow3Y * sumXpow3 * sumXpow5
                    // +Mx*Mx6*Mx2y*Mx3
                    + sumX * sumXpow6 * sumXpow2Y * sumXpow3
                    // -My*Mx4^3
                    - sumY * sumXpow4 * sumXpow4 * sumXpow4
                    // +Mx*Mx3y*Mx4^2
                    + sumX * sumXpow3Y * sumXpow4 * sumXpow4
                    // -Mx*Mx2y*Mx4*Mx5
                    - sumX * sumXpow2Y * sumXpow4 * sumXpow5
                    // -Mx*Mx6*Mxy*Mx4
                    - sumX * sumXpow6 * sumXY * sumXpow4
                    // +Mx*Mxy*Mx5^2
                    + sumX * sumXY * sumXpow5 * sumXpow5;

            var detA2 =
                // Mx3^3*Mx2y
                sumXpow3 * sumXpow3 * sumXpow3 * sumXpow2Y
                    // -Mx5^2*Mxy
                    - sumXpow5 * sumXpow5 * sumXY
                    // -Mx4^2*Mx3y
                    - sumXpow4 * sumXpow4 * sumXpow3Y
                    // +Mx*My*Mx5^2
                    + sumX * sumY * sumXpow5 * sumXpow5
                    // +My*Mx3*Mx4^2
                    + sumY * sumXpow3 * sumXpow4 * sumXpow4
                    // -My*Mx3^2*Mx5
                    - sumY * sumXpow3 * sumXpow3 * sumXpow5
                    // -Mx3^2*Mx4*Mxy
                    - sumXpow3 * sumXpow3 * sumXpow4 * sumXY
                    // -Mx2^2*Mx6*Mxy
                    - sumXpow2 * sumXpow2 * sumXpow6 * sumXY
                    // -Mx2*Mx3^2*Mx3y
                    - sumXpow2 * sumXpow3 * sumXpow3 * sumXpow3Y
                    // +Mx2^2*Mx4*Mx3y
                    + sumXpow2 * sumXpow2 * sumXpow4 * sumXpow3Y
                    // +Mx4*Mx6*Mxy
                    + sumXpow4 * sumXpow6 * sumXY
                    // +Mx3*Mx5*Mx3y
                    + sumXpow3 * sumXpow5 * sumXpow3Y
                    // -Mx3*Mx6*Mx2y
                    - sumXpow3 * sumXpow6 * sumXpow2Y
                    // +Mx4*Mx5*Mx2y
                    + sumXpow4 * sumXpow5 * sumXpow2Y
                    // -Mx*My*Mx4*Mx6
                    - sumX * sumY * sumXpow4 * sumXpow6
                    // +My*Mx2*Mx3*Mx6
                    + sumY * sumXpow2 * sumXpow3 * sumXpow6
                    // -My*Mx2*Mx4*Mx5
                    - sumY * sumXpow2 * sumXpow4 * sumXpow5
                    // -Mx*Mx2*Mx5*Mx3y
                    - sumX * sumXpow2 * sumXpow5 * sumXpow3Y
                    // +Mx*Mx2*Mx6*Mx2y
                    + sumX * sumXpow2 * sumXpow6 * sumXpow2Y
                    // +Mx*Mx3*Mx4*Mx3y
                    + sumX * sumXpow3 * sumXpow4 * sumXpow3Y
                    // -Mx*Mx3*Mx5*Mx2y
                    - sumX * sumXpow3 * sumXpow5 * sumXpow2Y
                    // +2*Mx2*Mx3*Mx5*Mxy
                    + 2 * sumXpow2 * sumXpow3 * sumXpow5 * sumXY
                    // -Mx2*Mx3*Mx4*Mx2y
                    - sumXpow2 * sumXpow3 * sumXpow4 * sumXpow2Y;

            var detA3 = // Mx3^3*Mxy
                sumXpow3 * sumXpow3 * sumXpow3 * sumXY
                    // -Mx4^2*Mx2y
                    - sumXpow4 * sumXpow4 * sumXpow2Y
                    // +My*Mx2*Mx4^2
                    + sumY * sumXpow2 * sumXpow4 * sumXpow4
                    // -My*Mx3^2*Mx4
                    - sumY * sumXpow3 * sumXpow3 * sumXpow4
                    // -My*Mx2^2*Mx6
                    - sumY * sumXpow2 * sumXpow2 * sumXpow6
                    // -Mx*Mx3^2*Mx3y
                    - sumX * sumXpow3 * sumXpow3 * sumXpow3Y
                    // +Mx^2*Mx5*Mx3y
                    + sumX * sumX * sumXpow5 * sumXpow3Y
                    // -Mx^2*Mx6*Mx2y
                    - sumX * sumX * sumXpow6 * sumXpow2Y
                    // -Mx2*Mx3^2*Mx2y
                    - sumXpow2 * sumXpow3 * sumXpow3 * sumXpow2Y
                    // +Mx2^2*Mx3*Mx3y
                    + sumXpow2 * sumXpow2 * sumXpow3 * sumXpow3Y
                    // -Mx3*Mx6*Mxy
                    - sumXpow3 * sumXpow6 * sumXY
                    // +Mx4*Mx5*Mxy
                    + sumXpow4 * sumXpow5 * sumXY
                    // -Mx2*Mx5*Mx3y
                    - sumXpow2 * sumXpow5 * sumXpow3Y
                    // +Mx2*Mx6*Mx2y
                    + sumXpow2 * sumXpow6 * sumXpow2Y
                    // +Mx3*Mx4*Mx3y
                    + sumXpow3 * sumXpow4 * sumXpow3Y
                    // +Mx*My*Mx3*Mx6
                    + sumX * sumY * sumXpow3 * sumXpow6
                    // -Mx*My*Mx4*Mx5
                    - sumX * sumY * sumXpow4 * sumXpow5
                    // +My*Mx2*Mx3*Mx5
                    + sumY * sumXpow2 * sumXpow3 * sumXpow5
                    // +Mx*Mx2*Mx6*Mxy
                    + sumX * sumXpow2 * sumXpow6 * sumXY
                    // -Mx*Mx3*Mx5*Mxy
                    - sumX * sumXpow3 * sumXpow5 * sumXY
                    // -Mx*Mx2*Mx4*Mx3y
                    - sumX * sumXpow2 * sumXpow4 * sumXpow3Y
                    // +2*Mx*Mx3*Mx4*Mx2y
                    + 2 * sumX * sumXpow3 * sumXpow4 * sumXpow2Y
                    // -Mx2*Mx3*Mx4*Mxy
                    - sumXpow2 * sumXpow3 * sumXpow4 * sumXY;
            var detA4 = // Mx5*Mx2y*Mx^2
                sumXpow5 * sumXpow2Y * sumX * sumX
                    // -Mx3y*Mx^2*Mx4
                    - sumXpow3Y * sumX * sumX * sumXpow4
                    // +2*Mx3y*Mx*Mx2*Mx3
                    + 2 * sumXpow3Y * sumX * sumXpow2 * sumXpow3
                    // -Mx2y*Mx*Mx2*Mx4
                    - sumXpow2Y * sumX * sumXpow2 * sumXpow4
                    // -Mx5*Mxy*Mx*Mx2
                    - sumXpow5 * sumXY * sumX * sumXpow2
                    // -Mx2y*Mx*Mx3^2
                    - sumXpow2Y * sumX * sumXpow3 * sumXpow3
                    // +Mxy*Mx*Mx3*Mx4
                    + sumXY * sumX * sumXpow3 * sumXpow4
                    // -My*Mx5*Mx*Mx3
                    - sumY * sumXpow5 * sumX * sumXpow3
                    // +My*Mx*Mx4^2
                    + sumY * sumX * sumXpow4 * sumXpow4
                    // -Mx3y*Mx2^3
                    - sumXpow3Y * sumXpow2 * sumXpow2 * sumXpow2
                    // +Mx2y*Mx2^2*Mx3
                    + sumXpow2Y * sumXpow2 * sumXpow2 * sumXpow3
                    // +Mxy*Mx2^2*Mx4
                    + sumXY * sumXpow2 * sumXpow2 * sumXpow4
                    // +My*Mx5*Mx2^2
                    + sumY * sumXpow5 * sumXpow2 * sumXpow2
                    // -Mxy*Mx2*Mx3^2
                    - sumXY * sumXpow2 * sumXpow3 * sumXpow3
                    // -2*My*Mx2*Mx3*Mx4
                    - 2 * sumY * sumXpow2 * sumXpow3 * sumXpow4
                    // +Mx3y*Mx2*Mx4
                    + sumXpow3Y * sumXpow2 * sumXpow4
                    // -Mx5*Mx2y*Mx2
                    - sumXpow5 * sumXpow2Y * sumXpow2
                    // +My*Mx3^3
                    + sumY * sumXpow3 * sumXpow3 * sumXpow3
                    // -Mx3y*Mx3^2
                    - sumXpow3Y * sumXpow3 * sumXpow3
                    // +Mx2y*Mx3*Mx4
                    + sumXpow2Y * sumXpow3 * sumXpow4
                    // +Mx5*Mxy*Mx3
                    + sumXpow5 * sumXY * sumXpow3
                    // -Mxy*Mx4^2
                    - sumXY * sumXpow4 * sumXpow4;

            this.a = detA4 / detA;
            this.b = detA3 / detA;
            this.c = detA2 / detA;
            this.d = detA1 / detA;
        }
    }
}