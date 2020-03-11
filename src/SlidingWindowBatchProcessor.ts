export class SlidingWindowBatchProcessor<T> {
    
    private time: number;
    private timer: any;
    private callback: (tasks: Array<T>, optionalArgs: any) => void;
    private waitTimeinMs: number;
    private tasks: Array<T> = new Array<T>();
    private optionalArgs: any;
    private lock: boolean = false;
    constructor(
        callback: (tasks: Array<T>, optionalArgs: any) => void,
        optionalArgs: any,
        waitTimeinMs: number = 50
    ) {
        this.callback = callback;
        this.optionalArgs = optionalArgs;
        this.waitTimeinMs = waitTimeinMs
    }

    public push(task: T) {
        if(this.lock) {
            console.error('lock set to true');
            blockAndExecuteOnConditonMet(() => this.lock === false, () => {
                this.tasks.push(task);
                this.slideTimer();
            }) 
        } else {
            this.tasks.push(task);
            this.slideTimer();
        }
    }

    public slideTimer() {
        this.stop();
        this.time = this.time ?  this.time + this.waitTimeinMs : Date.now();
        const delta = this.time - Date.now();
        if(delta > 0) {
            console.error('Slide timer');
            this.timer = setTimeout(() => {
                console.error('Timer expired processing messages');
                this.timer = null;
                this.lock = true;
                this.callback(this.tasks, this.optionalArgs);
                this.tasks = new Array<T>();
                this.lock = false;
            }, this.waitTimeinMs)
        } 
    }

    private stop() {
        if(this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}

export const blockAndExecuteOnConditonMet = (condition: () => boolean, callback: () => void) => {
    setTimeout(() => {
        if (!condition()) {
            blockAndExecuteOnConditonMet(condition, callback);
        } else {
            callback();
        }
    }, 10)
}