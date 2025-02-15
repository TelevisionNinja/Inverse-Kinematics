let arm = null;
let fish = null;
let width = 0;
let height = 0;

function setup() {
    width = windowWidth - 16;
    height = windowHeight - 16;
    createCanvas(width, height);

    arm = new Arm(20, [width / 2, height * 3 / 4], [128, 128, 255]);
    fish = new Fish(20, [width / 2, height * 3 / 4], [128, 255, 255]);
}

function windowResized() {
    width = windowWidth - 16;
    height = windowHeight - 16;
    resizeCanvas(width, height);
}

function draw() {
    background(32, 32, 32);

    arm.fabrik_forward([mouseX, mouseY]);
    arm.fabrik_backward([width / 2, height]);
    arm.draw();

    fish.update(width, height);
    fish.draw();
}
