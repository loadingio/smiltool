// Generated by LiveScript 1.3.1
(function(module){
  var pathFromList, transformFromList, animToString, fetchImage, _fetchImages, fetchImages, traverse, smiltool, smilToSvg, svgToDataurl, smilToDataurl, dataurlToImg, smilToImg, smilToPng, dataurlToI8a, i8aToBlob, dataurlToBlob, svgToBlob, dataurlToArraybuffer, imgurlToArraybuffer;
  pathFromList = function(list){
    var ret, i$, to$, i, item;
    ret = [];
    for (i$ = 0, to$ = list.numberOfItems; i$ < to$; ++i$) {
      i = i$;
      item = list.getItem(i);
      ret.push(item.pathSegTypeAsLetter + ['r1', 'r2', 'angle', 'largeArcFlag', 'sweepFlag', 'x1', 'y1', 'x2', 'y2', 'x', 'y'].filter(fn$).map(fn1$).join(" "));
    }
    return ret.join("");
    function fn$(it){
      return item[it] != null;
    }
    function fn1$(it){
      if (it === 'largeArcFlag' || it === 'sweepFlag') {
        if (item[it]) {
          return 1;
        } else {
          return 0;
        }
      } else {
        return item[it];
      }
    }
  };
  transformFromList = function(list){
    var ret, i$, to$, i, item, mat;
    ret = [];
    for (i$ = 0, to$ = list.numberOfItems; i$ < to$; ++i$) {
      i = i$;
      item = list.getItem(i);
      mat = item.matrix;
      ret.push("matrix(" + mat.a + "," + mat.b + "," + mat.c + "," + mat.d + "," + mat.e + "," + mat.f + ")");
    }
    return ret.join(" ");
  };
  animToString = function(input){
    var ref$;
    if ((ref$ = typeof input) === 'string' || ref$ === 'number') {
      return input;
    }
    if (input.animVal) {
      if ((ref$ = typeof input.animVal) === 'string' || ref$ === 'number') {
        return input.animVal;
      }
      if ((ref$ = typeof input.animVal.value) === 'string' || ref$ === 'number') {
        return input.animVal.value;
      }
      if (!input.animVal.numberOfItems) {
        return "";
      }
      return transformFromList(input.animVal);
    } else if (input.numberOfItems && ((input.getItem && input.getItem(0)) || input[0]).pathSegType != null) {
      return pathFromList(input);
    }
    return "";
  };
  fetchImage = function(url, width, height){
    return new Promise(function(res, rej){
      var img;
      if (/^data:/.exec(url)) {
        return res(url);
      }
      img = new Image();
      img.width = width + "px";
      img.height = height + "px";
      img.onload = function(){
        var canvas, ctx;
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        return res(canvas.toDataURL());
      };
      return img.src = url;
    });
  };
  _fetchImages = function(node, hash){
    var promises, href, width, height, i$, to$, i, child;
    hash == null && (hash = {});
    promises = [];
    if (/^#/.exec(node.nodeName)) {
      return [];
    }
    href = node.getAttribute('xlink:href');
    if (href && !/^#/.exec(href)) {
      width = node.getAttribute('width');
      height = node.getAttribute('height');
      promises.push(fetchImage(href, width, height).then(function(it){
        return hash[href] = it;
      }));
    }
    for (i$ = 0, to$ = node.childNodes.length; i$ < to$; ++i$) {
      i = i$;
      child = node.childNodes[i];
      promises = promises.concat(_fetchImages(child, hash));
    }
    return promises;
  };
  fetchImages = function(node, hash){
    hash == null && (hash = {});
    return Promise.all(_fetchImages(node, hash));
  };
  traverse = function(node, option){
    var style, animatedProperties, attrs, subtags, i$, to$, i, child, dur, path, length, ptr, name, value, ref$, len$, v, k, ret;
    option == null && (option = {});
    if (/^#text/.exec(node.nodeName)) {
      return node.textContent;
    } else if (/^#/.exec(node.nodeName)) {
      return "";
    }
    style = getComputedStyle(node);
    animatedProperties = {};
    attrs = [];
    subtags = [];
    if (node.nodeName === 'svg') {
      animatedProperties["xmlns"] = "http://www.w3.org/2000/svg";
      animatedProperties["xmlns:xlink"] = "http://www.w3.org/1999/xlink";
    }
    for (i$ = 0, to$ = node.childNodes.length; i$ < to$; ++i$) {
      i = i$;
      child = node.childNodes[i];
      if (/^animateMotion/.exec(child.nodeName)) {
        dur = child.getSimpleDuration();
        path = document.querySelector(child.childNodes[0].getAttribute("href"));
        length = path.getTotalLength();
        ptr = path.getPointAtLength(length * (child.getCurrentTime() % dur) / dur);
        animatedProperties["transform"] = "translate(" + ptr.x + " " + ptr.y + ")";
      } else if (/^animate/.exec(child.nodeName)) {
        name = child.getAttribute('attributeName');
        value = node[name] || style.getPropertyValue(name);
        if (name === 'd') {
          value = node.animatedPathSegList || node.getAttribute('d');
        }
        animatedProperties[name] = animToString(value);
      } else {
        subtags.push(traverse(child, option));
      }
    }
    for (i$ = 0, len$ = (ref$ = node.attributes).length; i$ < len$; ++i$) {
      v = ref$[i$];
      if (animatedProperties[v.name] != null) {
        attrs.push([v.name, animatedProperties[v.name]]);
        delete animatedProperties[v.name];
      } else if (v.name === 'xlink:href' && option.hrefs && option.hrefs[v.value]) {
        attrs.push([v.name, option.hrefs[v.value]]);
      } else {
        attrs.push([v.name, v.value]);
      }
    }
    for (k in animatedProperties) {
      v = animatedProperties[k];
      attrs.push([k, v]);
    }
    ret = [
      "<" + node.nodeName + " " + attrs.map(function(it){
        return it[0] + "=\"" + it[1] + "\"";
      }).join(" ") + ">", subtags.join("\n").trim(), "</" + node.nodeName + ">"
    ].filter(function(it){
      return it;
    }).join("");
    return ret;
  };
  smiltool = module.smiltool = {};
  smiltool.smilToSvg = smilToSvg = function(root, delay){
    return new Promise(function(res, rej){
      var hash;
      root.pauseAnimations();
      if (delay != null) {
        root.setCurrentTime(delay);
      }
      hash = {};
      return fetchImages(root, hash).then(function(){
        var ret;
        ret = traverse(root, {
          hrefs: hash
        });
        root.unpauseAnimations();
        return res("<?xml version=\"1.0\" encoding=\"utf-8\"?>" + ret);
      });
    });
  };
  smiltool.svgToDataurl = svgToDataurl = function(svg){
    return new Promise(function(res, rej){
      return res("data:image/svg+xml;base64," + btoa(svg));
    });
  };
  smiltool.smilToDataurl = smilToDataurl = function(root, delay){
    return smilToSvg(root, delay).then(function(svg){
      return svgToDataurl(svg);
    });
  };
  smiltool.dataurlToImg = dataurlToImg = function(url, width, height, type, quality){
    width == null && (width = 100);
    height == null && (height = 100);
    type == null && (type = "image/png");
    quality == null && (quality = 0.92);
    return new Promise(function(res, rej){
      var img;
      img = new Image();
      img.onload = function(){
        var canvas, ctx;
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        return res(canvas.toDataURL(type, quality));
      };
      return img.src = url;
    });
  };
  smiltool.smilToImg = smilToImg = function(root, width, height, delay, type, quality){
    width == null && (width = 100);
    height == null && (height = 100);
    type == null && (type = "image/png");
    quality == null && (quality = 0.92);
    return smilToDataurl(root, delay).then(function(dataurl){
      return dataurlToImg(dataurl, width, height, type, quality);
    });
  };
  smiltool.smilToPng = smilToPng = function(root, width, height, delay, quality){
    width == null && (width = 100);
    height == null && (height = 100);
    quality == null && (quality = 0.92);
    return smilToImg(root, width, height, delay, "image/png", quality);
  };
  smiltool.dataurlToI8a = dataurlToI8a = function(url){
    return new Promise(function(res, rej){
      var bin, len, len32, a8, a32, ref$, i, j, i$, tailLen;
      bin = atob(uri.split(','))[1];
      len = bin.length;
      len32 = len >> 2;
      a8 = new Unit8Array(len);
      a32 = new Uint32Array(a8.buffer, 0, len32);
      ref$ = [0, 0], i = ref$[0], j = ref$[1];
      for (i$ = 0; i$ < len32; ++i$) {
        i = i$;
        a32[i] = bin.charCodeAt(j++) | bin.charCodeAt(j++) << 8 | bin.charCodeAt(j++) << 16 | bin.charCodeAt(j++) << 24;
      }
      tailLen = len & 3;
      for (i$ = tailLen; i$ < 0; ++i$) {
        i = i$;
        a8[j] = bin.charCodeAt(j);
        j++;
      }
      return res(i8a);
    });
  };
  smiltool.i8aToBlob = i8aToBlob = function(i8a, type){
    type == null && (type = 'image/png');
    return new Promise(function(res, rej){
      return res(new Blob([i8a], {
        type: type
      }));
    });
  };
  smiltool.dataurlToBlob = dataurlToBlob = function(url, type){
    type == null && (type = 'image/png');
    return dataurlToI8a(url).then(function(i8a){
      return i8aToBlob(i8a, type);
    });
  };
  smiltool.svgToBlob = svgToBlob = function(svg, type){
    type == null && (type = 'image/png');
    return svgToDataurl(svg).then(function(url){
      return dataurlToI8a(url);
    }).then(function(i8a){
      return i8aToBlob(i8a, type);
    });
  };
  smiltool.smilToBlob = svgToBlob = function(svg, delay, type){
    type == null && (type = 'image/png');
    return smilToSvg(root, delay).then(function(svg){
      svgToDataurl(svg).then(function(url){});
      dataurlToI8a(url).then(function(i8a){});
      return i8aToBlob(i8a, type);
    });
  };
  smiltool.dataurlToArraybuffer = dataurlToArraybuffer = function(dataurl){
    return new Promise(function(res, rej){
      var splitted, byteString, mimeString, ab, ia, i$, to$, i;
      splitted = dataurl.split(',');
      byteString = atob(splitted[1]);
      mimeString = splitted[0].split(':')[1].split(';')[0];
      ab = new ArrayBuffer(byteString.length);
      ia = new Uint8Array(ab);
      for (i$ = 0, to$ = byteString.length; i$ < to$; ++i$) {
        i = i$;
        ia[i] = byteString.charCodeAt(i);
      }
      return res(ab);
    });
  };
  smiltool.imgurlToArraybuffer = imgurlToArraybuffer = function(url, width, height, type, quality){
    type == null && (type = 'image/png');
    quality == null && (quality = 0.92);
    return new Promise(function(res, rej){
      var img;
      img = new Image();
      img.onload = function(){
        var w, h, canvas, ctx, dataurl;
        w = width != null
          ? width
          : img.width;
        h = height != null
          ? height
          : img.height;
        canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, img.width, img.height, (w - img.width) / 2, (h - img.height) / 2, img.width, img.height);
        dataurl = canvas.toDataURL(type, quality);
        return dataurlToArraybuffer(dataurl).then(function(ab){
          return res(ab);
        });
      };
      return img.src = url;
    });
  };
  if (typeof GIF != 'undefined' && GIF !== null) {
    return smiltool.smilToGif = function(node, paramOption, paramGifOption){
      paramOption == null && (paramOption = {});
      paramGifOption == null && (paramGifOption = {});
      return new Promise(function(res, rej){
        var imgs, option, gifOption, ref$, gif, _;
        imgs = [];
        option = import$({
          slow: 0,
          width: 100,
          height: 100,
          frames: 30,
          duration: 1,
          progress: function(){}
        }, paramOption);
        gifOption = (ref$ = import$({
          worker: 2,
          quality: 1
        }, paramGifOption), ref$.width = option.width, ref$.height = option.height, ref$);
        if (option.duration / option.frames < 0.034) {
          option.frames = Math.floor(option.duration / 0.034);
        }
        if (option.duration / option.frames > 0.1) {
          option.frames = Math.ceil(option.duration / 0.1);
        }
        gif = new GIF(gifOption);
        gif.on('finished', function(blob){
          var img;
          img = new Image();
          img.src = URL.createObjectURL(blob);
          return res({
            gif: img,
            frames: imgs,
            blob: blob
          });
        });
        _ = function(t){
          var p, ref$;
          p = (ref$ = 100 * t / option.duration) < 100 ? ref$ : 100;
          option.progress(p);
          if (t > option.duration) {
            return gif.render();
          }
          if (paramOption.step) {
            paramOption.step(t);
          }
          return smilToSvg(node, t).then(function(ret){
            var img, x$, delay;
            img = new Image();
            x$ = img.style;
            x$.width = option.width + "px";
            x$.height = option.height + "px";
            img.src = "data:image/svg+xml;base64," + btoa(ret);
            delay = Math.round(option.duration * 1000 / option.frames);
            gif.addFrame(img, {
              delay: delay
            });
            imgs.push(img);
            return setTimeout(function(){
              return _(t + option.duration / option.frames);
            }, option.slow);
          });
        };
        return setTimeout(function(){
          return _(0);
        }, option.slow);
      });
    };
  }
})(typeof module != 'undefined' && module !== null ? module.exports || (module.exports = {}) : window);
/*
<- $ document .ready
option = {width: 200, height: 200, duration: 2}
gifoption = do
  worker: 2,
  quality: 10,
  workerScript: \gif.worker.js,
  transparent: 0x0000ff
smiltool.smil-to-gif( document.getElementById(\svg), option, gifoption )
  .then -> document.body.appendChild it.gif
*/
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}