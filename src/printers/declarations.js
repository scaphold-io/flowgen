/* @flow */
import type { RawNode } from '../nodes/node';

import printers from './index';

export const variableDeclaration = (node: RawNode) => {
  const declarations = node.declarationList.declarations
    .map(printers.node.printType).join(' ');

  return `declare ${printers.relationships.exporter(node)}var ${declarations};`;
}

export const interfaceType = (node: RawNode, withSemicolons: boolean = false) => {
  let members = node.members
    .map(member => {
      const printed = printers.node.printType(member);

      if (!printed) {
        return null;
      }

      let str = '\n';

      if (member.jsDoc) {
        str += printers.common.comment(member.jsDoc);
      }

      return str + printed;
    })
    .filter(Boolean) // Filter rows which didnt print propely (private fields et al)
    .join(withSemicolons ? ';' : ',');

  if (members.length > 0) {
    members += '\n';
  }

  return `{${members}}`;
}

export const interfaceDeclaration = (nodeName: string, node: RawNode) => {
  let heritage = '';

  // If the class is extending something
  if (node.heritageClauses) {
    heritage = node.heritageClauses.map(clause => {
      return clause.types
              .map(type => printers.relationships.namespaceProp(type.expression.text, true))
              .join(' & ')
    }).join('');
    heritage = heritage.length > 0 ? `& ${heritage}\n` : '';
  }

  const type = node.heritageClauses ? 'type' : 'interface'

  let str = `${printers.relationships.exporter(node)}${type} ${nodeName}${printers.common.generics(node.typeParameters)} ${type === 'type' ? '= ' : ''}${interfaceType(node)} ${heritage}`;

  return str;
}

export const typeDeclaration = (nodeName: string, node: RawNode) => {
  let str = `${printers.relationships.exporter(node)}type ${nodeName}${printers.common.generics(node.typeParameters)} = ${printers.node.printType(node.type)};`;

  return str;
}

export const typeReference = (node: RawNode) => {
  if (node.typeName.left && node.typeName.right) {
    return printers.node.printType(node.typeName) + printers.common.generics(node.typeArguments);
  }

  return printers.relationships.namespaceProp(node.typeName.text, true) + printers.common.generics(node.typeArguments)
}

export const classDeclaration = (node: RawNode) => {
  let heritage = '';

  // If the class is extending something
  if (node.heritageClauses) {
    heritage = node.heritageClauses.map(clause => {
      return clause.types.map(printers.node.printType).join(', ')
    }).join(', ');
    heritage = heritage.length > 0 ? `mixins ${heritage}` : '';
  }

  let str = `declare ${printers.relationships.exporter(node)}class ${node.name.text}${printers.common.generics(node.typeParameters)} ${heritage} ${interfaceType(node, true)}`;

  return str;
}

export const exportDeclaration = (node: RawNode) => {

  let str = 'export ';
  if (node.exportClause) {
    str += '{ ' +
      node.exportClause.elements.map(elem => elem.name.text).join(', ') +
      ' }'
  } else {
    str += '*'
  }
  str += ' from '
  if (node.moduleSpecifier) {
    str += '\'' + node.moduleSpecifier.text + '\''
  }
  str += ';'
  return str
}

export const importDeclaration = (node: RawNode) => {
  debugger
  let str = 'import ';
  const ic = node.importClause
  if (ic) {
    const nb = ic.namedBindings
    if (ic.namedBindings) {
      if (nb.kind === 'NamedImports') {
        str += '{ ' + nb.elements.map(e => e.name.text).join(', ') + ' }'
      } else if (nb.kind === 'NamespaceImport') {
        str += '* as ' + ic.namedBindings.name.text
      }
    } else {
      str += ic.name.text
    }
  } else {
    str += '*'
  }
  str += ' from '
  if (node.moduleSpecifier) {
    str += '\'' + node.moduleSpecifier.text + '\''
  }
  str += ';'
  return str
}
