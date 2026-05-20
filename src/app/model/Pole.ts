import { Vector } from "./Vector";
import { Position } from "./Position";
import { Calculator } from "../services/Calculator";
import { appSettings, PoleType } from "../config/AppSettings";
import { jsonIgnore } from "json-ignore";

export class Pole {

    constructor(id: number, type: string, strength: number, height: number, rotation: number, aboveGroundHeight: number, position: Position) {
        this.id = id;
        this.type = type;
        this.strength = strength;
        this.height = height;
        this.rotation = rotation;
        this.aboveGroundHeight = aboveGroundHeight;
        this.position = position;
    }

    public id: number;

    public type: string;

    /** Allowable load (kg) */
    public strength: number;

    /** Total height of the pole (m) */
    public height: number;

    public rotation: number;

    /** Height above ground level (m) */
    public aboveGroundHeight: number;

    /** 3-D position of the pole */
    public position: Position;

    public mechanicalConstraint: Vector = new Vector(0, 0);

    public windConstraint: Vector = new Vector(0, 0);

    public totalConstraint: Vector = new Vector(0, 0);

    @jsonIgnore()
    get poleType(): PoleType {
      return appSettings.getPoleType(this.type)!;
    }

    get load(): number {
        return this.totalConstraint.intensity / (this.strength * Calculator.getStrengthByPoleAngle(this.poleType.symmetric, this.rotation));
    }
    
    get critic(): boolean {
        return this.load >= 1.4;
    }

    /**
     * Euclidean distance to another pole.
     */
    public distanceTo(other: Pole): number {
        return this.position.distanceTo(other.position);
    }

    public angleTo(other: Pole): number {
        return this.position.angleTo(other.position);
    }

    public static fromJSON(json: any): Pole {
        const position = Position.fromJSON(json.position);
        const pole = new Pole(
            json.id,
            json.type,
            json.strength,
            json.height,
            json.rotation,
            json.aboveGroundHeight,
            position
        );
        pole.mechanicalConstraint = Vector.fromJSON(json.mechanicalConstraint);
        pole.windConstraint = Vector.fromJSON(json.windConstraint);
        pole.totalConstraint = Vector.fromJSON(json.totalConstraint);
        return pole;
    }
}
