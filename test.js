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

import { ExperimentOrgaizer } from './js/general.js';
import { SchulteTable } from './js/schulte-table.js';
import { StroopTest } from './js/stroop.js';
import { Anagrams } from './js/anagrams.js';

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
  color: new util.Color("white"),
  units: 'pix',
  waitBlanking: true
});

// store info about the experiment session:
let expName = 'WM-tasks';  // from the Builder filename that created this script
let expInfo = { 'participant': '' };

// Start code blocks for 'Before Experiment'
// schedule the experiment:

// psychoJS.schedule(psychoJS.gui.DlgFromDict({
//   dictionary: expInfo,
//   title: expName
// }));

const flowScheduler = new Scheduler(psychoJS);
const dialogCancelScheduler = new Scheduler(psychoJS);
// psychoJS.scheduleCondition(function () { return (psychoJS.gui.dialogComponent.button === 'OK'); }, flowScheduler, dialogCancelScheduler);

psychoJS.scheduleCondition(function () { return true; }, flowScheduler, dialogCancelScheduler);


let experimentParts = {
  "developer message": { "routine": developerMessage, "instruction": null, "isForExperiment": false },
  "stroop": { "routine": stroopRoutine, "instruction": null, "isForExperiment": true },
  "luchins": { "routine": DummyRoutine, "instruction": null, "isForExperiment": true },
  "dembo-rubinstein": { "routine": DummyRoutine, "instruction": null, "isForExperiment": true },
  "digit span": { "routine": DummyRoutine, "instruction": null, "isForExperiment": true },
  "black schulte": { "routine": blackSchulteTableRoutine, "instruction": null, "isForExperiment": true },
  "black and red schulte": { "routine": DummyRoutine, "instruction": null, "isForExperiment": true },
  "anagrams": { "routine": anagramsRoutine, "instruction": null, "isForExperiment": true },
};

const experimentSequence = new ExperimentOrgaizer({
  scheduler: flowScheduler,
  parts: experimentParts,
  isDeveloped: true,
  showOnly: null,
});

// flowScheduler gets run if the participants presses OK
flowScheduler.add(updateInfo); // add timeStamp
flowScheduler.add(experimentInit);
experimentSequence.generateExperimentSequence();
flowScheduler.add(quitPsychoJS, '', true);

// quit if user presses Cancel in dialog box:
dialogCancelScheduler.add(quitPsychoJS, '', false);

psychoJS.start({
  expName: expName,
  expInfo: expInfo,
  resources: [
    // { 'name': 'materials/Stroop/BB.png', 'path': 'materials/Stroop/BB.png' }
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

  // if frameRate is undefined then guess
  frameDur = typeof expInfo.frameRate !== 'undefined' ? 1.0 / Math.round(expInfo.frameRate) : 1.0 / 60.0;
  // add info from the URL:
  util.addInfoFromUrl(expInfo);

  return Scheduler.Event.NEXT;
}


var trialClock;
var blackSchulteTable;
var stroop;
var anagrams;
var globalClock;
var routineTimer;
var mouse;
// var testORA;
function experimentInit() {
  // Initialize components for Routine "trial"
  trialClock = new util.Clock();

  blackSchulteTable = new SchulteTable({
    window: psychoJS.window,
    side: 100,
    squaresNumber: 25,
  });

  stroop = new StroopTest({
    window: psychoJS.window,
    stimuliFP: "materials/Stroop/BB.png"
  });

  anagrams = new Anagrams({
    winnow: psychoJS.window,
  });

  // testORA =

  mouse = new core.Mouse({ win: psychoJS.window });

  // Create some handy timers
  globalClock = new util.Clock();  // to track the time since experiment started
  routineTimer = new util.CountdownTimer();  // to track time remaining of each (non-slip) routine

  return Scheduler.Event.NEXT;
}

function developerMessage(snapshot) {
  let developerInstruction = new visual.TextStim({
    win: psychoJS.window,
    color: new util.Color("black"),
    height: 100,
    text: 'Код находится в процессе разработки.\nДля переключения между задачами используйте клавишу "q"',
    wrapWidth: psychoJS.window.size[0] * 0.8,
  });
  return function () {
    developerInstruction.draw();
    // Developer's option to look on different tasks
    if (psychoJS.eventManager.getKeys({ keyList: ['q'] }).length > 0) {
      developerInstruction.setAutoDraw(false);
      return Scheduler.Event.NEXT;
    }

    return Scheduler.Event.FLIP_REPEAT;
  };
}


function blackSchulteTableRoutine(snapshot) {
  return function () {
    blackSchulteTable.getClick(mouse);
    blackSchulteTable.draw();

    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({ keyList: ['escape'] }).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }

    // Developer's option to look on different tasks
    if (experimentSequence.isDeveloped && psychoJS.eventManager.getKeys({ keyList: ['q'] }).length > 0) {
      blackSchulteTable.setAutoDraw(false);
      return Scheduler.Event.NEXT;
    }

    // check if the Routine should terminate
    // if (!continueRoutine) {  // a component has requested a forced-end of Routine
    //   return Scheduler.Event.NEXT;
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



function stroopRoutine(snapshot) {
  let stropAutoChangerId = setInterval(() => stroop.nextStimulus(), 1000);
  return function () {
    stroop.draw();

    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({ keyList: ['escape'] }).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }

    // Developer's option to look on different tasks
    if (experimentSequence.isDeveloped && psychoJS.eventManager.getKeys({ keyList: ['q'] }).length > 0) {
      clearInterval(stropAutoChangerId);
      return Scheduler.Event.NEXT;
    }


    return Scheduler.Event.FLIP_REPEAT;
  };

}


function anagramsRoutine(snapshot) {
  setInterval(() => stroop.nextStimulus(), 1000);
  return function () {
    anagrams.draw();

    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({ keyList: ['escape'] }).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }

    // Developer's option to look on different tasks
    if (experimentSequence.isDeveloped && psychoJS.eventManager.getKeys({ keyList: ['q'] }).length > 0) {
      return Scheduler.Event.NEXT;
    }


    return Scheduler.Event.FLIP_REPEAT;
  };

}




function DummyRoutine(snapshot) {
  return function () {
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
