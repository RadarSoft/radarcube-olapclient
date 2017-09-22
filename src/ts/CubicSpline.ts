namespace RadarSoft {
   export class CubicSpline {
        splines: any[];
        a: number;
        b: number;
        c: number;
        d: number;
        x: number;

        constructor() {
            this.splines = [];

        }

        SplineTuple(): CubicSpline {
            this.a = 0.0;
            this.b = 0.0;
            this.c = 0.0;
            this.d = 0.0;
            this.x = 0.0;

            return this;
        }

        BuildFunc(x: number[], y: number[], n: number) {
            this.splines = [];
            for (var i = 0; i < n; ++i) {
                var splineTuple = this.SplineTuple();
                splineTuple.x = x[i];
                splineTuple.a = y[i];
                this.splines.push(splineTuple);
            }

            this.splines[0].c = this.splines[n - 1].c = 0.0;

            var alpha = [];
            var beta = [];
            alpha.push(0.0);
            beta.push(0.0);
            for (var i = 1; i < n - 1; ++i) {
                var h_i = x[i] - x[i - 1], h_i1 = x[i + 1] - x[i];
                var A = h_i;
                var C = 2.0 * (h_i + h_i1);
                var B = h_i1;
                var F = 6.0 * ((y[i + 1] - y[i]) / h_i1 - (y[i] - y[i - 1]) / h_i);
                var z: number = (A * alpha[i - 1] + C);
                alpha.push(-B / z);
                beta.push((F - A * beta[i - 1]) / z);
            }

            for (var i = n - 2; i > 0; --i)
                this.splines[i].c = alpha[i] * this.splines[i + 1].c + beta[i];

            beta = null;
            alpha = null;

            for (var i = n - 1; i > 0; --i) {
                var h_i = x[i] - x[i - 1];
                this.splines[i].d = (this.splines[i].c - this.splines[i - 1].c)
                    / h_i;
                this.splines[i].b = h_i
                    * (2.0 * this.splines[i].c + this.splines[i - 1].c) / 6.0
                    + (y[i] - y[i - 1]) / h_i;
            }
        }

        Func(x: number) {
            if (this.splines == null)
                return null; 

            var n = this.splines.length;
            var s;

            if (x <= this.splines[0].x) 
                s = this.splines[1];
            else if (x >= this.splines[n - 1].x) 
                s = this.splines[n - 1];
            else 
            {
                var i = 0, j = n - 1;
                while (i + 1 < j) {
                    var k = Math.round(i + (j - i) / 2);
                    if (x <= this.splines[k].x)
                        j = k;
                    else
                        i = k;
                }
                s = this.splines[j];
            }

            var dx = (x - s.x);
            return s.a + (s.b + (s.c / 2.0 + s.d * dx / 6.0) * dx) * dx;
        }

    }
}