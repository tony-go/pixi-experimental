

import { Actor, ScriptBehavior, Components, Timer, getActor, Vector2 } from "../ECS";
import * as EntityBuilder from "../helpers/entitybuilder.js";

const kHandicapForDeplacement = 120;
const kHandicapForShooting = 280;

export default class CreatureBehavior extends ScriptBehavior {

    constructor() {
        super();

        const { x, y } = Vector2.randomCoordInRadius(200);
        this.position = { x, y };
        this.nextPos = { x: null, y: null };

        this.radius = 80;
        this.range = 180;

        this.isMoving = false;
        this.delayToMove = new Timer(kHandicapForDeplacement, { keepIterating: false });
        this.delayToShoot = new Timer(kHandicapForShooting, { autoStart: false, keepIterating: false });
    }

    awake() {
        this.sprite = this.actor.addComponent(
            new Components.AnimatedSpriteEx("adventurer", { defaultAnimation: "adventurer-idle" })
        );

        this.actor.position.set(this.position.x, this.position.y);
    }

    start() {
        this.target = getActor("player");
    }

    update() {
        if (this.canShoot()) {
            this.initShoot();

            return;
        }

        if (this.delayToMove.walk() || this.isMoving) {
            if (!this.isMoving) {
                const r = (this.radius / 2) * Math.sqrt(Math.random());
                const theta = Math.random() * 2 * Math.PI;
                const x = Math.round(this.position.x + r * Math.cos(theta));
                const y = Math.round(this.position.y + r * Math.sin(theta));

                this.nextPos.x = x;
                this.nextPos.y = y;
            }

            this.goTo();
        }

        this.sprite.playAnimation(this.actor.moving ? "adventurer-run" : "adventurer-idle");
    }

    canShoot() {
        const isInside = Math.pow(this.actor.x - this.target.x, 2) + Math.pow(this.actor.y - this.target.y, 2) <= this.range * this.range;
        if (isInside) {
            if (!this.delayToShoot.isStarted) {
                this.delayToShoot.start();

                return false
            }

            if (this.delayToShoot.walk()) {
                this.delayToShoot.reset();

                return true;
            }
        }

        return false;
    }

    initShoot() {
        game.rootScene.add(EntityBuilder.create("actor:projectile", {
            startPos: { x: this.actor.x, y: this.actor.y },
            targetPos: { x: this.target.x, y: this.target.y }
        }));
    }

    goTo() {
        if (this.nextPos.x === this.actor.x && this.nextPos.y === this.actor.y) {
            this.nextPos.x = null;
            this.nextPos.y = null;

            this.isMoving = false;
            this.delayToMove.start();
        }
        else {
            this.isMoving = true;
            if (this.actor.x !== this.nextPos.x) this.actor.x = this.actor.x < this.nextPos.x ? this.actor.x +1: this.actor.x -1;
            if (this.actor.y !== this.nextPos.y) this.actor.y = this.actor.y < this.nextPos.y ? this.actor.y +1: this.actor.y -1;
        }
    }
}

ScriptBehavior.define("CreatureBehavior", CreatureBehavior);

EntityBuilder.define("actor:creature", () => {
    return new Actor(EntityBuilder.increment("creature"))
        .createScriptedBehavior(new CreatureBehavior());
});
