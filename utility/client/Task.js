// @ts-check
import { NumberArray } from "../misc";

/**
 * @callback TaskFunction         - The task function
 * @param {any} env                    - Environment of this concurrency unit, i.e. "thread local storage"
 * @param {...*} params                - The parameters of this function
 * @returns {Promise<any>}
 */

/**
 * @typedef {Object} Task         - A generic task wrapper
 * @property {Array} params            - An array of arguments
 * @property {TaskFunction} func       - The task function which will be called with func(...params). Must return a Promise which fulfills.
 */

/**
 * A closure that saves currentTaskIndex inside task.func().then()
 * @param {Task} task
 * @param {Number} index
 * @param {any}    env
 */
async function doTaskWithTaskIndex(task, index, env) {
	return task.func(env, ...task.params)
		.then((result) => {
			return {
				index,
				result,
			}
		});
}

/**
 * @param {Task[]}   tasks
 * @param {Object}   options
 * @param {Number=}          options.maxConcurrency    (Optional) Max number of tasks to do concurrently
 * @param {Boolean=}         options.ignoreResult      (Optional) If false, results will be returned from doTasks()
 * @param {Boolean=}         options.ignoreFailure     (Optional) If false, an failed promise will cause doTasks() to throw an exception
 * @param {Array<any>=}      options.concurrencyEnvs   (Optional) Environment for each concurrency unit, i.e. "thread local storage"
 * @param {AbortController=} options.controller        (Optional) Abort controller
 * @returns {Promise<undefined | Array<any>>}
 */
async function doTasks(tasks, options) {
  const {
    maxConcurrency = 1,        
    ignoreResult = true,
    ignoreFailure = true,
    concurrencyEnvs = NumberArray(0, maxConcurrency),
    controller,
  } = options;
  let results;
  if (!ignoreResult) {
    results = NumberArray(0, tasks.length);
  }
  const usedConcurrency = Math.min(tasks.length, maxConcurrency);
  const promises = NumberArray(0, usedConcurrency).map((_, index) => Promise.resolve(index));
  let taskIndex = 0;

  while (taskIndex < tasks.length) {
    if (controller && controller.signal.aborted) {
      break;
    }
    const concurrencyIndex = await Promise.race(promises);
    const task = tasks[taskIndex];
		// Since taskIndex will be different later, we save it in doTaskWithTaskIndex() and retrieve this later
    const nextPromise = doTaskWithTaskIndex(task, taskIndex, concurrencyEnvs[concurrencyIndex])
      .then(({ index: savedTaskIndex, result }) => {
        if (!ignoreResult) {
  				// savedTaskIndex is the currentTaskIndex when this task is executed
          results[savedTaskIndex] = result;
        }
				// Returns the index of promise array. This is a hack since Promise.race() don't return array index
        return concurrencyIndex;
      });
    if (ignoreFailure) {
      // Add an dummy error handler to suppress rejected promise
      nextPromise.catch(() => concurrencyIndex);
    }
    promises[concurrencyIndex] = nextPromise;
    taskIndex += 1;
  }

  if (!(controller && controller.signal.aborted)) {
    await Promise.all(promises); // Wait for all tasks to complete
  }
  return results;
}

export default doTasks;
