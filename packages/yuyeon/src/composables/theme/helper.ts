export function cssClass(selector: string, content: string[]) {
  return [`${selector} {\n`, ...content.map((c) => `  ${c}\n`), `}\n`];
}

export function cssVariables(
  variables: Record<string, string>,
  prefix: string = '',
) {
  return Object.entries(variables).map(([property, value]) => {
    return cssVariable(`${prefix}-${property}`, value);
  });
}

export function cssVariable(property: string, value: string) {
  return `--y-${property}: ${value};`;
}
