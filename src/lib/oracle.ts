import fs from "fs";

export type OracleData = Record<string, unknown>;

export class OracleStore {
  private filePath: string;
  private cache: OracleData;
  private loadedAt: Date;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.cache = this.loadFromDisk();
    this.loadedAt = new Date();
  }

  private loadFromDisk(): OracleData {
    const content = fs.readFileSync(this.filePath, "utf-8");
    return JSON.parse(content) as OracleData;
  }

  public reload(): { ok: true; loadedAt: string } {
    this.cache = this.loadFromDisk();
    this.loadedAt = new Date();
    return { ok: true, loadedAt: this.loadedAt.toISOString() };
  }

  public all() {
    return {
      loadedAt: this.loadedAt.toISOString(),
      data: this.cache
    };
  }

  public getByPath(path: string[]): unknown {
    let node: any = this.cache;
    for (const key of path) {
      if (node && Object.prototype.hasOwnProperty.call(node, key)) {
        node = node[key];
      } else {
        return undefined;
      }
    }
    return node;
  }

  public find(q: string): { found: boolean } {
    const haystack = JSON.stringify(this.cache).toLowerCase();
    return { found: haystack.includes(q.toLowerCase()) };
  }
}
