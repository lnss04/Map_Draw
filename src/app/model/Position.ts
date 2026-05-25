/**
 * 3-D position in Lambert 72 (EPSG:31370) metres.
 * Code that interacts with OpenLayers must convert via the helpers in
 * services/projection.ts — Position never holds EPSG:3857 or EPSG:4326 values.
 */
export class Position {
    /** Lambert 72 easting (m) */
    public x: number;

    /** Lambert 72 northing (m) */
    public y: number;

    /** Elevation (m) */
    public z: number;

    constructor(x: number, y: number, z: number = 0) {
        this.x = Math.round(x * 100) / 100;
        this.y = Math.round(y * 100) / 100;
        this.z = Math.round(z * 100) / 100;
    }

    /**
     * Euclidean distance to another position.
     * d = √((x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²)
     */
    public distanceTo(other: Position): number {
        return Math.sqrt(
            (other.x - this.x) ** 2 +
            (other.y - this.y) ** 2 +
            (other.z - this.z) ** 2,
        );
    }
    public angleTo(other: Position): number {
        return Math.atan2(other.y - this.y, other.x - this.x);
    }

    public static fromJSON(json: any): Position {
        return new Position(json.x, json.y, json.z ?? 0);
    }
}
