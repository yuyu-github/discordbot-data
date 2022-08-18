type dataType = 'global' | 'guild' | 'user' | 'dm';
type operatorString = '+' | '-' | '*' | '/' | '%' | '**' | '&&' | '||' | '??';

export function getData(type: dataType, id: string | null, path: string[], useCache?: boolean): Object | null
export function setData(type: dataType, id: string | null, path: string[], value: any, calc?: operatorString | ((old: Object | null, val: Object | null) => Object | null) | null, useCache?: boolean): void
export function deleteData(type: dataType, id: string | null, path: string[], useCache?: boolean): void
