/************* 
 * Test Test *
 *************/

import { PsychoJS } from './lib/core-2021.1.4.js';
import * as core from './lib/core-2021.1.4.js';
// import { TrialHandler } from './lib/data-2021.1.4.js';
import { Scheduler } from './lib/util-2021.1.4.js';
import * as visual from './lib/visual-2021.1.4.js';
// import * as sound from './lib/sound-2021.1.4.js';
import * as util from './lib/util-2021.1.4.js';

import { SchulteTable } from './js/schulte-table.js';

//some handy aliases as in the psychopy scripts;
const { abs, sin, cos, PI: pi, sqrt } = Math;
const { round } = util;

// init psychoJS:
const psychoJS = new PsychoJS({
  debug: true
});

// open window:
psychoJS.openWindow({
  fullscr: true,
  color: new util.Color([0, 0, 0]),
  units: 'pix',
  waitBlanking: true
});

// store info about the experiment session:
let expName = 'test';  // from the Builder filename that created this script
let expInfo = { 'participant': '' };

// Start code blocks for 'Before Experiment'
// schedule the experiment:

// psychoJS.schedule(psychoJS.gui.DlgFromDict({
//   dictionary: expInfo,
//   title: expName
// }));

const flowScheduler = new Scheduler(psychoJS);
const dialogCancelScheduler = new Scheduler(psychoJS);
// psychoJS.scheduleCondition(function() { return (psychoJS.gui.dialogComponent.button === 'OK'); }, flowScheduler, dialogCancelScheduler);

psychoJS.scheduleCondition(function () { return true; }, flowScheduler, dialogCancelScheduler);


// flowScheduler gets run if the participants presses OK
flowScheduler.add(updateInfo); // add timeStamp
flowScheduler.add(experimentInit);
flowScheduler.add(trialRoutineBegin());
flowScheduler.add(trialRoutineEachFrame());
flowScheduler.add(trialRoutineEnd());
flowScheduler.add(quitPsychoJS, '', true);

// quit if user presses Cancel in dialog box:
dialogCancelScheduler.add(quitPsychoJS, '', false);

psychoJS.start({
  expName: expName,
  expInfo: expInfo,
  resources: [
  ]
});

psychoJS.experimentLogger.setLevel(core.Logger.ServerLevel.EXP);


var frameDur;
function updateInfo() {
  expInfo.date = util.MonotonicClock.getDateStr();  // add a simple timestamp
  expInfo.expName = expName;
  expInfo.psychopyVersion = '2021.1.4';
  expInfo.OS = window.navigator.platform;

  // store frame rate of monitor if we can measure it successfully
  expInfo.frameRate = psychoJS.window.getActualFrameRate();
  if (typeof expInfo.frameRate !== 'undefined')
    frameDur = 1.0 / Math.round(expInfo.frameRate);
  else
    frameDur = 1.0 / 60.0; // couldn't get a reliable measure so guess

  // add info from the URL:
  util.addInfoFromUrl(expInfo);

  return Scheduler.Event.NEXT;
}


var trialClock;
var blackSchulteTable;
var globalClock;
var routineTimer;
var mouse;
function experimentInit() {
  // Initialize components for Routine "trial"
  trialClock = new util.Clock();

  blackSchulteTable = new SchulteTable({
    window: psychoJS.window,
    side: 100,
    squaresNumber: 25,
  });

  mouse = new core.Mouse({ win: psychoJS.window });

  // Create some handy timers
  globalClock = new util.Clock();  // to track the time since experiment started
  routineTimer = new util.CountdownTimer();  // to track time remaining of each (non-slip) routine

  return Scheduler.Event.NEXT;
}


var t;
var frameN;
var continueRoutine;
var trialComponents;
function trialRoutineBegin(snapshot) {
  return function () {
    //------Prepare to start Routine 'trial'-------
    t = 0;
    trialClock.reset(); // clock
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    // routineTimer.add(30.000000);
    // update component parameters for each repeat

    // keep track of which components have finished
    trialComponents = [];

    for (const thisComponent of trialComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  };
}


var frameRemains;
function trialRoutineEachFrame(snapshot) {
  return function () {
    //------Loop for each frame of Routine 'trial'-------
    // get current time
    t = trialClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame

    // *polygon* updates
    // if (t >= 0.0 && polygon.status === PsychoJS.Status.NOT_STARTED) {
    //   // keep track of start time/frame for later
    //   polygon.tStart = t;  // (not accounting for frame time here)
    //   polygon.frameNStart = frameN;  // exact frame index

    //   // polygon.setAutoDraw(true);
    // }

    // frameRemains = 0.0 + 12.0 - psychoJS.window.monitorFramePeriod * 0.75;  // most of one frame period left
    // if (polygon.status === PsychoJS.Status.STARTED && t >= frameRemains) {
    //   polygon.setAutoDraw(false);
    // }

    // polygon.draw();
    blackSchulteTable.getClick(mouse);
    blackSchulteTable.draw();
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({ keyList: ['escape'] }).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }

    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      return Scheduler.Event.NEXT;
    }

    // continueRoutine = false;  // reverts to True if at least one component still running
    // for (const thisComponent of trialComponents) {
    //   console.error(thisComponent.status);
    //   if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
    //     continueRoutine = true;
    //     break;
    //   }
    // }

    // refresh the screen if continuing
    // if (continueRoutine && routineTimer.getTime() > 0) {
    //   return Scheduler.Event.FLIP_REPEAT;
    // } else {
    //   return Scheduler.Event.NEXT;
    // }
    return Scheduler.Event.FLIP_REPEAT;
  };
  
}


function trialRoutineEnd(snapshot) {
  return function () {
    //------Ending Routine 'trial'-------
    for (const thisComponent of trialComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    return Scheduler.Event.NEXT;
  };
}


function endLoopIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      } else {
        const thisTrial = snapshot.getCurrentTrial();
        if (typeof thisTrial === 'undefined' || !('isTrials' in thisTrial) || thisTrial.isTrials) {
          psychoJS.experiment.nextEntry(snapshot);
        }
      }
      return Scheduler.Event.NEXT;
    }
  };
}


function importConditions(currentLoop) {
  return function () {
    psychoJS.importAttributes(currentLoop.getCurrentTrial());
    return Scheduler.Event.NEXT;
  };
}


function quitPsychoJS(message, isCompleted) {
  // Check for and save orphaned data
  if (psychoJS.experiment.isEntryEmpty()) {
    psychoJS.experiment.nextEntry();
  }


  psychoJS.window.close();
  // psychoJS.quit({message: message, isCompleted: isCompleted});

  return Scheduler.Event.QUIT;
}
