class Segment {
    constructor(position, length, width) {
        this.position = position;
        this.length = length;
        this.width = width;
    }
}

function subtraction(vectorOne, vectorTwo) {
    return [
        vectorOne[0] - vectorTwo[0],
        vectorOne[1] - vectorTwo[1]
    ];
}

function addition(vectorOne, vectorTwo) {
    return [
        vectorOne[0] + vectorTwo[0],
        vectorOne[1] + vectorTwo[1]
    ];
}

function magnitudeOfVector(x, y) {
    return Math.sqrt(x * x + y * y);
}

function setMagnitude(magnitude, vector) {
    const d = magnitudeOfVector(vector[0], vector[1]);
    const proportion = magnitude / d;

    return [
        vector[0] * proportion,
        vector[1] * proportion
    ];
}

class Arm {
    constructor(number_of_segments, position = [0,0], color = [255, 255, 255]) {
        this.segments = [];
        this.position = [...position];
        this.color = color;

        if (number_of_segments < 1) {
            return;
        }

        for (let i = 0; i < number_of_segments; i++) {
            let segment_length = 25;
            this.segments.push(new Segment([...position], segment_length, 5));
            position[1] -= segment_length; // move next segment up by 10
        }

        this.segments[this.segments.length - 1].length = 0;
    }

    draw() {
        let current_segment = null;
        let next_segment = null;
        let i = 0;

        stroke(this.color[0], this.color[1], this.color[2]);

        while (i < this.segments.length - 1) {
            current_segment = this.segments[i];
            next_segment = this.segments[i + 1];
            strokeWeight(current_segment.width);
            line(current_segment.position[0], current_segment.position[1], next_segment.position[0], next_segment.position[1]);

            i++;
        }
    }

    fabrik_forward(target) {
        let end_effector = this.segments[this.segments.length - 1];
        end_effector.position = target;

        for (let i = 1; i < this.segments.length; i++) {
            let parent_segment = this.segments[this.segments.length - 1 - i];
            let direction = subtraction(end_effector.position, parent_segment.position);
            direction = setMagnitude(parent_segment.length, direction);
            parent_segment.position = subtraction(end_effector.position, direction);
            end_effector = parent_segment;
        }
    }

    fabrik_backward(base) {
        let parent_segment = this.segments[0];
        parent_segment.position = base;

        for (let i = 1; i < this.segments.length; i++) {
            let child_segment = this.segments[i];
            let direction = subtraction(child_segment.position, parent_segment.position);
            direction = setMagnitude(parent_segment.length, direction);
            child_segment.position = addition(parent_segment.position, direction);
            parent_segment = child_segment;
        }
    }
}

/**
 * 
 * @param {*} min inclusive min
 * @param {*} max 
 * @param {*} inclusive exclusive max
 * @returns 
 */
function randomValue(min = 0, max = 0) {
    if (max === min) {
        return max;
    }

    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    return Math.random() * (max - min) + min;
}

function limitMaxMagnitude(limit, vector) {
    const d = magnitudeOfVector(vector[0], vector[1]);

    if (limit < d) {
        const proportion = limit / d;

        return [
            vector[0] * proportion,
            vector[1] * proportion
        ];
    }

    return vector;
}

class Fish extends Arm {
    constructor(number_of_segments, position = [0,0], color = [255, 255, 255]) {
        super(number_of_segments, position, color);

        this.minVelocity = 10;
        this.maxVelocity = 20;
        this.velocity = [randomValue(-this.maxVelocity, this.maxVelocity), randomValue(-this.maxVelocity, this.maxVelocity)];
        this.velocity = setMagnitude(randomValue(this.minVelocity, this.maxVelocity), this.velocity);
    }

    boundary(x, y) {
        const margin = 256;

        if (this.position[0] > x) {
            this.position[0] = x;
        }
        else if (this.position[0] < 0) {
            this.position[0] = 0;
        }

        if (x - margin > margin) {
            const nextPosition = this.position[0] + this.velocity[0];

            if (nextPosition > x - margin) {
                this.velocity[0] -= (nextPosition - (x - margin)) / margin; // turning factor scales up the closer to the edge it gets
            }
            else if (nextPosition < margin) {
                this.velocity[0] += ((margin) - nextPosition) / margin;
            }
            else { // dont dampen the velocity
                if (magnitudeOfVector(this.velocity[0], this.velocity[1]) < this.minVelocity) {
                    this.velocity = setMagnitude(this.maxVelocity, this.velocity);
                }
            }
        }

        if (this.position[1] > y) {
            this.position[1] = y;
        }
        else if (this.position[1] < 0) {
            this.position[1] = 0;
        }

        if (y - margin > margin) {
            const nextPosition = this.position[1] + this.velocity[1];

            if (nextPosition > y - margin) {
                this.velocity[1] -= (nextPosition - (y - margin)) / margin;
            }
            else if (nextPosition < margin) {
                this.velocity[1] += ((margin) - nextPosition) / margin;
            }
            else { // dont dampen the velocity
                if (magnitudeOfVector(this.velocity[0], this.velocity[1]) < this.minVelocity) {
                    this.velocity = setMagnitude(this.maxVelocity, this.velocity);
                }
            }
        }

        this.velocity = limitMaxMagnitude(this.maxVelocity, this.velocity);
    }

    update(x, y) {
        this.boundary(x, y);
        this.position = addition(this.position, this.velocity);
        this.fabrik_forward(this.position);
    }
}
