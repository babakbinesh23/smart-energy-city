/** Simplified educational calculations; do not use for billing or design. */
const validate = values => { for (const value of values) if (!Number.isFinite(value) || value < 0) throw new RangeError('Values must be finite and non-negative'); };
export function estimatePvEnergy({capacityKw,equivalentSunHoursPerDay,days=30,performanceRatio=.8}) {
 validate([capacityKw,equivalentSunHoursPerDay,days,performanceRatio]);
 if (performanceRatio>1) throw new RangeError('Invalid performance ratio');
 return capacityKw*equivalentSunHoursPerDay*days*performanceRatio;
}
export function aggregateEnergy(sites) {
 if (!Array.isArray(sites)) throw new TypeError('Expected list');
 validate(sites); return sites.reduce((a,b)=>a+b,0);
}
export function motorSavings({oldPowerW,newPowerW,hoursPerDay,days=30}) {
 validate([oldPowerW,newPowerW,hoursPerDay,days]); if(hoursPerDay>24) throw new RangeError('Invalid hours');
 const oldKwh=oldPowerW*hoursPerDay*days/1000;
 const newKwh=newPowerW*hoursPerDay*days/1000;
 return {oldKwh,newKwh,savedKwh:oldKwh-newKwh,reductionPercent:oldKwh?(oldKwh-newKwh)*100/oldKwh:0};
}
export function batteryUsableEnergy({capacityKwh,minSoc=.1,maxSoc=.9,dischargeEfficiency=.93}) {
 validate([capacityKwh,minSoc,maxSoc,dischargeEfficiency]);
 if(maxSoc>1||minSoc>maxSoc||dischargeEfficiency>1) throw new RangeError('Invalid SOC or efficiency');
 return capacityKwh*(maxSoc-minSoc)*dischargeEfficiency;
}
export function compareSupplyOffers({monthlyEnergyKwh,offerA,offerB}) {
 validate([monthlyEnergyKwh,offerA,offerB]);
 const costA=monthlyEnergyKwh*offerA,costB=monthlyEnergyKwh*offerB;
 return {costA,costB,difference:costB-costA};
}
