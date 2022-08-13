import * as fs from 'fs';

type dataType = 'global' | 'guild' | 'user' | 'dm';
type operatorString = '+' | '-' | '*' | '/' | '%' | '**' | '&&' | '||' | '??';

const isDataType = string => ['global', 'guild', 'user', 'dm'].includes(string);

export function getData(type: dataType, id: string | null, path: string[]): Object | null {
  if (!isDataType(type)) throw TypeError(`'${type}' is not a data type.`)
  if ((type != 'global' && id == null)) return null;

  let dirname= './data' + (type != 'global' ? `/${type}` : '');
  let fileName = dirname + '/' + (type != 'global' ? id : 'global') + '.json';

  let data: object = fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName).toString()) : {}
  let parent = data;
  let value: Object | null = null;
  path.forEach((key, i) => {
    if (i == path.length - 1) {
      value = parent[key];
      return;
    }
    else {
      if (parent[key] == null) {
        value = null;
        return;
      }
      parent = parent[key];
    }
  });
  return value;
}

export function setData(type: dataType, id: string | null, path: string[], value: any, calc: operatorString | ((old: Object | null, val: Object | null) => Object | null) | null = null): void {
  if (!isDataType(type)) throw TypeError(`'${type}' is not a data type.`)
  if ((type != 'global' && id == null)) return;

  let dirname = './data' + (type != 'global' ? `/${type}` : '');
  let fileName = dirname + '/' + (type != 'global' ? id : 'global') + '.json';

  let data: object = fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName).toString()) : {}
  let parent = data;
  path.forEach((key, i) => {
    if (i == path.length - 1) {
      let newValue: any = parent[key] ?? null;

      if (typeof calc == 'function') {
        newValue = calc(newValue, value);
      } else if (calc != null) {
        switch (calc) {
          case '+': newValue += value; break;
          case '||': newValue ||= value; break;
          case '&&': newValue &&= value; break;
          case '??': newValue ??= value; break;
        }
        if (typeof newValue == 'number') {
          switch (calc) {
            case '-': newValue -= value; break;
            case '*': newValue *= value; break;
            case '/': newValue /= value; break;
            case '%': newValue %= value; break;
            case '**': newValue **= value; break;
          }
        }

        if (typeof newValue == 'number' && Number.isNaN(newValue)) newValue = 0;
      } else {
        newValue = value;
      }

      parent[key] = newValue;
    }
    else {
      if (parent[key] == null) parent[key] = {};
      parent = parent[key];
    }
  });

  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);
  fs.writeFileSync(fileName, JSON.stringify(data));
}

export function deleteData(type: dataType, id: string | null, path: string[]): void {
  if (!isDataType(type)) throw TypeError(`'${type}' is not a data type.`)
  if ((type != 'global' && id == null)) return;

  let dirname = './data' + (type != 'global' ? `/${type}` : '');
  let fileName = dirname + '/' + (type != 'global' ? id : 'global') + '.json';

  let data: object = fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName).toString()) : {}
  let parent = data;
  path.forEach((key, i) => {
    if (i == path.length - 1) delete parent[key];
    else {
      if (parent[key] == null) return;
      parent = parent[key];
    }
  });

  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);
  fs.writeFileSync(fileName, JSON.stringify(data));
}
