import { Nullable } from '../types';

export const randomChoice = <T>(array: Array<T>): Nullable<T> => {
  if (array.length == 0) {
    return null;
  }

  return array[Math.floor(array.length * Math.random())]!;
}
