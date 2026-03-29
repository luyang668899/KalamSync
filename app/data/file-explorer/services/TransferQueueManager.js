import { log } from '../../../utils/log';

class TransferQueueManager {
  constructor() {
    this.queue = [];
    this.history = [];
    this.activeTask = null;
  }

  /**
   * Add a transfer task to the queue
   * @param {object} task - transfer task object
   * @returns {string} - task ID
   */
  addTask(task) {
    const taskId = `transfer-task-${Date.now()}`;
    const newTask = {
      id: taskId,
      status: 'queued', // queued, running, paused, completed, failed
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.queue.push(newTask);
    this._processQueue();

    return taskId;
  }

  /**
   * Process the queue
   * @private
   */
  _processQueue() {
    if (this.activeTask || this.queue.length === 0) {
      return;
    }

    const nextTask = this.queue.find(task => task.status === 'queued' || task.status === 'paused');
    if (nextTask) {
      this._startTask(nextTask);
    }
  }

  /**
   * Start a transfer task
   * @param {object} task - transfer task object
   * @private
   */
  _startTask(task) {
    this.activeTask = task;
    task.status = 'running';
    task.updatedAt = new Date().toISOString();

    const { deviceType, destination, fileList, direction, storageId } = task;

    // Call the original transferFiles method
    task.transferPromise = task.transferFiles({
      deviceType,
      destination,
      fileList,
      direction,
      storageId,
      onError: (error) => {
        task.status = 'failed';
        task.error = error;
        task.updatedAt = new Date().toISOString();
        this.activeTask = null;
        this._moveToHistory(task);
        this._processQueue();
        if (task.onError) {
          task.onError(error);
        }
      },
      onPreprocess: (data) => {
        if (task.onPreprocess) {
          task.onPreprocess(data);
        }
      },
      onProgress: (progress) => {
        task.progress = progress;
        if (task.onProgress) {
          task.onProgress(progress);
        }
      },
      onCompleted: () => {
        task.status = 'completed';
        task.updatedAt = new Date().toISOString();
        this.activeTask = null;
        this._moveToHistory(task);
        this._processQueue();
        if (task.onCompleted) {
          task.onCompleted();
        }
      },
    });
  }

  /**
   * Pause a transfer task
   * @param {string} taskId - task ID
   * @returns {boolean} - success status
   */
  pauseTask(taskId) {
    if (this.activeTask && this.activeTask.id === taskId) {
      // For now, we'll just mark it as paused
      // In a real implementation, we would need to pause the actual transfer
      this.activeTask.status = 'paused';
      this.activeTask.updatedAt = new Date().toISOString();
      this.activeTask = null;
      this._processQueue();
      return true;
    }

    const task = this.queue.find(t => t.id === taskId);
    if (task) {
      task.status = 'paused';
      task.updatedAt = new Date().toISOString();
      return true;
    }

    return false;
  }

  /**
   * Resume a transfer task
   * @param {string} taskId - task ID
   * @returns {boolean} - success status
   */
  resumeTask(taskId) {
    const task = this.queue.find(t => t.id === taskId);
    if (task && task.status === 'paused') {
      task.status = 'queued';
      task.updatedAt = new Date().toISOString();
      this._processQueue();
      return true;
    }

    return false;
  }

  /**
   * Cancel a transfer task
   * @param {string} taskId - task ID
   * @returns {boolean} - success status
   */
  cancelTask(taskId) {
    if (this.activeTask && this.activeTask.id === taskId) {
      // For now, we'll just mark it as failed
      // In a real implementation, we would need to cancel the actual transfer
      this.activeTask.status = 'cancelled';
      this.activeTask.updatedAt = new Date().toISOString();
      this.activeTask = null;
      this._moveToHistory(this.activeTask);
      this._processQueue();
      return true;
    }

    const taskIndex = this.queue.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const task = this.queue[taskIndex];
      task.status = 'cancelled';
      task.updatedAt = new Date().toISOString();
      this.queue.splice(taskIndex, 1);
      this._moveToHistory(task);
      return true;
    }

    return false;
  }

  /**
   * Get the transfer queue
   * @returns {array} - queue of transfer tasks
   */
  getQueue() {
    return this.queue;
  }

  /**
   * Get the transfer history
   * @returns {array} - history of completed/failed transfer tasks
   */
  getHistory() {
    return this.history;
  }

  /**
   * Move a task to history
   * @param {object} task - transfer task object
   * @private
   */
  _moveToHistory(task) {
    this.queue = this.queue.filter(t => t.id !== task.id);
    this.history.push(task);
    // Keep history to a reasonable size
    if (this.history.length > 50) {
      this.history.shift();
    }
  }
}

const transferQueueManager = new TransferQueueManager();

export default transferQueueManager;