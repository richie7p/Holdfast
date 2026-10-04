import assert from "node:assert/strict";
import { test } from "node:test";
import { GameEngine } from "./engine";
import { STAGES } from "./stages";
import { isBuildable } from "./map";
import { TOWERS, COLS, ROWS } from "./config";
import { loadProgress, saveProgress, recordWin, parseProgress, starsFromLives, KEY } from "./progress";
function memory() { const data=new Map<string,string>(); Object.defineProperty(globalThis,"localStorage",{configurable:true,value:{getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v),removeItem:(k:string)=>data.delete(k)}}); return data; }
test("legacy progress migrates and invalid numbers are bounded", () => {
 const data=memory(); data.set("holdfast-progress-v1",'{"unlocked":2,"stars":[3,2]}'); assert.equal(loadProgress().unlocked,2); assert.equal(loadProgress().stars.length,STAGES.length);
 assert.deepEqual(parseProgress('{"unlocked":"9","stars":[-1,99,1.7,"bad"]}').stars.slice(0,4),[0,3,1,0]);
 for(const s of ['null','[]','{"stars":null}']) assert.throws(()=>parseProgress(s));
});
test("wins preserve best stars, recover a backup and reject invalid stage indices",()=>{
 const data=memory(); recordWin(0,3); recordWin(0,1); assert.equal(loadProgress().stars[0],3); assert.equal(loadProgress().unlocked,1);
 const before=loadProgress(); recordWin(-1,3); recordWin(999,3); assert.deepEqual(loadProgress(),before);
 saveProgress(before); data.set(KEY,"bad"); assert.deepEqual(loadProgress(),before); assert.deepEqual(parseProgress(JSON.stringify(before)),before);
});
test("life thresholds determine earned stars",()=>{ assert.equal(starsFromLives(0,10),0);assert.equal(starsFromLives(2,10),1);assert.equal(starsFromLives(3,10),2);assert.equal(starsFromLives(6,10),3); });
test("stage selection rejects locked, negative and non-integer indices",()=>{
 const e=new GameEngine(); for(const i of [-1,1,1.5,NaN,999]) e.startStage(i); assert.equal(e.phase,"select");e.startStage(0);assert.equal(e.phase,"playing");
});
test("placement charges once, rejects occupied/unaffordable cells and refunds selling",()=>{
 const e=new GameEngine();e.startStage(0);let cell:{c:number;r:number}|undefined;
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(!cell&&isBuildable(c,r))cell={c,r};assert.ok(cell);
 const gold=e.gold;assert.equal(e.place("bolt",cell.c,cell.r),true);assert.equal(e.gold,gold-TOWERS.bolt.cost);assert.equal(e.place("bolt",cell.c,cell.r),false);
 const after=e.gold;e.sell();assert.equal(e.towers.length,0);assert.ok(e.gold>after);e.gold=0;assert.equal(e.place("bolt",cell.c,cell.r),false);
});
test("wave schedule is ordered, starts only once, and pause freezes game clock",()=>{
 const e=new GameEngine();e.startStage(0);e.callWave();const queued=e.spawnQueue.length;assert.ok(queued>0);e.callWave();assert.equal(e.wave,1);assert.equal(e.spawnQueue.length,queued);
 assert.ok(e.spawnQueue.every((v,i,a)=>i===0||v.at>=a[i-1].at));e.fixedUpdate(1/60);assert.ok(e.enemies.some(x=>x.alive));e.togglePause();const time=e.time;e.fixedUpdate(1);assert.equal(e.time,time);
});
test("all stages resolve wins after final enemy and losses with zero lives",()=>{
 memory(); for(let i=0;i<STAGES.length;i++){const e=new GameEngine();e.unlocked=STAGES.length-1;e.startStage(i);e.wave=e.totalWaves;e.spawnQueue=[];e.fixedUpdate(1/60);assert.equal(e.phase,"won");const lost=new GameEngine();lost.startStage(0);lost.lives=0;lost.fixedUpdate(1/60);assert.equal(lost.phase,"lost");}
});
