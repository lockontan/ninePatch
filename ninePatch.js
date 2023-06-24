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

            if (type == "npTc") {
                var index = offset + 1;
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
                for (var index = 0; index < keys.length; index++) {
                    var key = keys[index];
                    if (byteLength == 1) {
                        out[key.name] = data[index];
                    } else if (byteLength == 4) {
                        out[key.name] = bin.readUint(data, index);
                    }
                    index += key.byteLength;
                }
                out.xDivs = [];
                for (var index = 0; index < out.numXDivs; index++) {
                    out.xDivs.push(bin.readUint(data, index));
                    index += 4;
                }
                out.yDivs = [];
                for (var index = 0; index < out.numYDivs; index++) {
                    out.yDivs.push(bin.readUint(data, index));
                    index += 4;
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
    return {
        decode: decode
    };
})();
