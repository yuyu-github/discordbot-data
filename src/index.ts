import * as fs from 'fs';

type dataType = 'global' | 'guild' | 'user' | 'dm';
type operatorString = '+' | '-' | '*' | '/' | '%' | '**' | '&&' | '||' | '??';

class Version {
  major: number;
  minor: number;
  patch: number;

  constructor(name: string) {
    let nums = name.split('.');
    this.major = Number(nums[0]);
    this.minor = Number(nums[1]);
    this.patch = Number(nums[2]);
  }

  toString() {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
}

const verFilePath = './data/version.txt';
const newVer = new Version('1.0.0');
const currentVer = fs.existsSync(verFilePath) ? new Version(fs.readFileSync(verFilePath).toString()) : newVer;

fs.writeFileSync(verFilePath, newVer.toString())

let cache = {};
const getCache = (type: dataType, id: string | null): object | null => (type == 'global' ? cache[type] : cache[type]?.[id ?? '']) ?? null;
const setCache = (type: dataType, id: string | null, data: object) => type == 'global' ? cache[type] = data : (cache[type] ??= {}, cache[type][id] = data)

const isDataType = string => ['global', 'guild', 'user', 'dm'].includes(string);

export function getData(type: dataType, id: string | null, path: string[], useCache: boolean = true): Object | null {
  if (!isDataType(type)) throw TypeError(`'${type}' is not a data type.`)
  if ((type != 'global' && id == null)) return null;

  let dirname= './data' + (type != 'global' ? `/${type}` : '');
  let fileName = dirname + '/' + (type != 'global' ? id : 'global') + '.json';

  let data: object = (useCache ? getCache(type, id) : null) ?? (fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName).toString()) : {})
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

  if (useCache && value != undefined) value = JSON.parse(JSON.stringify(value));
  return value;
}

export function setData(type: dataType, id: string | null, path: string[], value: any, calc: operatorString | ((old: Object | null, val: Object | null) => Object | null) | null = null, useCache: boolean = true): void {
  if (!isDataType(type)) throw TypeError(`'${type}' is not a data type.`)
  if ((type != 'global' && id == null)) return;

  let dirname = './data' + (type != 'global' ? `/${type}` : '');
  let fileName = dirname + '/' + (type != 'global' ? id : 'global') + '.json';

  let data: object = (useCache ? getCache(type, id) : null) ?? (fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName).toString()) : {})
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

  if (useCache) setCache(type, id, data);
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);
  fs.writeFileSync(fileName, JSON.stringify(data));
}

export function deleteData(type: dataType, id: string | null, path: string[], useCache: boolean = true): void {
  if (!isDataType(type)) throw TypeError(`'${type}' is not a data type.`)
  if ((type != 'global' && id == null)) return;

  let dirname = './data' + (type != 'global' ? `/${type}` : '');
  let fileName = dirname + '/' + (type != 'global' ? id : 'global') + '.json';

  let data: object = (useCache ? getCache(type, id) : null) ?? (fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName).toString()) : {})
  let parent = data;
  path.forEach((key, i) => {
    if (i == path.length - 1) delete parent[key];
    else {
      if (parent[key] == null) return;
      parent = parent[key];
    }
  });

  if (useCache) setCache(type, id, data);
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);
  fs.writeFileSync(fileName, JSON.stringify(data));
}
