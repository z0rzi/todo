const oneHour = 1000 * 60 * 60;

export function repeat(time: Date, frequenceHour: number, callback: () => unknown) {
    const now = Date.now();

    let timeEpoch = +time;

    while (timeEpoch <= now) {
        timeEpoch += frequenceHour * oneHour;
    }
    
    const timeDiff = timeEpoch - now;

    console.log(timeDiff);

    let intervalId: NodeJS.Timer;
    const timeId = setTimeout(() => {
        callback();
        intervalId = setInterval(() => {
            callback();
        }, frequenceHour * oneHour);
    }, timeDiff);

    return {
        stop: () => {
            clearTimeout(timeId);
            clearInterval(intervalId);
        }
    }
}
