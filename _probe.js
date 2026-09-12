window.__probe=function(doc){
 doc=doc||document;
 var stage=doc.querySelector('.ax__stage'), svg=stage.querySelector('svg');
 var vb=svg.getAttribute('viewBox').split(/\s+/).map(Number);
 var M0=svg.getScreenCTM(), IM=M0.inverse();
 function P(x,y){var p=svg.createSVGPoint();p.x=x;p.y=y;return p;}
 function box(el){var r=el.getBoundingClientRect();var a=P(r.left,r.top).matrixTransform(IM),b=P(r.right,r.bottom).matrixTransform(IM);
   return {x:+a.x.toFixed(1),y:+a.y.toFixed(1),w:+(b.x-a.x).toFixed(1),h:+(b.y-a.y).toFixed(1)};}
 function toLocal(el,X,Y){var m=el.getScreenCTM();if(!m)return null;var sp=P(X,Y).matrixTransform(M0);var lp=sp.matrixTransform(m.inverse());return lp;}
 function hit(el,X,Y){ if(!el.isPointInFill) return null; var lp=toLocal(el,X,Y); if(!lp) return null;
   var d={x:lp.x,y:lp.y}; var f=false,s=false; try{f=el.isPointInFill(d);}catch(e){} try{s=el.isPointInStroke(d);}catch(e){} return f||s; }
 // classify every drawn element
 var els=[].slice.call(svg.querySelectorAll('path,circle,rect,line,text,ellipse'));
 var cat=[];
 els.forEach(function(el,i){
   var f=el.getAttribute('fill')||'', st=el.getAttribute('stroke')||'', cls=el.getAttribute('class')||'', tg=el.tagName;
   var role='?';
   if(tg==='rect'&&f==='#FBFAF6')role='bg';
   else if(tg==='rect'&&f==='#E4D9C3')role='ground';
   else if(f==='url(#axBody)')role='body';
   else if(f==='url(#axSun)')role='sun';
   else if(st==='#F3AC16')role='sunray';
   else if(st==='#F2A72E'||f==='#F2A72E')role='lightray';
   else if(f==='#C6E2AC'||f==='#D9E9CC'||f==='#A8D98C'||f==='#EFE6D0'||f==='#E9DCC0'||f==='#CFE8C4')role='cell';
   else if(st==='#1F5A31'&&f==='none')role='cellarrow';
   else if(f==='#2F7D46')role='tipregion';
   else if(st==='#1F5A31'&&el.getAttribute('stroke-dasharray'))role='tipdash';
   else if(f==='#F2E7C8')role='gelatin';
   else if(f==='#B9BFC7')role='micalayer';
   else if(st==='#6C7681'&&f==='none'&&el.getAttribute('stroke-width')==='5.5')role='micaplate';
   else if(f==='#F6DFAE')role='agarAuxin';
   else if(f==='#EFEFE6')role='agarPlain';
   else if(f==='#3A3A3A'||f==='#4A4A4A')role='opaqueCover';
   else if(f==='#BFD8E8')role='clearCap';
   else if(f==='#F5A623'&&tg==='circle'&&el.getAttribute('r')==='3.5')role='grain';
   else if(f==='#FFE7B5')role='grainHi';
   else if(f==='#F5A623'&&tg==='path')role='wash';
   else if(f==='#F5A623'&&tg==='circle')role='blockgrain';
   else if(cls==='ax__l')role='labelText';
   else if(cls==='ax__pin')role='pinNum';
   else if(cls==='ax__s')role='sceneText';
   else if(f==='#FFFFFF'&&st==='#5A5A5A')role='pinDisc';
   else if(f==='#9A9A9A'&&tg==='circle')role='anchorDot';
   else if(st==='#9A9A9A'&&f==='none')role='leader';
   else if(st==='#B79E74')role='groundline';
   cat.push({i:i,role:role,tag:tg,cls:cls,txt:tg==='text'?el.textContent:'',b:box(el),el:el,
             d:el.getAttribute('d')||'',cx:el.getAttribute('cx'),cy:el.getAttribute('cy')});
 });
 return {vb:vb,cat:cat,svg:svg,stage:stage,hit:hit,box:box,
   stageRect:(function(){var r=stage.getBoundingClientRect();var a=P(r.left,r.top).matrixTransform(IM),b=P(r.right,r.bottom).matrixTransform(IM);
     return {x:+a.x.toFixed(1),y:+a.y.toFixed(1),x2:+b.x.toFixed(1),y2:+b.y.toFixed(1)};})(),
   pins:(function(){return [].slice.call(doc.querySelectorAll('.ax__pins li')).map(function(l){return l.textContent;});})(),
   verdict:(function(){var w=doc.querySelector('.ax__why');return w?w.textContent:'';})(),
   stageW:stage.clientWidth};
};
window.__sum=function(doc){
 var R=window.__probe(doc);
 var o={vb:R.vb,stageW:R.stageW,stageRect:R.stageRect,pins:R.pins,verdict:R.verdict,labels:[],anchors:[],leaders:[],parts:{}};
 R.cat.forEach(function(c){
  if(c.role==='labelText')o.labels.push({t:c.txt,b:c.b});
  else if(c.role==='anchorDot')o.anchors.push({x:+c.cx,y:+c.cy});
  else if(c.role==='leader')o.leaders.push(c.d);
  else if(c.role==='pinDisc')o.anchors.push({x:+c.cx,y:+c.cy,pin:1});
  else if(c.role==='pinNum')o.labels.push({t:c.txt,b:c.b,pin:1});
  else { (o.parts[c.role]=o.parts[c.role]||[]).push({b:c.b,tag:c.tag,txt:c.txt}); }
 });
 return o;
};
