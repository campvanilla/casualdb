import { SortKeys } from './types.ts';

export const compareByType = (a: any, b: any) => {
  if (typeof a !== typeof b) {
    throw new Error('[CasualDB] Cannot compare dissimilar types when sorting.');
  }

  if (typeof a === 'number' ) {
    return a - b;
  }

  if (typeof a === 'string') {
    if (a === b) {
      return 0;
    } else if (a < b) {
      return -1;
    }
    return 1;
  }

  throw new Error(`Cannot compare types '${typeof a}' and '${typeof b}'`);
}

export const compareFunction = <M>(keys: SortKeys<M>) => {
  return (a:M, b: M) => {
    for (let key of keys) {
      const compareResult = compareByType(a[key], b[key]);
      if (compareResult !== 0) {
        return compareResult;
      }
    }
    return 0;
  }
};
