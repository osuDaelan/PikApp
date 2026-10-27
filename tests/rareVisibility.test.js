import test from "node:test";
import assert from "node:assert/strict";
import { DECOR_LOCATIONS } from "../src/features/decor/catalog.js";
import { decorId, countDecorGroups, isRareCostume } from "../src/features/decor/collection.js";
import { rareCategory, rareVisibilityKey, validateRareVisibility, isDecorCostumeVisible } from "../src/features/decor/rareVisibility.js";
import { compileDecorSearch, searchDecorCatalog } from "../src/features/decor/search.js";

const cafe = DECOR_LOCATIONS.find(group => group.location === "Café");
const base = cafe.costumes.find(costume => !isRareCostume(costume));
const rare = cafe.costumes.find(isRareCostume);
const key = rareVisibilityKey(cafe);
const completeBase = Object.fromEntries(base.colors.map(color => [decorId(cafe.location, base.name, color), true]));
const rareRed = decorId(cafe.location, rare.name, "Red");
const ice = decorId(cafe.location, base.name, "Ice");

test("Auto keeps existing rare Café progress visible when Ice is missing", () => {
  const saved = { ...completeBase, [ice]: false, [rareRed]: true };
  const before = structuredClone(saved);
  assert.equal(isDecorCostumeVisible(cafe, rare, saved), true);
  assert.equal(isDecorCostumeVisible(cafe, rare, {...saved, [rareRed]:false}), false);
  assert.deepEqual(saved, before);
});

test("Auto is reversible after accidental base completion and does not latch an unlock", () => {
  assert.equal(isDecorCostumeVisible(cafe, rare, completeBase), true);
  assert.equal(isDecorCostumeVisible(cafe, rare, {...completeBase, [ice]:false}), false);
  assert.equal(isDecorCostumeVisible(cafe, rare, {}), false);
});

test("Show and Hide override Auto without changing collected flags; Hide wins over Show all", () => {
  const saved = { [rareRed]: true };
  assert.equal(isDecorCostumeVisible(cafe, rare, {}, {[key]:"show"}), true);
  assert.equal(isDecorCostumeVisible(cafe, rare, saved, {[key]:"hide"}, true), false);
  assert.equal(isDecorCostumeVisible(cafe, base, saved, {[key]:"hide"}), true);
  assert.equal(isDecorCostumeVisible(cafe, rare, {}, {}, true), true);
  assert.deepEqual(saved, {[rareRed]:true});
});

test("Auto uses the full category rather than a search-filtered base or rare row", () => {
  const filtered = {...cafe, costumes:[{...base, colors:["Red"]}]};
  assert.equal(rareCategory(filtered), cafe);
  assert.equal(isDecorCostumeVisible(filtered, rare, {[decorId(cafe.location,base.name,"Red")]:true}), false);
  assert.equal(isDecorCostumeVisible({...cafe,costumes:[rare]}, rare, completeBase), true);
  const forest = DECOR_LOCATIONS.find(group => group.location === "Forest");
  const rows = forest.costumes.filter(isRareCostume);
  const saved = {[decorId(forest.location,rows[0].name,"Red")]:true};
  assert.equal(isDecorCostumeVisible(forest,rows[1],saved), true);
});

test("hidden search matches retain an editable header but provide no tile or bulk targets", () => {
  const saved = {[rareRed]:true};
  for (const mode of ["hide","auto"]) {
    const options = {rareVisibility:{[key]:mode},showAllDecor:false};
    const result = searchDecorCatalog(compileDecorSearch("cafe rare"), mode==="auto"?{}:saved, new Set([rareRed]), options);
    assert.equal(result.regular.length, 1);
    assert.equal(result.regular[0].rareHidden, true);
    assert.deepEqual(result.regular[0].costumes, []);
    assert.deepEqual(countDecorGroups(result.regular,saved), {total:0,done:0});
    assert.equal(result.retainedCount,0);
  }
  const show = searchDecorCatalog(compileDecorSearch("cafe rare"),{},new Set(),{rareVisibility:{[key]:"show"},showAllDecor:false});
  assert.equal(countDecorGroups(show.regular,{}).total,7);
  const auto = searchDecorCatalog(compileDecorSearch("cafe rare"),completeBase,new Set(),{showAllDecor:false});
  assert.equal(countDecorGroups(auto.regular,completeBase).total,7);
});

test("Hide excludes retained rare edits without hiding base search results", () => {
  const result = searchDecorCatalog(compileDecorSearch("missing cafe"),{[rareRed]:true},new Set([rareRed]),{rareVisibility:{[key]:"hide"}});
  assert.equal(countDecorGroups(result.regular,{}).total,8);
  assert.equal(result.retainedCount,0);
  assert(result.regular.every(group=>group.costumes.every(costume=>!isRareCostume(costume))));
});

test("only known rare categories and Auto/Show/Hide values can be saved", () => {
  assert.deepEqual(validateRareVisibility({[key]:"show"}),{[key]:"show"});
  for (const value of [null,[],{unknown:"show"},{[key]:true},{[key]:"unlock"},{[rareVisibilityKey(DECOR_LOCATIONS.find(g=>g.location==="Zoo"))]:"hide"}]) {
    assert.throws(()=>validateRareVisibility(value));
  }
});

test("Station Ticket rares do not unlock from Paper Train or Gold Ticket progress", () => {
  const station = DECOR_LOCATIONS.find(group=>group.location==="Station");
  const ticketRare = station.costumes.find(isRareCostume);
  const ticket = station.costumes.find(costume=>costume.name==="Ticket");
  const train = station.costumes.find(costume=>costume.name==="Paper Train");
  const saved = Object.fromEntries(train.colors.map(color=>[decorId("Station",train.name,color),true]));
  saved.station__gold_ticket__Red=true;
  assert.equal(isRareCostume(station.costumes.find(costume=>costume.name==="Gold Ticket")),false);
  assert.equal(isDecorCostumeVisible(station,ticketRare,{}),false);
  assert.equal(isDecorCostumeVisible(station,ticketRare,saved),false);
  Object.assign(saved,Object.fromEntries(ticket.colors.map(color=>[decorId("Station",ticket.name,color),true])));
  assert.equal(isDecorCostumeVisible(station,ticketRare,saved),true);
  saved.station__ticket__Ice=false;
  assert.equal(isDecorCostumeVisible(station,ticketRare,saved),false);
  saved.station__ticket_rare__Red=true;
  assert.equal(isDecorCostumeVisible(station,ticketRare,saved),true);
});
