import _ from 'lodash';

const specSymLength = 2;
const indentSymbol = ' ';
const spaceCount = 4;

const stringifyObject = (object, depth) => {
  const indentSize = depth * spaceCount;
  const bracketIndent = indentSymbol.repeat(indentSize - spaceCount);
  const keys = Object.keys(object);
  const lines = keys.map((key) => {
    if (_.isObject(object[key])) {
      return `${indentSymbol.repeat(indentSize)}${key}: ${stringifyObject(object[key], depth + 1)}`;
    }
    return `${indentSymbol.repeat(indentSize)}${key}: ${object[key]}`;
  });

  return ['{', ...lines, `${bracketIndent}}`].join('\n');
};

const getSpecialSymbol = (node) => {
  const { status } = node;
  switch (status) {
    case 'added':
      return '+ ';
    case 'deleted':
      return '- ';
    case 'unchanged':
      return '  ';
    case 'nested':
      return '  ';
    case 'changed':
      return ['- ', '+ '];
    default:
      throw new Error(`Uncorrect status: '${status}'!`);
  }
};

const genLineFromStatusChanged = (node, depth, symbol) => {
  const indentSize = depth * spaceCount;
  const { oldValue, newValue, key } = node;
  const value = symbol === '- ' ? oldValue : newValue;
  if (_.isObject(value)) {
    return `${indentSymbol.repeat(indentSize - specSymLength)}${symbol}${key}: ${stringifyObject(value, depth + 1)}`;
  }
  return `${indentSymbol.repeat(indentSize - specSymLength)}${symbol}${key}: ${value}`;
};

const genLineFromStatus = (node, depth, symbol) => {
  const indentSize = depth * spaceCount;
  const { key, value } = node;
  if (_.isObject(value)) {
    return `${indentSymbol.repeat(depth * spaceCount - specSymLength)}${symbol}${key}: ${stringifyObject(value, depth + 1)}`;
  }
  return `${indentSymbol.repeat(indentSize - specSymLength)}${symbol}${key}: ${value}`;
};

const stringify = (node, depth) => {
  const { key, status } = node;
  const indentSize = depth * spaceCount;
  const specialSymbol = getSpecialSymbol(node);

  if (status === 'added' || status === 'deleted' || status === 'unchanged') {
    return genLineFromStatus(node, depth, specialSymbol);
  }

  if (status === 'changed') {
    const [minus, plus] = specialSymbol;
    const oldValue = genLineFromStatusChanged(node, depth, minus);
    const newValue = genLineFromStatusChanged(node, depth, plus);
    const lines = [oldValue, newValue].join('\n');
    return lines;
  }

  // status === 'nested'
  const { children } = node;
  const bracketIndent = indentSymbol.repeat(indentSize);
  const lines = children.map((child) => stringify(child, depth + 1));
  const linesWithBrackets = ['{', ...lines, `${bracketIndent}}`].join('\n');
  return `${indentSymbol.repeat(indentSize - specSymLength)}${specialSymbol}${key}: ${linesWithBrackets}`;
};

const stylish = (diff) => {
  const resultedLines = diff.map((child) => stringify(child, 1));
  return ['{', ...resultedLines, '}'].join('\n');
};

export default stylish;
