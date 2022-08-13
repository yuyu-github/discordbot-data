type dataType = 'global' | 'guild' | 'user' | 'dm';
type operatorString = '+' | '-' | '*' | '/' | '%' | '**' | '&&' | '||' | '??';

export function getData(type: dataType, id: string | null, path: string[]): Object | null
export function setData(type: dataType, id: string | null, path: string[], value: any, calc: operatorString | ((old: Object | null, val: Object | null) => Object | null) | null): void
export function deleteData(type: dataType, id: string | null, path: string[]): void
