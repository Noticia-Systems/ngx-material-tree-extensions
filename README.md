[![Node.js Package](https://github.com/Noticia-Systems/ngx-material-tree-extensions/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/Noticia-Systems/ngx-material-tree-extensions/actions/workflows/npm-publish.yml) [![Node.js CI](https://github.com/Noticia-Systems/ngx-material-tree-extensions/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/Noticia-Systems/ngx-material-tree-extensions/actions/workflows/node.js.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

ngx-material-tree-extensions adds a service wrapper for Material trees and provides several useful extension methods for
manipulating the trees.

This package is used for flat Material trees, as they are generally more simple to work with and provide additional
information (like the current level).

## Installation

``npm install @noticia-systems/ngx-material-tree-extensions``

## Usage

Define an interface representing a single node that shall be displayed in your tree:

```typescript
export interface DemoNode extends ITreeNode<DemoNode> {
  name: string;
}
```

Your node has to extend ```ITreeNode<TTreeNode>```!

In your component displaying the tree inject the ```TreeNodeService<TTreeNode>```:

```typescript
constructor(public treeNodeService: TreeNodeService<DemoNode>)
{
}
```

You can set the initial data of the tree by setting the data property:

```typescript
treeNodeService.data = demoNodes;
```

Where ```demoNodes``` is an array of ``DemoNode``.

For simplicity an observable of the data is available:

```typescript
treeNodeService.data$
```

Within the template of your component, the following allows for correct use of the ``TreeNodeService<TTreeNode>``:

```angular2html

<mat-tree [dataSource]="treeNodeService.dataSource" [treeControl]="treeNodeService.treeControl">
  <mat-tree-node *matTreeNodeDef="let flatNode">
    ...
  </mat-tree-node>
</mat-tree>
```

``flatNode.node`` allows accessing the underlying ``DemoNode``. ``flatNode.level`` and ``flatNode.expandable`` indicate the current depth of the tree node and the existence of children on the node respectively.

``TreeNodeService<TTreeNode>`` provides several methods for manipulating and retrieving information about the tree. Please refer to the wiki for more documentation about these methods.
