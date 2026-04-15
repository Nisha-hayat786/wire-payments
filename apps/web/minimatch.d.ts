declare module 'minimatch' {
  export interface MinimatchOptions {
    nocase?: boolean
    dot?: boolean
    matchBase?: boolean
    nocomment?: boolean
    nonegate?: boolean
    flipNegate?: boolean
  }

  export class Minimatch {
    constructor(pattern: string, options?: MinimatchOptions)
    match(str: string): boolean
    static makeRe(pattern: string, options?: MinimatchOptions): RegExp | false
  }

  export function minimatch(
    str: string,
    pattern: string,
    options?: MinimatchOptions | boolean
  ): boolean

  export function filter(
    pattern: string,
    options?: MinimatchOptions
  ): (str: string) => boolean

  export function braceExpand(
    pattern: string,
    options?: MinimatchOptions
  ): string[]

  export function makeRe(
    pattern: string,
    options?: MinimatchOptions
  ): RegExp | false
}
