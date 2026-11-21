// The caller supplies the exact existing scenario data; no independent sample amounts.
const fa=new Intl.NumberFormat('fa-IR'),pct=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1});
export function billMetrics92(data){
 const {beforeEnergy:before,afterEnergy:after,consumption}=data;
 if(![before,after,consumption].every(Number.isFinite)||before<=0||after<0||consumption<=0)throw Error('Invalid bill comparison data');
 return Object.freeze({before,after,consumption,saved:before-after,percent:100*(before-after)/before,max:Math.ceil(Math.max(before,after)/3e9)*3e9});
}
export function createBillChart92(data){
 const m=billMetrics92(data),el=document.createElement('section');el.className='energy-chart92';el.dir='rtl';
 el.setAttribute('aria-label',`مقایسه بهای انرژی تأمین‌شده: قبل ${fa.format(m.before)} ریال، بعد ${fa.format(m.after)} ریال؛ ${pct.format(m.percent)} درصد کاهش، با مصرف یکسان.`);
 el.innerHTML=`<header class="chart-heading92"><div><span class="chart-kicker92">نتیجهٔ مقایسهٔ دو قبض</span><h2>همان مصرف؛ بهای انرژی کمتر</h2><p>مقایسهٔ بهای انرژی تأمین‌شده، قبل و بعد از همکاری</p></div><div class="chart-percent92"><strong><bdi>${pct.format(m.percent)}٪</bdi></strong><span>کاهش بهای انرژی</span></div></header><div class="chart-baseline92"><span class="chart-dot92"></span>مصرف مبنای یکسان: <bdi>${fa.format(m.consumption)}</bdi> کیلووات‌ساعت</div><figure class="chart-plot92"><figcaption>بهای انرژی تأمین‌شده <span>واحد محور: میلیارد ریال</span></figcaption><div class="chart-axis92" aria-hidden="true">${[0,1,2,3,4].map(i=>`<span>${pct.format(m.max*i/4/1e9)}</span>`).join('')}</div>${[['before','قبل از همکاری',m.before],['after','بعد از همکاری',m.after]].map(([key,label,value])=>`<div class="chart-row92 chart-${key}92"><div class="chart-row-label92"><span><i></i>${label}</span><strong><bdi>${fa.format(value)}</bdi><small> ریال</small></strong></div><div class="chart-track92"><div class="chart-bar92" data-chart-bar="${key}" style="width:${100*value/m.max}%"></div></div></div>`).join('')}</figure><div class="chart-metrics92"><div class="chart-saving92"><span>اختلاف بهای انرژی دو قبض</span><strong><bdi>${fa.format(m.saved)}</bdi> <small>ریال</small></strong></div><div><span>مبنای مقایسه</span><strong>مصرف برق یکسان</strong><small>تغییر در نرخ تأمین انرژی</small></div></div><p class="chart-note92">این نمودار بهای انرژی را مقایسه می‌کند؛ مبلغ نهایی قبض شامل اقلام دیگری هم هست.</p>`;
 const bars=[...el.querySelectorAll('[data-chart-bar]')];let last=-1;
 return {element:el,metrics:m,update(progress=1){progress=Math.min(1,Math.max(0,progress));if(progress===last)return;last=progress;for(const b of bars)b.style.transform=`scaleX(${progress.toFixed(4)})`;el.dataset.progress=String(progress);}};
}
export function drawBillChart92(ctx,data,progress=1){
 const m=billMetrics92(data),f=n=>fa.format(Math.round(n));ctx.save();ctx.clearRect(0,0,2048,1280);
 const fill=(x,y,w,h,c,r=24)=>{ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()};
 const text=(s,x,y,size=40,c='#163b43',weight=600)=>{ctx.font=`${weight} ${size}px Vazirmatn, sans-serif`;ctx.fillStyle=c;ctx.fillText(s,x,y)};
 fill(4,4,2040,1272,'#eef6f5',34);ctx.direction='rtl';ctx.textAlign='right';ctx.textBaseline='middle';
 text('برقتو / نتیجهٔ مقایسهٔ بهای انرژی',1970,65,30,'#41616a');text('همان مصرف؛ بهای انرژی کمتر',1950,165,70);
 fill(60,230,440,142,'#136e64');ctx.textAlign='center';text(pct.format(m.percent)+'٪',280,280,74,'#fff',800);text('کاهش بهای انرژی',280,340,29,'#d7fff1');ctx.textAlign='right';
 text('مصرف مبنای یکسان: '+f(m.consumption)+' کیلووات‌ساعت',1940,300,40);
 text('واحد محور نمودار: میلیارد ریال',1940,383,26,'#607c83');
 const x=100,width=1840;ctx.direction='ltr';ctx.textAlign='center';
 for(let i=0;i<=4;i++){const px=x+width*i/4;ctx.strokeStyle='#d1e2e2';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,470);ctx.lineTo(px,850);ctx.stroke();text(pct.format(m.max*i/4/1e9),px,442,27,'#64818a')}
 for(const [label,value,y,color] of [['قبل از همکاری',m.before,545,'#c66c53'],['بعد از همکاری',m.after,740,'#168779']]){
  ctx.direction='rtl';ctx.textAlign='right';text(label,1940,y-55,36);ctx.textAlign='left';text(f(value)+' ریال',100,y-55,36);
  fill(x,y,width,72,'#dfeaea',18);fill(x,y,Math.max(1,width*value/m.max*Math.max(0,Math.min(1,progress))),72,color,18);
 }
 fill(60,920,1928,172,'#dcefe6');ctx.direction='rtl';ctx.textAlign='right';text('اختلاف بهای انرژی دو قبض',1930,968,34,'#347163');text(f(m.saved)+' ریال',1930,1040,62,'#12564d',800);
 text('مقایسهٔ بهای انرژی؛ مبلغ نهایی قبض شامل اقلام دیگری هم هست.',1950,1158,30,'#516c72');ctx.restore();
}
