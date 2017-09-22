namespace RadarSoft {
    export class ColorManager {
        usedColors: any = [];

        HSV2RGB(HSV: HSVobject, RGB: RGBobject) {
            var h = HSV.h / 360;
            var s = HSV.s / 100;
            var v = HSV.v / 100;
            if (s == 0) {
                RGB.r = v * 255;
                RGB.g = v * 255;
                RGB.b = v * 255;
            } else {
                var var_h: number = h * 6;
                var var_i = Math.floor(var_h);
                var var_1 = v * (1 - s);
                var var_2 = v * (1 - s * (var_h - var_i));
                var var_3 = v * (1 - s * (1 - (var_h - var_i)));

                var var_r;
                var var_g;
                var var_b;

                if (var_i == 0) {
                    var_r = v;
                    var_g = var_3;
                    var_b = var_1;
                } else if (var_i == 1) {
                    var_r = var_2;
                    var_g = v;
                    var_b = var_1;
                } else if (var_i == 2) {
                    var_r = var_1;
                    var_g = v;
                    var_b = var_3;
                } else if (var_i == 3) {
                    var_r = var_1;
                    var_g = var_2;
                    var_b = v;
                } else if (var_i == 4) {
                    var_r = var_3;
                    var_g = var_1;
                    var_b = v;
                } else {
                    var_r = v;
                    var_g = var_1;
                    var_b = var_2;
                }
                ;

                RGB.r = var_r * 255;
                RGB.g = var_g * 255;
                RGB.b = var_b * 255;
            }
        }

        RGB2HSV(RGB: RGBobject, HSV: HSVobject) {
            let r = RGB.r / 255;
            let g = RGB.g / 255;
            let b = RGB.b / 255; // Scale to unity.

            var minVal = Math.min(r, g, b);
            var maxVal = Math.max(r, g, b);
            var delta = maxVal - minVal;

            HSV.v = maxVal;

            if (delta == 0) {
                HSV.h = 0;
                HSV.s = 0;
            } else {
                HSV.s = delta / maxVal;
                var del_R = (((maxVal - r) / 6) + (delta / 2)) / delta;
                var del_G = (((maxVal - g) / 6) + (delta / 2)) / delta;
                var del_B = (((maxVal - b) / 6) + (delta / 2)) / delta;

                if (r == maxVal) {
                    HSV.h = del_B - del_G;
                } else if (g == maxVal) {
                    HSV.h = (1 / 3) + del_R - del_B;
                } else if (b == maxVal) {
                    HSV.h = (2 / 3) + del_G - del_R;
                }

                if (HSV.h < 0) {
                    HSV.h += 1;
                }
                if (HSV.h > 1) {
                    HSV.h -= 1;
                }
            }
            HSV.h *= 360;
            HSV.s *= 100;
            HSV.v *= 100;
        }

        randomNumber() {
            return Math.floor(Math.random() * 255);
        }

        decToHex(dec: number) {
            var hexStr = "0123456789ABCDEF";
            var low = dec % 16;
            var high = (dec - low) / 16;
            var hex = "" + hexStr.charAt(high) + hexStr.charAt(low);
            return hex;
        }

        HexToInt(color: string) {
            var colorHex = "0x" + color;
            var colorInt = parseInt(colorHex);
            return colorInt;
        }

        generateColor() {
            var rgb = new RGBobject();
            var hsv = new HSVobject();
            hsv.h = Math.floor(Math.random() * 360);
            hsv.s = 75;
            hsv.v = 65;
            this.HSV2RGB(hsv, rgb);
            var color = "#" + this.decToHex(rgb.r) + this.decToHex(rgb.g)
                + this.decToHex(rgb.b);
            return color;
        }

        isUsed(color: string) {
            var isUsed = false;
            for (var i = 0; i < this.usedColors.length; i++) {
                var currColor = this.usedColors[i];
                var rgbCurr = this.getRGB(currColor);
                var rgbColor = this.getRGB(color);
                var hsvCurr = new HSVobject();
                var hsvColor = new HSVobject();
                this.RGB2HSV(rgbCurr, hsvCurr);
                this.RGB2HSV(rgbColor, hsvColor);
                if (Math.abs(hsvColor.h - hsvCurr.h) <= 20) {
                    isUsed = true;
                    break;
                }
            }
            return isUsed;
        }

        CreateColor() {
            var color = this.generateColor();
            while (this.isUsed(color)) {
                color = this.generateColor();
            }
            this.usedColors.push(color);
            return color;
        }

        getRGB(color: string): RGBobject {
            var baseR = this.HexToInt(color.slice(1, 3));
            var baseG = this.HexToInt(color.slice(3, 5));
            var baseB = this.HexToInt(color.slice(5, 7));

            var rgb = new RGBobject(baseR, baseG, baseB);
            return rgb;
        }

        CreateGradient(baseColor: string) {
            var rgb = this.getRGB(baseColor);
            var hsv = new HSVobject();
            this.RGB2HSV(rgb, hsv);

            hsv.h = (hsv.h + 30) % 360;
            hsv.v = 100;
            hsv.s = 25;
            this.HSV2RGB(hsv, rgb);
            var nextColor = "#" + this.decToHex(rgb.r) + this.decToHex(rgb.g)
                + this.decToHex(rgb.b);
            var firstColorStop = new ColorStop(0.157, baseColor);
            var secondColorStop = new ColorStop(1, nextColor);
            var grdBrush = new GradientBrush(firstColorStop, secondColorStop);
            return grdBrush;
        }
        CreateGradients(grdCount: number) {
            var colorsHSV = [];
            var borderColorsHSV = [];
            var i: number;
            for (i = 0; i < grdCount; i++) {
                var hsv = new HSVobject();
                hsv.h = (360 * i / grdCount);
                hsv.s = 90;
                hsv.v = 90;
                colorsHSV.push(hsv);

                hsv = new HSVobject();
                hsv.h = colorsHSV[i].h;
                hsv.s = colorsHSV[i].s - 20;
                hsv.v = colorsHSV[i].v - 20;
                borderColorsHSV.push(hsv);
            }

            var colors = [];
            var borderColors = [];
            for (i = 0; i < grdCount; i++) {
                var rgb = new RGBobject();
                this.HSV2RGB(colorsHSV[i], rgb);
                colors.push("#" + this.decToHex(rgb.r) + this.decToHex(rgb.g)
                    + this.decToHex(rgb.b));

                rgb = new RGBobject();
                this.HSV2RGB(borderColorsHSV[i], rgb);
                borderColors.push("#" + this.decToHex(rgb.r) + this.decToHex(rgb.g)
                    + this.decToHex(rgb.b));
            }

            var colorsInfo = [];
            for (i = 0; i < grdCount; i++) {
                //var grdBrush = this.CreateGradient(colors[i]);
                var colorInf = {
                    "color": colors[i],
                    "borderColor": borderColors[i]
                    //"grdBrush" : grdBrush
                };
                colorsInfo.push(colorInf);
            }
            return colorsInfo;
        }

        getHexRGBColor(color: string) {
            color = color.replace(/\s/g, "");
            var aRGB = color.match(/^rgb\((\d{1,3}[%]?),(\d{1,3}[%]?),(\d{1,3}[%]?)\)$/i);
            if (aRGB) {
                color = '#';
                for (var i = 1; i <= 3; i++)
                    color += this.decToHex(parseInt(aRGB[i]));
            } else color = color.replace(/^#?([\da-f])([\da-f])([\da-f])$/i, '$1$1$2$2$3$3');
            return color;
        }

        ReduceSaturation(color: string) {
            var test = color;
            if (test.charAt(0) != '#') {
                test = this.getHexRGBColor(color);
            }
            var rgb = this.getRGB(test);
            var hsv = new HSVobject();
            this.RGB2HSV(rgb, hsv);
            hsv.s *= 0.6;
            this.HSV2RGB(hsv, rgb);

            return "#" + this.decToHex(rgb.r) + this.decToHex(rgb.g)
                + this.decToHex(rgb.b);
        }
    }
}