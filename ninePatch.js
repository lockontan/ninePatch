var ninePatch = (function () {
    var bin = {
        readUint: function (buff, p) {
            return (
                buff[p] * (256 * 256 * 256) +
                ((buff[p + 1] << 16) | (buff[p + 2] << 8) | buff[p + 3])
            );
        },
        readASCII: function (buff, p, l) {
            var s = "";
            for (var i = 0; i < l; i++) {
                s += String.fromCharCode(buff[p + i]);
            }
            return s;
        }
    };
    function decode(buff) {
        var data = new Uint8Array(buff),
            offset = 8;
        var out = {};

        var pngFlag = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
        for (var i = 0; i < 8; i++) {
            if (data[i] != pngFlag[i]) throw "This is not a PNG file!";
        }
        while (offset < data.length) {
            var len = bin.readUint(data, offset);
            offset += 4;
            var type = bin.readASCII(data, offset, 4);
            offset += 4;
            if(type=="IHDR")  {
                out.width  = bin.readUint(data, offset);
		        out.height = bin.readUint(data, offset + 4);
            } else if (type == "npTc") {
                var npTcOffset = offset;
                var keys = [
                    { name: "wasDeserialized", byteLength: 1 },
                    { name: "numXDivs", byteLength: 1 },
                    { name: "numYDivs", byteLength: 1 },
                    { name: "numColors", byteLength: 1 },
                    { name: "xDivsOffset", byteLength: 4 },
                    { name: "yDivsOffset", byteLength: 4 },
                    { name: "paddingLeft", byteLength: 4 },
                    { name: "paddingRight", byteLength: 4 },
                    { name: "paddingTop", byteLength: 4 },
                    { name: "paddingBottom", byteLength: 4 },
                    { name: "colorsOffset", byteLength: 4 },
                ];
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (key.byteLength == 1) {
                        out[key.name] = data[npTcOffset];
                    } else if (key.byteLength == 4) {
                        out[key.name] = bin.readUint(data, npTcOffset);
                    }
                    npTcOffset += key.byteLength;
                }
                out.xDivs = [];
                for (var i = 0; i < out.numXDivs; i++) {
                    out.xDivs.push(bin.readUint(data, npTcOffset));
                    npTcOffset += 4;
                }
                out.yDivs = [];
                for (var i = 0; i < out.numYDivs; i++) {
                    out.yDivs.push(bin.readUint(data, npTcOffset));
                    npTcOffset += 4;
                }
                break;
            } else if (type == "IEND") {
                break;
            }
            offset += len;
            // skip crc
            offset += 4;
        }
        return out;
    }
    function generateCss(data) {
        return `border-image-slice: ${data.yDivs[0]} ${data.width - data.xDivs[1]} ${data.height - data.yDivs[1]} ${data.xDivs[0]} fill; border-image-width: auto; padding: ${data.paddingTop}px ${data.paddingRight}px ${data.paddingBottom}px ${data.paddingLeft}px`
    }
    return {
        decode: decode,
        generateCss: generateCss
    };
})();
