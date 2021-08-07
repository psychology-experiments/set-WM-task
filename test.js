/************* 
 * Test Test *
 *************/

import { PsychoJS } from './lib/core-2021.1.4.js';
import * as core from './lib/core-2021.1.4.js';
// import * as data from './lib/data-2021.1.4.js';
import { Scheduler } from './lib/util-2021.1.4.js';
import * as visual from './lib/visual-2021.1.4.js';
// import * as sound from './lib/sound-2021.1.4.js';
import * as util from './lib/util-2021.1.4.js';

import * as general from './js/general.js';
import { SchulteTable } from './js/schulte-table.js';
import { StroopTest } from './js/stroop.js';
import { Anagrams } from './js/anagrams.js';
import { Luchins } from './js/luchins.js';
import { DemboRubinstein } from './js/dembo-rubinstein.js';
import { DigitSpan } from './js/digit-span.js';

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

// flowScheduler gets run if the participants presses OK
flowScheduler.add(updateInfo); // add timeStamp
flowScheduler.add(experimentInit);

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


var onlyBlackSchulteTable;
var blackAndRedSchulteTable;
var stroop;
var anagrams;
var luchins;
var demboRubinstein;
var digitSpan;
var instructionPresenter;
var globalClock;
var routineClock;
var mouse;
var keyboard;
var wordInputProcessor;
var sliderInput;
var additionalDataHandler;
var dataSaver;
var experimentSequence;
// var testORA;
function experimentInit() {
  // Initialize components for WM tasks

  onlyBlackSchulteTable = new SchulteTable({
    window: psychoJS.window,
    side: 100,
    squaresNumber: 25,
  });

  blackAndRedSchulteTable = new SchulteTable({
    window: psychoJS.window,
    side: 100,
    squaresNumber: 49,
  });

  stroop = new StroopTest({
    window: psychoJS.window,
    startTime: 0.1,
  });

  anagrams = new Anagrams({
    window: psychoJS.window,
    startTime: 0.1,
  });

  luchins = new Luchins({
    window: psychoJS.window,
  });

  demboRubinstein = new DemboRubinstein({
    window: psychoJS.window,
  });

  digitSpan = new DigitSpan({
    window: psychoJS.window,
  });

  instructionPresenter = new visual.TextStim({
    win: psychoJS.window,
    height: 50,
    wrapWidth: psychoJS.window.size[0] * 0.8,
    color: new util.Color("black"),
  });
  instructionPresenter.status = PsychoJS.Status.NOT_STARTED;

  // Create some handy timers
  globalClock = new util.Clock();  // to track the time since experiment started
  routineClock = new util.Clock();

  additionalDataHandler = new general.AdditionalTrialData(
    {
      routineTime: () => routineClock.getTime(),
      timeFromExperimentStart: () => globalClock.getTime(),
    }

  );

  mouse = new core.Mouse({ win: psychoJS.window });

  keyboard = new general.SingleSymbolKeyboard({
    psychoJS: psychoJS,
    additionalTrialData: additionalDataHandler,
  });

  wordInputProcessor = new general.WordInputProcessor({
    psychoJS: psychoJS,
    additionalTrialData: additionalDataHandler,
  });

  sliderInput = new general.SliderInput({
    psychoJS: psychoJS,
    additionalTrialData: additionalDataHandler,
  });

  dataSaver = new general.DataSaver({
    psychoJS: psychoJS,
  });

  const experimentParts = {
    "developer message": { routine: developerMessage, isForExperiment: false, nLoops: 0 },
    "stroop": { task: stroop, userInputProcessor: keyboard, isForExperiment: true, nLoops: [60, 60] },
    "luchins": { task: luchins, userInputProcessor: null, isForExperiment: true, nLoops: [0] },
    "dembo-rubinstein": { task: demboRubinstein, userInputProcessor: sliderInput, isForExperiment: true, nLoops: [30, 10, 10, 10] },
    "digit span": { task: digitSpan, userInputProcessor: null, "isForExperiment": true, nLoops: [0] },
    "black schulte": { task: onlyBlackSchulteTable, userInputProcessor: null, "isForExperiment": true, nLoops: [0] },
    "black and red schulte": { task: blackAndRedSchulteTable, userInputProcessor: null, "isForExperiment": true, nLoops: [0] },
    "anagrams": { task: anagrams, userInputProcessor: wordInputProcessor, "isForExperiment": true, nLoops: [10] },
  };

  experimentSequence = new general.ExperimentOrganizer({
    psychoJS: psychoJS,
    experimentScheduler: flowScheduler,
    parts: experimentParts,
    routines: {
      routines: [taskRoutineBegin, taskRoutineEachFrame, taskRoutineEnd],
      loop: endLoopIteration,
      instruction: instructionRoutine,
    },
    tasksAtTheBeginning: ["developer message", "black schulte", "black and red schulte"],
    isInDevelopment: true,
    showOnly: "dembo-rubinstein",
    showInstructions: true,
  });

  experimentSequence.generateExperimentSequence();
  flowScheduler.add(quitPsychoJS, '', true);

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


function instructionRoutine(instructionText) {
  return function () {

    if (instructionPresenter.status === PsychoJS.Status.NOT_STARTED) {
      instructionPresenter.text = instructionText;
      instructionPresenter.status = PsychoJS.Status.STARTED;
      psychoJS.eventManager.clearEvents();
      instructionPresenter.draw();
    }

    if (instructionPresenter.status === PsychoJS.Status.STARTED && psychoJS.eventManager.getKeys({ keyList: ['right'] }).length > 0) {
      instructionPresenter.setAutoDraw(false);
      instructionPresenter.status = PsychoJS.Status.NOT_STARTED;
      return Scheduler.Event.NEXT;
    }

    return Scheduler.Event.FLIP_REPEAT;
  };
}


function taskRoutineBegin(snapshot, task, userInputProcessor) {
  return function () {
    console.count("begin");
    task.nextStimulus();
    routineClock.reset();
    return util.Scheduler.Event.NEXT;
  };
}


function taskRoutineEachFrame(snapshot, task, userInputProcessor) {
  let t;
  return function () {
    t = routineClock.getTime();

    if (!task.isStarted && task.startTime <= t) {
      task.start();
    }

    if (!userInputProcessor.isInitilized && task.isStarted) {
      userInputProcessor.initilize(task.getTaskConditions());
    }

    if (userInputProcessor.isInitilized && userInputProcessor.isSendInput()) {
      task.checkInput(userInputProcessor);
    }

    if (task.isTrialFinished()) {
      console.log("trial finished");
      task.addUnfinishedTrialData(userInputProcessor);
      return Scheduler.Event.NEXT;
    }

    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({ keyList: ['escape'] }).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }

    // Developer's option to look on different tasks
    if (experimentSequence.isInDevelopment && psychoJS.eventManager.getKeys({ keyList: ['q'] }).length > 0) {
      snapshot.finished = true;
      return Scheduler.Event.NEXT;
    }


    return Scheduler.Event.FLIP_REPEAT;
  };
}


function taskRoutineEnd(snapshot, task, userInputProcessor) {
  return function () {
    dataSaver.saveData({ taskData: task.getTrialData() });

    task.stop();
    userInputProcessor.stop();

    if (task.isTaskFinished()) {
      console.log("task finished");
      snapshot.finished = true;
    }

    return util.Scheduler.Event.NEXT;
  };
}


function endLoopIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        // if (psychoJS.experiment.isEntryEmpty()) {
        //   psychoJS.experiment.nextEntry(snapshot);
        // }
        scheduler.stop();
      } else {
        const thisTrial = snapshot.getCurrentTrial();
        if (typeof thisTrial === 'undefined' || !('isTrials' in thisTrial) || thisTrial.isTrials) {
          // psychoJS.experiment.nextEntry(snapshot);
        }
      }
      return Scheduler.Event.NEXT;
    }
  };
}


function quitPsychoJS(message, isCompleted) {
  // Check for and save orphaned data
  if (psychoJS.experiment.isEntryEmpty()) {
    psychoJS.experiment.nextEntry();
  }


  psychoJS.window.close();
  psychoJS.quit({ message: message, isCompleted: isCompleted });

  return Scheduler.Event.QUIT;
}


function onlyBlackSchulteTableRoutine(snapshot) {
  return function () {
    onlyBlackSchulteTable.getClick(mouse);
    onlyBlackSchulteTable.draw();

    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({ keyList: ['escape'] }).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }

    // Developer's option to look on different tasks
    if (experimentSequence.isDeveloped && psychoJS.eventManager.getKeys({ keyList: ['q'] }).length > 0) {
      onlyBlackSchulteTable.setAutoDraw(false);
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


function blackAndRedSchulteTableRoutine(snapshot) {
  return function () {
    blackAndRedSchulteTable.getClick(mouse);
    blackAndRedSchulteTable.draw();

    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({ keyList: ['escape'] }).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }

    // Developer's option to look on different tasks
    if (experimentSequence.isDeveloped && psychoJS.eventManager.getKeys({ keyList: ['q'] }).length > 0) {
      blackAndRedSchulteTable.setAutoDraw(false);
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