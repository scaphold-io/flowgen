/* @flow */
import type { RawNode } from './node';
import Node from './node';

import printers from '../printers';

export default class ExportDeclaration extends Node {
  constructor(node: RawNode) {
    super(node);
  }

  print() {
    return printers.declarations.exportDeclaration(this.raw);
  }
}
