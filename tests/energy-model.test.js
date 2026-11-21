import {test} from 'node:test';
import assert from 'node:assert/strict';
import {estimatePvEnergy,aggregateEnergy,motorSavings,batteryUsableEnergy,compareSupplyOffers} from '../src/energy-model.js';
test('PV energy',()=>assert.equal(estimatePvEnergy({capacityKw:10,equivalentSunHoursPerDay:5}),1200));
test('PV validates',()=>assert.throws(()=>estimatePvEnergy({capacityKw:-2,equivalentSunHoursPerDay:5}),RangeError));
test('Aggregation',()=>assert.equal(aggregateEnergy([50,80,20]),150));
test('Motor savings',()=>assert.equal(motorSavings({oldPowerW:750,newPowerW:400,hoursPerDay:10}).savedKwh,105));
test('Storage',()=>assert.ok(Math.abs(batteryUsableEnergy({capacityKwh:100})-74.4)<1e-9));
test('Supply comparison',()=>assert.deepEqual(compareSupplyOffers({monthlyEnergyKwh:100,offerA:3,offerB:5}),{costA:300,costB:500,difference:200}));
