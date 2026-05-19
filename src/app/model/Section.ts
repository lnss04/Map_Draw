import { jsonIgnore } from "json-ignore";
import { Pole } from "./Pole";
import { LineSection } from "./LineSection";


export class Section {

     @jsonIgnore()
     public startPole: Pole;

    @jsonIgnore()
    public endPole: Pole;

    /** Span length between the two poles (m), computed from pole positions */
     @jsonIgnore()
     public length: number;

     @jsonIgnore()
     public lineSections: LineSection[] = [];

     @jsonIgnore()
     public angle: number;

    constructor(startPole: Pole, endPole: Pole) {
        this.startPole = startPole;
        this.endPole = endPole;
        this.length = startPole.distanceTo(endPole);
        this.angle = startPole.angleTo(endPole);
    }

    public recompute(): void {
        const a = this.startPole.position;
        const b = this.endPole.position;
        const R = 6371000; // Earth radius in metres
        const lat1 = a.y * Math.PI / 180;
        const lat2 = b.y * Math.PI / 180;
        const dLat = (b.y - a.y) * Math.PI / 180;
        const dLon = (b.x - a.x) * Math.PI / 180;
        const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
        const horizontal = 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
        const dz = b.z - a.z;
        this.length = Math.sqrt(horizontal * horizontal + dz * dz);
        this.angle = Math.atan2(b.y - a.y, b.x - a.x);
    }

    public static fromJSON(json: any, startPole: Pole, endPole: Pole): Section {
        return new Section(startPole, endPole);
    }

    // public calcLineSectionMecanicalsConstraints(): void {
    //     this.lineSections.forEach ( ls => {
    //         ls.calcLineSectionMecanicalsConstraints();
    //     });
    // }
}
