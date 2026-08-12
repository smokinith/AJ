/* ═══════════════════════════════════════════════════════════════════════
   AJ HOLIDAYS — SCENE ENGINE
   Zero-dependency canvas renderer: point-cloud globe → volumetric landscape.

   Design-system rules applied (ui-ux-pro-max / --stack threejs):
     · Canvas Dimensions Not Window  — size from canvas.clientWidth/Height
     · ResizeObserver Over resize    — observe the element, not the window
     · Lerp for Smooth Pointer Follow— v += (target - v) * 0.05
     · Cursor Feedback on Hover      — pointer over hit pins, auto on miss
     · Reduced Motion                — no autonomous motion, no parallax
   ═══════════════════════════════════════════════════════════════════════ */
window.AJScene = (function () {
  'use strict';

  var RAD = Math.PI / 180, COLS = 72, ROWS = 36;

  /* ── Coarse 5° landmass bitmap, stored as inclusive column ranges.
        Column index maps to longitude as col = (lon + 180) / 5, so
        col 0 = 180°W, col 22 = 70°W, col 36 = 0°, col 54 = 90°E.
        Rows run north→south, row r centred on lat = 90 − (r + 0.5)·5. ──── */
  var LAND = [
    [],                                             /*  87.5N  Arctic ocean */
    [[14,32],[39,41],[54,58]],                      /*  82.5N  Cdn Arctic, Greenland, Svalbard */
    [[12,32],[39,41],[54,60]],                      /*  77.5N */
    [[4,8],[12,32],[44,70]],                        /*  72.5N  N Alaska, Cdn islands, Greenland, Siberian coast */
    [[3,23],[26,32],[38,71]],                       /*  67.5N  Alaska, Canada, Greenland, Iceland, Russia */
    [[3,23],[26,28],[32,33],[37,71]],               /*  62.5N */
    [[4,6],[9,24],[34,36],[37,70]],                 /*  57.5N  Scotland, Scandinavia, Siberia */
    [[10,25],[34,68]],                              /*  52.5N  Canada, UK, Europe→Sakhalin */
    [[11,23],[35,65]],                              /*  47.5N  US/Canada border, Europe→Japan */
    [[11,22],[34,61],[63,65]],                      /*  42.5N  US east coast at col 22, Iberia at 34 */
    [[11,21],[34,36],[37,60],[61,64]],              /*  37.5N */
    [[12,20],[34,60],[62,64]],                      /*  32.5N */
    [[13,17],[19,20],[33,60]],                      /*  27.5N  Mexico, Florida, Sahara→China */
    [[15,17],[19,21],[32,59]],                      /*  22.5N  Cuba, W Africa, India, S China */
    [[15,17],[21,24],[32,47],[50,58],[60,61]],      /*  17.5N  Caribbean, Sahel, India, Philippines */
    [[17,19],[21,24],[32,46],[51,52],[55,58],[60,61]], /* 12.5N */
    [[20,24],[33,45],[52,52],[55,57],[60,61]],      /*   7.5N  Panama, Sri Lanka, SE Asia */
    [[20,26],[34,44],[55,60]],                      /*   2.5N  Amazon, equatorial Africa, Borneo */
    [[20,29],[37,44],[56,66]],                      /*   2.5S  Indonesia, Papua */
    [[20,29],[38,44],[57,59],[62,66]],              /*   7.5S  Java */
    [[20,28],[38,44],[60,64]],                      /*  12.5S  N Australia */
    [[22,28],[38,44],[45,46],[58,65]],              /*  17.5S  Madagascar, Australia */
    [[22,28],[38,43],[44,45],[58,66]],              /*  22.5S */
    [[21,26],[39,42],[58,66]],                      /*  27.5S */
    [[21,25],[39,42],[59,66]],                      /*  32.5S  S Africa, S Australia */
    [[21,24],[63,66],[70,71]],                      /*  37.5S  New Zealand */
    [[21,23],[65,65],[70,71]],                      /*  42.5S  Tasmania */
    [[21,22]],                                      /*  47.5S */
    [[21,22]],                                      /*  52.5S */
    [[22,22]],                                      /*  57.5S  Cape Horn */
    [],                                             /*  62.5S  Southern Ocean */
    [[0,20],[25,45],[50,71]],                       /*  67.5S  Antarctic coast */
    [[0,71]],[[0,71]],[[0,71]],[[0,71]]             /*  Antarctica */
  ];

  /* ── Destinations. lat/lon drive the globe pins; palette drives the
        volumetric landscape that the camera flies into. ──────────────── */
  var DEST = [
    { id:'AJH-BAL-07', name:'Bali', country:'Indonesia', lat:-8.41,  lon:115.19,
      nights:6, price:68999, tier:'signature', style:'beach',
      blurb:'Ubud canopy, Seminyak coastline and a Nusa Penida day sail.',
      inc:['4★ pool villa','Airport transfers','Nusa Penida cruise','Visa on arrival'],
      landmark:'palms',
      sky:['#0B0F19','#1B2A44','#F4A15D'], sun:['#FFD9A0',0.62,0.60],
      ridge:['#0E2436','#123243','#0A1B28','#050C14'], water:'#12384A' },

    { id:'AJH-MLE-05', name:'Maldives', country:'Indian Ocean', lat:3.20, lon:73.22,
      nights:4, price:94999, tier:'luxury', style:'beach',
      blurb:'Overwater villa, house-reef snorkelling, seaplane in and out.',
      inc:['Overwater villa','Seaplane transfer','Half board','Reef excursion'],
      landmark:'isles',
      sky:['#0A1220','#123A5C','#5FD6E8'], sun:['#DFF9FF',0.50,0.58],
      ridge:['#0C2E42','#0A2334','#071A26','#040F17'], water:'#0E5C74' },

    { id:'AJH-ZRH-09', name:'Swiss Alps', country:'Switzerland', lat:46.69, lon:7.86,
      nights:8, price:189999, tier:'luxury', style:'alpine',
      blurb:'Interlaken base, Jungfraujoch rack railway, Lucerne finish.',
      inc:['Swiss Travel Pass','Jungfraujoch','4★ central stays','Schengen file'],
      landmark:'peaks',
      sky:['#070C18','#16233F','#8FB4D9'], sun:['#EAF3FF',0.38,0.42],
      ridge:['#243953','#1A2A40','#101B2B','#070D16'], water:null },

    { id:'AJH-DXB-06', name:'Dubai', country:'UAE', lat:25.20, lon:55.27,
      nights:5, price:74999, tier:'signature', style:'city',
      blurb:'Burj Khalifa levels 124–125, desert safari, Marina cruise.',
      inc:['Burj Khalifa','Desert safari','Dhow dinner','14-day visa'],
      landmark:'towers',
      sky:['#100A18','#3A1E33','#E8A05C'], sun:['#FFCE8A',0.70,0.63],
      ridge:['#3A2A33','#2A1C26','#1A1119','#0C080D'], water:null },

    { id:'AJH-HKT-06', name:'Thailand', country:'Phuket · Krabi', lat:8.09, lon:98.91,
      nights:5, price:54999, tier:'value', style:'beach',
      blurb:'Phi Phi longtail circuit, Krabi limestone, Patong nights.',
      inc:['Phi Phi day trip','Speedboat transfers','Breakfast daily','VOA assist'],
      landmark:'isles',
      sky:['#0A1018','#153343','#6FE3D0'], sun:['#CFFFF4',0.30,0.55],
      ridge:['#0F3B3A','#0B2C2C','#08201F','#041312'], water:'#0E5A5E' },

    { id:'AJH-SXR-06', name:'Kashmir', country:'India', lat:34.08, lon:74.80,
      nights:5, price:42999, tier:'value', style:'wild',
      blurb:'Dal Lake houseboat, Gulmarg gondola, Pahalgam valley run.',
      inc:['Houseboat night','Gulmarg gondola','All transfers','Shikara ride'],
      landmark:'peaks',
      sky:['#080D19','#1A2742','#B9C9E0'], sun:['#FFFFFF',0.55,0.40],
      ridge:['#2B3A4F','#1E2A3B','#131C29','#080E15'], water:'#16324A' },

    { id:'AJH-IXZ-06', name:'Andaman', country:'India', lat:11.74, lon:92.66,
      nights:5, price:49999, tier:'signature', style:'wild',
      blurb:'Havelock beaches, Radhanagar sunset, scuba at Elephant Beach.',
      inc:['Havelock ferry','Scuba session','Sea-view rooms','Island permits'],
      landmark:'palms',
      sky:['#08111C','#0F3350','#7FE9C9'], sun:['#E8FFF6',0.42,0.60],
      ridge:['#0B3340','#082631','#061B23','#030F14'], water:'#0A4E5C' },

    { id:'AJH-HAN-07', name:'Vietnam', country:'Ha Long · Hanoi', lat:20.91, lon:107.18,
      nights:6, price:62999, tier:'value', style:'heritage',
      blurb:'Ha Long overnight junk, Hanoi old quarter, Ninh Binh sampan.',
      inc:['Ha Long cruise','Ninh Binh day','Old-quarter stay','E-visa filing'],
      landmark:'pagoda',
      sky:['#0A0F1A','#1C3348','#D9C08A'], sun:['#FFE9BE',0.66,0.55],
      ridge:['#123240','#0D2531','#091A23','#040E13'], water:'#0D3E4A' }
  ];

  var ORIGIN = { name:'Bengaluru', lat:12.97, lon:77.59 };

  /* ── Small helpers ───────────────────────────────────────────────────── */
  function clamp(v,a,b){ return v<a?a:v>b?b:v; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function smooth(t){ t=clamp(t,0,1); return t*t*(3-2*t); }
  function hex2rgb(h){
    h=h.replace('#','');
    if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n=parseInt(h,16); return [n>>16&255,n>>8&255,n&255];
  }
  function mixRGB(a,b,t){ return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)]; }
  function rgba(c,a){ return 'rgba('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+','+a+')'; }

  function toXYZ(lat,lon){
    var a=lat*RAD, o=lon*RAD, ca=Math.cos(a);
    return [ca*Math.sin(o), Math.sin(a), ca*Math.cos(o)];
  }

  /* Deterministic pseudo-random so silhouettes never flicker between frames */
  function rnd(seed){ var x=Math.sin(seed*127.1)*43758.5453; return x-Math.floor(x); }

  /* ── Build the point cloud once ──────────────────────────────────────── */
  function buildPoints(quality){
    var pts=[], r,c,i,j;
    for(r=0;r<ROWS;r++){
      var lat = 90 - (r+0.5)*(180/ROWS);
      var cosl = Math.max(0.06, Math.cos(lat*RAD));
      var ranges = LAND[r];
      for(c=0;c<COLS;c++){
        var lon0 = -180 + c*(360/COLS);
        var isLand=false;
        for(i=0;i<ranges.length;i++){ if(c>=ranges[i][0]&&c<=ranges[i][1]){ isLand=true; break; } }

        /* Land only. An ocean grid was tried and removed: sampling every Nth
           column against every row is anisotropic (15° apart horizontally vs
           5° vertically), which reads as a wireframe mesh rather than a
           planet. The sphere is defined by its body fill and limb glow. */
        if(!isLand) continue;

        /* subdivide, compensating longitude density by cos(lat) so poles
           don't turn into a solid clot of overlapping dots. A small
           deterministic jitter breaks up the lat/lon lattice, which
           otherwise reads as concentric arcs rather than terrain. */
        var nLon = Math.max(1, Math.round(quality*2*cosl));
        var nLat = quality;
        for(i=0;i<nLat;i++) for(j=0;j<nLon;j++){
          var seed = r*911 + c*37 + i*7 + j;
          var la = lat + (5*(i+0.5)/nLat - 2.5) + (rnd(seed)-0.5)*(5/nLat)*0.55;
          var lo = lon0 + 5*(j+0.5)/nLon      + (rnd(seed+313)-0.5)*(5/nLon)*0.55;
          var p = toXYZ(la,lo); p.push(1); pts.push(p);
        }
      }
    }
    return pts;
  }

  /* ── Great-circle flight path between two lat/lon ────────────────────── */
  function arcPoints(a,b,segs){
    var A=toXYZ(a.lat,a.lon), B=toXYZ(b.lat,b.lon);
    var dot=clamp(A[0]*B[0]+A[1]*B[1]+A[2]*B[2],-1,1), om=Math.acos(dot), so=Math.sin(om);
    var out=[],i;
    for(i=0;i<=segs;i++){
      var t=i/segs, s1,s2;
      if(so<1e-6){ s1=1-t; s2=t; } else { s1=Math.sin((1-t)*om)/so; s2=Math.sin(t*om)/so; }
      var x=A[0]*s1+B[0]*s2, y=A[1]*s1+B[1]*s2, z=A[2]*s1+B[2]*s2;
      var len=Math.sqrt(x*x+y*y+z*z) || 1;
      var alt=1+Math.sin(t*Math.PI)*0.22;
      out.push([x/len*alt, y/len*alt, z/len*alt]);
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════
     ENGINE
     ══════════════════════════════════════════════════════════════════════ */
  var cv, ctx, W=0, H=0, dpr=1, raf=0, running=false;
  var pts=[], arcs=[], stars=[], pinScreen=[];
  var reduced = false, lowPower = false;

  /* live state (lerped) vs. target state (set by scroll/hover) */
  var S = { yaw:-1.35, pitch:0.28, zoom:1, blend:0, drift:0, mx:0, my:0, glow:0 };
  var T = { yaw:-1.35, pitch:0.28, zoom:1, blend:0, drift:0, mx:0, my:0, glow:0 };

  var focusIdx = 0, prevIdx = 0, palT = 1;   /* palette cross-fade 0→1 */
  var hoverPin = -1, tick = 0;

  function palette(i){ return DEST[clamp(i,0,DEST.length-1)]; }

  /* Cached rgb arrays so we don't re-parse hex every frame */
  var PAL = DEST.map(function(d){
    return {
      sky: d.sky.map(hex2rgb),
      sun: hex2rgb(d.sun[0]), sunX: d.sun[1], sunY: d.sun[2],
      ridge: d.ridge.map(hex2rgb),
      water: d.water ? hex2rgb(d.water) : null,
      landmark: d.landmark
    };
  });

  function blendPal(a,b,t){
    var A=PAL[a], B=PAL[b];
    return {
      sky:[mixRGB(A.sky[0],B.sky[0],t), mixRGB(A.sky[1],B.sky[1],t), mixRGB(A.sky[2],B.sky[2],t)],
      sun: mixRGB(A.sun,B.sun,t),
      sunX: lerp(A.sunX,B.sunX,t), sunY: lerp(A.sunY,B.sunY,t),
      ridge:[mixRGB(A.ridge[0],B.ridge[0],t), mixRGB(A.ridge[1],B.ridge[1],t),
             mixRGB(A.ridge[2],B.ridge[2],t), mixRGB(A.ridge[3],B.ridge[3],t)],
      water: (A.water&&B.water) ? mixRGB(A.water,B.water,t)
           : (A.water ? A.water : (B.water ? B.water : null)),
      waterA: (A.water?1-t:0) + (B.water?t:0),
      /* landmarks are discrete shapes, not interpolatable values — carry
         both and cross-fade them by opacity */
      lmA: A.landmark, lmB: B.landmark, lmT: t
    };
  }

  /* ── Sizing: element-driven, never window-driven.
        Checked every frame as well as via ResizeObserver — a tab that is
        laid out while hidden reports 0 and RO does not deliver until it is
        painted, so a one-shot resize at init can leave the canvas at 0×0. ── */
  function resize(){
    var w = cv.clientWidth  || cv.getBoundingClientRect().width  || window.innerWidth  || 0;
    var h = cv.clientHeight || cv.getBoundingClientRect().height || window.innerHeight || 0;
    if(!w || !h) return false;                       /* nothing to size to yet */

    dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);
    var nw = Math.round(w*dpr), nh = Math.round(h*dpr);
    if(nw === W && nh === H) return false;

    W = nw; H = nh; cv.width = W; cv.height = H;
    stars = [];
    var n = lowPower ? 70 : 150, i;
    for(i=0;i<n;i++) stars.push([rnd(i+1)*W, rnd(i+99)*H*0.7, rnd(i+7)*1.2+0.3, rnd(i+13)]);
    return true;
  }

  /* ═══════════════ GLOBE ═══════════════ */
  function drawGlobe(alpha){
    var R = Math.min(W,H) * 0.30 * S.zoom;
    /* Sit the globe right of centre while it is small — the hero copy owns
       the left half — and recentre it as the camera pushes in. */
    var bias = 0.11 * (1 - clamp((S.zoom - 1) / 1.6, 0, 1));
    var cx = W*(0.5 + bias) + S.mx*W*0.028;
    var cy = H*0.48 + S.my*H*0.022;
    var D = 3.0;

    var cy_ = Math.cos(S.pitch), sy_ = Math.sin(S.pitch);
    var cyw = Math.cos(S.yaw),  syw = Math.sin(S.yaw);

    /* atmosphere */
    var g = ctx.createRadialGradient(cx,cy,R*0.72, cx,cy,R*1.45);
    g.addColorStop(0,'rgba(0,242,254,'+(0.16*alpha)+')');
    g.addColorStop(0.45,'rgba(0,140,200,'+(0.06*alpha)+')');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,R*1.45,0,6.2832); ctx.fill();

    /* sphere body — keeps back-facing dots from reading as foreground */
    ctx.fillStyle='rgba(7,11,20,'+(0.85*alpha)+')';
    ctx.beginPath(); ctx.arc(cx,cy,R*0.995,0,6.2832); ctx.fill();

    /* limb glow — defines the sphere now that ocean dots are gone */
    ctx.strokeStyle='rgba(0,242,254,'+(0.22*alpha)+')';
    ctx.lineWidth = Math.max(1, 1.2*dpr);
    ctx.beginPath(); ctx.arc(cx,cy,R*0.995,0,6.2832); ctx.stroke();

    /* dots, bucketed by depth so fillStyle changes ~7× instead of ~10000× */
    var NB=7, land=[], b;
    for(b=0;b<NB;b++) land.push([]);

    var i, p, x,y,z, x1,z1, y2,z2, k, sx,sy, sz;
    for(i=0;i<pts.length;i++){
      p=pts[i]; x=p[0]; y=p[1]; z=p[2];
      x1 = x*cyw + z*syw;  z1 = -x*syw + z*cyw;      /* yaw about Y */
      y2 = y*cy_ - z1*sy_; z2 = y*sy_ + z1*cy_;      /* pitch about X */
      k = D/(D-z2);
      sx = cx + x1*R*k; sy = cy - y2*R*k;
      if(sx<-40||sx>W+40||sy<-40||sy>H+40) continue;
      sz = z2;
      b = clamp(((sz+1)*0.5*NB)|0, 0, NB-1);
      land[b].push(sx,sy,k);
    }

    /* Dots must never land under 1 device pixel or the whole globe greys out
       into antialiasing mush. */
    var dotBase = Math.max(1.25*dpr, R*0.0078);
    for(b=0;b<NB;b++){
      var depth = b/(NB-1);
      var aL = (depth>0.5 ? 0.42+1.16*(depth-0.5) : 0.13*depth*2) * alpha;
      if(aL>0.005 && land[b].length){
        ctx.fillStyle = 'rgba('+Math.round(lerp(20,150,depth))+','
                              +Math.round(lerp(120,242,depth))+','
                              +Math.round(lerp(150,254,depth))+','+aL.toFixed(3)+')';
        var arr=land[b];
        for(i=0;i<arr.length;i+=3){
          var s=dotBase*arr[i+2];
          ctx.fillRect(arr[i]-s*0.5, arr[i+1]-s*0.5, s, s);
        }
      }
    }

    /* flight arcs BLR → destination */
    ctx.lineWidth = Math.max(1, 1.1*dpr);
    for(i=0;i<arcs.length;i++){
      var arc=arcs[i], started=false, vis=0;
      ctx.beginPath();
      for(var q=0;q<arc.length;q++){
        var a0=arc[q];
        var ax = a0[0]*cyw + a0[2]*syw, az = -a0[0]*syw + a0[2]*cyw;
        var ay = a0[1]*cy_ - az*sy_,   az2 = a0[1]*sy_ + az*cy_;
        if(az2 < -0.05){ started=false; continue; }
        var kk = D/(D-az2);
        var px = cx + ax*R*kk, py = cy - ay*R*kk;
        if(!started){ ctx.moveTo(px,py); started=true; } else ctx.lineTo(px,py);
        vis++;
      }
      if(vis>2){
        ctx.strokeStyle = 'rgba(0,242,254,'+(0.30*alpha)+')';
        ctx.stroke();
      }
      /* travelling pulse */
      if(!reduced){
        var t = (tick*0.0016 + i*0.17) % 1;
        var idx = (t*(arc.length-1))|0, a1=arc[idx];
        var bx = a1[0]*cyw + a1[2]*syw, bz = -a1[0]*syw + a1[2]*cyw;
        var by = a1[1]*cy_ - bz*sy_,   bz2 = a1[1]*sy_ + bz*cy_;
        if(bz2 > 0){
          var k2 = D/(D-bz2);
          var qx = cx + bx*R*k2, qy = cy - by*R*k2;
          ctx.fillStyle='rgba(180,250,255,'+(0.9*alpha)+')';
          ctx.beginPath(); ctx.arc(qx,qy,2.1*dpr,0,6.2832); ctx.fill();
        }
      }
    }

    /* pins + monospace coordinate labels */
    pinScreen.length = 0;
    var all = DEST.concat([{ name:ORIGIN.name, lat:ORIGIN.lat, lon:ORIGIN.lon, tier:'origin' }]);
    var pins = [];
    for(i=0;i<all.length;i++){
      var d=all[i], v=toXYZ(d.lat,d.lon);
      var vx = v[0]*cyw + v[2]*syw, vz = -v[0]*syw + v[2]*cyw;
      var vy = v[1]*cy_ - vz*sy_,   vz2 = v[1]*sy_ + vz*cy_;
      if(vz2 <= 0.06) continue;
      var kk2 = D/(D-vz2);
      pins.push({
        d:d, i:i, x:cx + vx*R*kk2, y:cy - vy*R*kk2,
        em:(vz2-0.06)/0.94,
        origin:d.tier==='origin',
        col: d.tier==='origin' ? [255,255,255]
           : (d.tier==='luxury' ? [201,138,75] : [0,242,254])
      });
    }
    /* front-most (and the hovered pin) get first claim on label space */
    pins.sort(function(a,b){
      if(hoverPin===a.i) return -1;
      if(hoverPin===b.i) return 1;
      return b.em - a.em;
    });

    var fontPx = 10.5*dpr, lineH = 12*dpr;
    ctx.font = fontPx+'px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign='left'; ctx.textBaseline='middle';
    var taken = [], showLabels = R > Math.min(W,H)*0.2;
    /* reserve the pin markers themselves so a neighbouring label never
       lands on top of another destination's dot */
    for(i=0;i<pins.length;i++){
      taken.push({ x:pins[i].x-11*dpr, y:pins[i].y-11*dpr, w:22*dpr, h:22*dpr });
    }

    for(i=0;i<pins.length;i++){
      var p=pins[i], isHover=(hoverPin===p.i), aP=alpha*(0.35+0.65*p.em);

      if(!p.origin) pinScreen.push({ i:p.i, x:p.x/dpr, y:p.y/dpr, r:16 });

      if(!reduced){
        var pl = ((tick*0.0012 + p.i*0.11) % 1);
        ctx.strokeStyle = rgba(p.col, aP*0.45*(1-pl));
        ctx.lineWidth = 1.2*dpr;
        ctx.beginPath(); ctx.arc(p.x,p.y,(3+pl*13)*dpr,0,6.2832); ctx.stroke();
      }
      ctx.fillStyle = rgba(p.col, aP*(isHover?1:0.92));
      ctx.beginPath(); ctx.arc(p.x,p.y,(isHover?4.2:3)*dpr,0,6.2832); ctx.fill();
      ctx.strokeStyle = rgba(p.col, aP*0.5);
      ctx.lineWidth = 1*dpr;
      ctx.beginPath(); ctx.arc(p.x,p.y,(isHover?9:6.5)*dpr,0,6.2832); ctx.stroke();

      if(!showLabels || p.em <= 0.3) continue;

      var name = p.d.name.toUpperCase(), coord = fmtCoord(p.d.lat,p.d.lon);
      var tw = Math.max(ctx.measureText(name).width, ctx.measureText(coord).width);
      var lx = p.x + 16*dpr, ly = p.y - lineH*0.5;
      var box = { x:lx-2*dpr, y:ly-lineH, w:tw+4*dpr, h:lineH*2.2 };

      /* flip to the left edge if the label would run off-canvas */
      if(box.x + box.w > W - 6*dpr){ lx = p.x - 16*dpr - tw; box.x = lx - 2*dpr; ctx.textAlign='right'; }
      else ctx.textAlign='left';
      var anchor = ctx.textAlign==='right' ? p.x - 16*dpr : lx;

      var collides = false;
      for(var t=0;t<taken.length;t++){
        var q=taken[t];
        if(box.x < q.x+q.w && box.x+box.w > q.x && box.y < q.y+q.h && box.y+box.h > q.y){
          collides = true; break;
        }
      }
      if(collides && !isHover) continue;      /* the hovered pin always wins */
      taken.push(box);

      var la = aP*(isHover?1:0.82);
      /* backing plate keeps mono labels readable over the dot field */
      ctx.fillStyle = 'rgba(9,13,22,'+(0.88*la).toFixed(3)+')';
      ctx.fillRect(box.x-3*dpr, box.y+lineH*0.3, box.w+6*dpr, box.h-lineH*0.42);
      ctx.fillStyle = rgba(p.col, la);
      ctx.fillText(name, anchor, p.y - 5*dpr);
      ctx.fillStyle = 'rgba(168,182,209,'+(la*0.62)+')';
      ctx.fillText(coord, anchor, p.y + 6.5*dpr);
    }
    ctx.textAlign='left';
  }

  function fmtCoord(lat,lon){
    return Math.abs(lat).toFixed(1)+'°'+(lat>=0?'N':'S')+' '+
           Math.abs(lon).toFixed(1)+'°'+(lon>=0?'E':'W');
  }

  /* ═══════════════ VOLUMETRIC LANDSCAPE ═══════════════ */
  function ridgeY(x, seed, amp, freq, base){
    var v = Math.sin(x*freq + seed)*0.5
          + Math.sin(x*freq*2.31 + seed*1.7)*0.27
          + Math.sin(x*freq*4.73 + seed*2.9)*0.13;
    return base - v*amp;
  }

  function drawLandscape(alpha, P){
    var horizon = H*0.62 + S.drift*H*0.06 + S.my*H*0.012;

    ctx.globalAlpha = alpha;

    /* sky */
    var g = ctx.createLinearGradient(0,0,0,horizon);
    g.addColorStop(0, rgba(P.sky[0],1));
    g.addColorStop(0.55, rgba(P.sky[1],1));
    g.addColorStop(1, rgba(P.sky[2],1));
    ctx.fillStyle=g; ctx.fillRect(0,0,W,horizon+2);

    /* stars, fading out as the sky lightens toward the horizon */
    var i;
    for(i=0;i<stars.length;i++){
      var st=stars[i];
      var tw = reduced ? 0.6 : 0.45+0.55*Math.abs(Math.sin(tick*0.0009 + st[3]*9));
      var fade = clamp(1 - st[1]/(horizon*0.9), 0, 1);
      ctx.fillStyle='rgba(220,235,255,'+(0.5*tw*fade).toFixed(3)+')';
      ctx.fillRect(st[0], st[1]+S.drift*H*0.02, st[2]*dpr, st[2]*dpr);
    }

    /* sun / moon with bloom */
    var sx = W*P.sunX + S.mx*W*0.012, sy = horizon - H*P.sunY*0.42;
    var sr = Math.min(W,H)*0.075;
    var sg = ctx.createRadialGradient(sx,sy,0,sx,sy,sr*5);
    sg.addColorStop(0, rgba(P.sun,0.95));
    sg.addColorStop(0.12, rgba(P.sun,0.55));
    sg.addColorStop(0.4, rgba(P.sun,0.14));
    sg.addColorStop(1, rgba(P.sun,0));
    ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sx,sy,sr*5,0,6.2832); ctx.fill();
    ctx.fillStyle=rgba(P.sun,0.92);
    ctx.beginPath(); ctx.arc(sx,sy,sr*0.5,0,6.2832); ctx.fill();

    /* water plane */
    if(P.water && P.waterA>0.01){
      ctx.globalAlpha = alpha*P.waterA;
      var wg = ctx.createLinearGradient(0,horizon,0,H);
      wg.addColorStop(0, rgba(P.water,0.95));
      wg.addColorStop(1, rgba(mixRGB(P.water,[4,8,14],0.72),1));
      ctx.fillStyle=wg; ctx.fillRect(0,horizon,W,H-horizon);

      /* Reflection pool. A vertical-gradient column was tried and removed:
         its left/right edges are hard, so it reads as a rectangle painted
         on the sea. A radial falloff from the waterline looks like light. */
      var pool = Math.max(W*0.13, (H-horizon)*1.5);
      var rg = ctx.createRadialGradient(sx,horizon,0, sx,horizon,pool);
      rg.addColorStop(0,    rgba(P.sun,0.34));
      rg.addColorStop(0.35, rgba(P.sun,0.13));
      rg.addColorStop(1,    rgba(P.sun,0));
      ctx.fillStyle=rg; ctx.fillRect(0,horizon,W,H-horizon);

      for(i=0;i<16;i++){
        var yy = horizon + Math.pow(i/16,1.7)*(H-horizon);
        var ph = reduced ? 0 : Math.sin(tick*0.0011 + i*0.9);
        var wdt = W*(0.05+0.07*i/16);          /* reflection widens with distance */
        ctx.fillStyle='rgba(255,255,255,'+(0.075*(1-i/16)).toFixed(3)+')';
        ctx.fillRect(sx-wdt*0.5+ph*W*0.014, yy, wdt, Math.max(1,1.2*dpr));
      }
      ctx.globalAlpha = alpha;
    }

    /* four parallax ridge layers, far → near. The landmark silhouette is
       drawn after the two far layers and before the two near ones, so it
       sits *in* the scene — drawing it first buries it entirely. */
    var cfg = [
      { amp:H*0.055, freq:0.0042, base:horizon-H*0.055, par:0.006 },
      { amp:H*0.075, freq:0.0058, base:horizon-H*0.018, par:0.013 },
      { amp:H*0.095, freq:0.0079, base:horizon+H*0.045, par:0.024 },
      { amp:H*0.130, freq:0.0104, base:horizon+H*0.145, par:0.040 }
    ];
    var step = Math.max(6, 10*dpr);
    var wet = P.waterA || 0;
    function ridgeLayer(L){
      var c=cfg[L], off = S.mx*W*c.par + S.drift*H*c.par*2.2;
      /* On coastal palettes the sea has to survive: fade the two distant
         land layers out and push the two near ones down to a shoreline,
         otherwise the ridges paint straight over the water plane. */
      var la   = L < 2 ? 1 - wet*0.88 : 1;
      if(la <= 0.012) return;
      var base = c.base + (L < 2 ? 0 : wet*H*0.30);
      var amp  = c.amp  * (L < 2 ? 1 : 1 - wet*0.45);

      ctx.fillStyle = rgba(P.ridge[L], la);
      ctx.beginPath(); ctx.moveTo(-20, H+20);
      for(var x=-20;x<=W+20;x+=step){
        ctx.lineTo(x, ridgeY(x+off, 11.3+L*4.7, amp, c.freq, base + S.drift*H*0.05));
      }
      ctx.lineTo(W+20, H+20); ctx.closePath(); ctx.fill();
    }

    ridgeLayer(0);
    ridgeLayer(1);
    if(P.lmT < 0.999){
      ctx.globalAlpha = alpha*(1-P.lmT);
      drawLandmark(P, horizon, alpha*(1-P.lmT), P.lmA);
    }
    if(P.lmT > 0.001){
      ctx.globalAlpha = alpha*P.lmT;
      drawLandmark(P, horizon, alpha*P.lmT, P.lmB);
    }
    ctx.globalAlpha = alpha;
    ridgeLayer(2);
    ridgeLayer(3);

    /* haze band to seat the layers into the sky */
    var hz = ctx.createLinearGradient(0,horizon-H*0.10,0,horizon+H*0.06);
    hz.addColorStop(0, rgba(P.sky[2],0));
    hz.addColorStop(0.5, rgba(P.sky[2],0.16));
    hz.addColorStop(1, rgba(P.sky[2],0));
    ctx.fillStyle=hz; ctx.fillRect(0,horizon-H*0.10,W,H*0.16);

    ctx.globalAlpha = 1;
  }

  function drawLandmark(P, horizon, alpha, kind){
    /* Silhouette reads against the sky, so it must be darker than the far
       ridges it stands in front of — ridge[3] is the darkest of the four. */
    var col = rgba(P.ridge[3], 0.96);
    var baseY = horizon + H*0.028;
    var cx = W*0.5 + S.mx*W*0.02;
    var u = Math.min(W,H);
    ctx.fillStyle = col;

    switch(kind){
      case 'towers': {
        var xs=[-0.20,-0.11,-0.04,0.05,0.13,0.21], hs=[0.20,0.34,0.13,0.46,0.17,0.26];
        for(var i=0;i<xs.length;i++){
          var w=u*(0.028+0.012*rnd(i+3)), h=u*hs[i];
          ctx.fillRect(cx+W*xs[i]-w/2, baseY-h, w, h);
          if(hs[i]>0.4){ /* spire */
            ctx.beginPath();
            ctx.moveTo(cx+W*xs[i], baseY-h-u*0.085);
            ctx.lineTo(cx+W*xs[i]-w*0.22, baseY-h);
            ctx.lineTo(cx+W*xs[i]+w*0.22, baseY-h);
            ctx.closePath(); ctx.fill();
          }
        }
        break;
      }
      case 'peaks': {
        for(var p=0;p<3;p++){
          var px=cx+W*(-0.16+p*0.16), ph=u*(0.30-p*0.05), pw=u*(0.20-p*0.03);
          ctx.beginPath();
          ctx.moveTo(px, baseY-ph);
          ctx.lineTo(px+pw, baseY); ctx.lineTo(px-pw, baseY);
          ctx.closePath(); ctx.fill();
          /* snow cap */
          ctx.fillStyle='rgba(233,240,252,'+(0.55*alpha).toFixed(2)+')';
          ctx.beginPath();
          ctx.moveTo(px, baseY-ph);
          ctx.lineTo(px+pw*0.30, baseY-ph*0.66);
          ctx.lineTo(px+pw*0.10, baseY-ph*0.72);
          ctx.lineTo(px-pw*0.14, baseY-ph*0.62);
          ctx.lineTo(px-pw*0.30, baseY-ph*0.66);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle=col;
        }
        break;
      }
      case 'palms': {
        for(var t=0;t<4;t++){
          var tx=cx+W*(-0.26+t*0.17+rnd(t+9)*0.03), th=u*(0.17+rnd(t)*0.09);
          var lean=(rnd(t+2)-0.5)*u*0.05;
          ctx.strokeStyle=col; ctx.lineCap='round';
          ctx.lineWidth=Math.max(2,u*0.007);
          ctx.beginPath(); ctx.moveTo(tx,baseY);
          ctx.quadraticCurveTo(tx+lean*0.5, baseY-th*0.6, tx+lean, baseY-th);
          ctx.stroke();

          /* Fronds arc up then droop. Radiating straight spokes were tried
             and read as an antenna, not a palm. */
          var cxT = tx+lean, cyT = baseY-th;
          ctx.lineWidth = Math.max(1.6, u*0.0055);
          for(var f=0;f<7;f++){
            var sp = (f/6) - 0.5;                       /* −0.5 … 0.5 */
            var dx = sp * u*0.23;
            var tip = cyT + u*0.030 + Math.abs(sp)*u*0.022;
            ctx.beginPath(); ctx.moveTo(cxT, cyT);
            ctx.quadraticCurveTo(cxT + dx*0.5, cyT - u*0.042, cxT + dx, tip);
            ctx.stroke();
          }
          ctx.lineCap='butt';
        }
        break;
      }
      case 'isles': {
        for(var k=0;k<4;k++){
          var ix=cx+W*(-0.30+k*0.20), iw=u*(0.05+rnd(k+4)*0.045), ih=u*(0.09+rnd(k+8)*0.10);
          ctx.beginPath();
          ctx.moveTo(ix-iw, baseY);
          ctx.bezierCurveTo(ix-iw*0.8, baseY-ih*0.9, ix-iw*0.2, baseY-ih, ix, baseY-ih*0.95);
          ctx.bezierCurveTo(ix+iw*0.3, baseY-ih, ix+iw*0.9, baseY-ih*0.7, ix+iw, baseY);
          ctx.closePath(); ctx.fill();
        }
        break;
      }
      case 'pagoda': {
        var gx=cx, gy=baseY, tiers=4;
        for(var n=0;n<tiers;n++){
          var tw=u*(0.15-n*0.028), ty=gy-u*0.055*(n+1);
          ctx.beginPath();
          ctx.moveTo(gx-tw, ty+u*0.012);
          ctx.quadraticCurveTo(gx, ty-u*0.026, gx+tw, ty+u*0.012);
          ctx.lineTo(gx+tw*0.62, ty+u*0.022);
          ctx.lineTo(gx-tw*0.62, ty+u*0.022);
          ctx.closePath(); ctx.fill();
          ctx.fillRect(gx-tw*0.30, ty+u*0.020, tw*0.60, u*0.038);
        }
        ctx.fillRect(gx-u*0.004, gy-u*0.055*tiers-u*0.05, u*0.008, u*0.05);
        break;
      }
    }
  }

  /* ═══════════════ FRAME ═══════════════ */
  function draw(){
    resize();
    if(!W || !H) return;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#0B0F19'; ctx.fillRect(0,0,W,H);

    var P = blendPal(prevIdx, focusIdx, smooth(palT));
    if(S.blend > 0.004) drawLandscape(clamp(S.blend,0,1), P);
    if(S.blend < 0.996) drawGlobe(clamp(1-S.blend,0,1));
  }

  function frame(){
    tick += 16;

    /* Lerp toward targets — alpha 0.05 per the threejs "Lerp for Smooth
       Pointer Follow" rule; reduced motion snaps instead. */
    var a = reduced ? 1 : 0.055;
    S.yaw   += (T.yaw   - S.yaw)   * a;
    S.pitch += (T.pitch - S.pitch) * a;
    S.zoom  += (T.zoom  - S.zoom)  * a;
    S.blend += (T.blend - S.blend) * (reduced?1:0.075);
    S.drift += (T.drift - S.drift) * a;
    S.mx    += (T.mx    - S.mx)    * (reduced?1:0.05);
    S.my    += (T.my    - S.my)    * (reduced?1:0.05);

    if(!reduced && S.blend < 0.02) T.yaw += 0.00075;   /* idle orbit */
    if(palT < 1) palT = Math.min(1, palT + (reduced?1:0.03));

    draw();

    if(running) raf = requestAnimationFrame(frame);
  }

  /* ═══════════════ PUBLIC API ═══════════════ */
  function init(canvas, opts){
    cv = canvas; ctx = cv.getContext('2d', { alpha:false });
    opts = opts || {};
    reduced  = !!opts.reduced;
    lowPower = !!opts.lowPower;

    pts  = buildPoints(lowPower ? 2 : 3);
    arcs = [0,1,2,3,4].map(function(i){ return arcPoints(ORIGIN, DEST[i], 44); });

    resize();
    if(window.ResizeObserver){
      new ResizeObserver(resize).observe(cv);          /* element, not window */
    } else {
      window.addEventListener('resize', resize);
    }

    document.addEventListener('visibilitychange', function(){
      if(document.hidden) stop(); else start();
    });

    start();
    return api;
  }

  function start(){ if(!running){ running=true; raf=requestAnimationFrame(frame); } }
  function stop(){ running=false; cancelAnimationFrame(raf); }

  var api = {
    init: init, start: start, stop: stop,
    /* force a synchronous repaint — used after layout changes that RO may
       not report (hidden tab becoming visible, print, headless capture) */
    redraw: draw,
    destinations: DEST,
    origin: ORIGIN,
    fmtCoord: fmtCoord,

    /* pointer parallax, normalised −1…1 */
    pointer: function(nx, ny){ if(reduced) return; T.mx = clamp(nx,-1,1); T.my = clamp(ny,-1,1); },

    /* scroll-driven camera. `hard:true` snaps live state to the target
       instead of easing into it — mirrors focus(i, hard). */
    camera: function(o){
      if('zoom'  in o) T.zoom  = o.zoom;
      if('blend' in o) T.blend = clamp(o.blend,0,1);
      if('drift' in o) T.drift = o.drift;
      if(o.hard){ S.zoom = T.zoom; S.blend = T.blend; S.drift = T.drift; }
    },

    /* aim the globe at a destination (also used for the fly-in) */
    focus: function(i, hard){
      i = clamp(i,0,DEST.length-1);
      if(i !== focusIdx){ prevIdx = focusIdx; focusIdx = i; palT = hard ? 1 : 0; }
      var d = DEST[i];
      T.yaw = -d.lon*RAD; T.pitch = d.lat*RAD;
      if(hard){ S.yaw=T.yaw; S.pitch=T.pitch; }
    },
    focusIndex: function(){ return focusIdx; },

    /* hit-test in CSS pixels; returns destination index or −1 */
    hit: function(x,y){
      var best=-1, bd=1e9, i;
      for(i=0;i<pinScreen.length;i++){
        var p=pinScreen[i], dx=p.x-x, dy=p.y-y, d2=dx*dx+dy*dy;
        if(d2 < p.r*p.r && d2 < bd){ bd=d2; best=p.i; }
      }
      return best < DEST.length ? best : -1;
    },
    setHover: function(i){ hoverPin = (i==null?-1:i); }
  };

  return api;
})();
