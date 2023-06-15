

export function camelToPascal(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toKebabCase(str: string, from: 'camel' | 'pascal' = 'camel') {
  let res = '';
  for (let index = 0; index < str.length; index += 1) {
    const char = str[index];
    const charCode = char.charCodeAt(0);
    if (charCode >= 65 && charCode <= 90) {
      res += `${
        index === 0 && from === 'camel' ? '' : '-'
      }${char.toLowerCase()}`;
    } else {
      res += char;
    }
  }
  return res;
}

export function kebabToCamel(str: string) {
  let res = '';
  let index = 0;
  while (index < str.length) {
    const char = str[index];
    if (char === '-') {
      index += 1;
      res += str[index].toUpperCase();
    } else {
      res += char;
    }
    index += 1;
  }
  return res;
}
