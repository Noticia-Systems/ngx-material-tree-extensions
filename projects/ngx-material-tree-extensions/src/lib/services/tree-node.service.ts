import { Injectable } from '@angular/core';
import cloneDeep from 'lodash-es/cloneDeep';
import { ITreeNode } from '../interfaces/itree-node';
import { TreeFlatNode } from "../models/tree-flat-node";
import { FlatTreeControl } from "@angular/cdk/tree";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { Observable, Subject } from "rxjs";

/**
 * Provides methods for handling the data within tree tables.
 */
@Injectable({
  providedIn: 'root'
})
export class TreeNodeService<TTreeNode extends ITreeNode<TTreeNode>> {

  // #region Fields

  /**
   * Associations between the nested and flat nodes.
   * @private
   */
  private nodeMap: Map<TTreeNode, TreeFlatNode<TTreeNode>> = new Map;

  /**
   * Holds the tree control.
   */
  public treeControl: FlatTreeControl<TreeFlatNode<TTreeNode>>;

  /**
   * Flattens the nested tree.
   */
  public treeFlattener: MatTreeFlattener<TTreeNode, TreeFlatNode<TTreeNode>>;

  /**
   * Data source for the tree table.
   */
  public dataSource: MatTreeFlatDataSource<TTreeNode, TreeFlatNode<TTreeNode>>;

  /**
   * Underlying tree table data.
   */
  private _data: TTreeNode[] = [];

  /**
   * Subject for observing data changes externally.
   * @private
   */
  private dataSubject: Subject<TTreeNode[]>;

  // #endregion

  // #region Properties

  /**
   * Gets the tree table data.
   */
  get data(): TTreeNode[] {
    return this._data;
  }

  /**
   * Sets the tree table data and notifies the subject.
   */
  set data(treeTableNodes: TTreeNode[]) {
    this._data = treeTableNodes;

    this.update();
  }

  /**
   * Gets an observable that retrieves the data changes.
   */
  get data$(): Observable<TTreeNode[]> {
    return this.dataSubject.asObservable();
  }

  /**
   * Indicates whether a given node has children.
   * @param _ Level of the node.
   * @param node Node to check.
   */
  public hasChildren = (_: number, node: TreeFlatNode<TTreeNode>): boolean => node.expandable;

  /**
   * Checks whether a given node is at root level.
   * @param level Level of the node.
   * @param node Node to check.
   */
  public isRoot = (level: number, node: TreeFlatNode<TTreeNode>): boolean => node.level == 0;

  // #endregion

  // #region Constructors

  /**
   * Initializes a new instance of the TreeNodeService<T> class.
   */
  constructor() {
    this.dataSubject = new Subject<TTreeNode[]>();

    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      flatNode => flatNode.level,
      flatNode => flatNode.expandable,
      node => node.children
    );

    this.treeControl = new FlatTreeControl<TreeFlatNode<TTreeNode>>(
      flatNode => flatNode.level,
      flatNode => flatNode.expandable
    );

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  // #endregion

  // #region Methods

  /**
   * Retrieves the {@link TreeFlatNode} for a given {@link TTreeNode}.
   * @param node {@link TTreeNode} to retrieve {@link TreeFlatNode} for.
   * @returns {@link TreeFlatNode} or undefined.
   */
  getFlatNode(node: TTreeNode): TreeFlatNode<TTreeNode> | undefined {
    return this.nodeMap.get(node);
  }

  /**
   * Inserts a node as a child node.
   * @param parentNode Parent node.
   * @param node Node to insert.
   */
  insertChild(parentNode: TTreeNode, node: TTreeNode) {
    if (!parentNode.children) parentNode.children = [];

    parentNode.children.push(node);
    this.update();
  }

  /**
   * Inserts a node before a sibling node.
   * @param siblingNode Sibling node to insert before to.
   * @param node Node to insert.
   */
  insertBefore(siblingNode: TTreeNode, node: TTreeNode) {
    this._insertSibling(siblingNode, node, 0);
  }

  /**
   * Inserts a node after a sibling node.
   * @param siblingNode Sibling node to insert after to.
   * @param node Node to insert.
   */
  insertAfter(siblingNode: TTreeNode, node: TTreeNode) {
    this._insertSibling(siblingNode, node, 1);
  }

  /**
   * Inserts a node as a sibling at a given position from the sibling node.
   * @param siblingNode Sibling node used as a reference for insertion location.
   * @param node Node to insert.
   * @param index Index to insert to respective to the sibling node location (0 = before).
   */
  private _insertSibling(siblingNode: TTreeNode, node: TTreeNode, index: number) {
    const parentNode = this.getParent(siblingNode);

    if (parentNode !== null && parentNode.children !== undefined) {
      parentNode.children.splice(parentNode.children.indexOf(siblingNode) + index, 0, node);
    } else {
      this._data.splice(this._data.indexOf(siblingNode) + index, 0, node);
    }

    this.update();
  }

  /**
   * Gets the parent node of a given node.
   * @param node Node to find parent for.
   * @returns Parent node for a given node, if existing. Else null.
   */
  getParent(node: TTreeNode): TTreeNode | null {
    for (let rootNode of this._data) {
      let parentNode = this._getParent(node, rootNode);

      if (parentNode !== null) return parentNode;
    }

    return null;
  }

  /**
   * Gets the parent node of a given node.
   * @param node Node to find parent for.
   * @param parentNode Current parent node to scan.
   * @returns Parent node for a given node, if existing. Else null.
   */
  _getParent(node: TTreeNode, parentNode: TTreeNode): TTreeNode | null {
    if (parentNode.children) {
      for (let childNode of parentNode.children) {
        if (childNode === node) {
          return parentNode;
        }

        const childParentNode = this._getParent(node, childNode);

        if (childParentNode !== null) {
          return childParentNode;
        }
      }
    }

    return null;
  }

  /**
   * Checks whether the parent node is expanded.
   * @param node Node of which the parent is checked.
   * @returns Whether parent node is expanded or not.
   */
  isParentExpanded(node: TTreeNode): boolean {
    let parent = this.getParent(node);

    if (parent) {
      let flatNode = this.nodeMap.get(parent);

      if (flatNode) {
        return this.treeControl.isExpanded(flatNode);
      }
    }

    return false;
  }

  /**
   * Updates the behavior subject with the current data.
   */
  update() {
    this.dataSource.data = this._data;
    this.dataSubject.next(this._data);
  }

  /**
   * Deletes a given node.
   * @param node Node to delete.
   */
  delete(node: TTreeNode) {
    this._delete(this._data, node);
    this.update();
  }

  /**
   * Deletes a given node.
   * @param nodes Current nodes to scan for the node.
   * @param node Node to delete.
   */
  _delete(nodes: TTreeNode[], node: TTreeNode) {
    const index = nodes.indexOf(node, 0);

    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      for (let _node of nodes) {
        if (_node.children && _node.children.length > 0) {
          this._delete(_node.children, node);
        }
      }
    }
  }

  /**
   * Clones a node as a child.
   * @param originalNode Node to clone.
   * @param parentNode Node to insert cloned node to.
   * @returns Cloned node.
   */
  cloneAsChild(originalNode: TTreeNode, parentNode: TTreeNode): TTreeNode {
    const clonedNode = cloneDeep(originalNode);

    this.insertChild(parentNode, cloneDeep(originalNode));

    return clonedNode;
  }

  /**
   * Clones a node as a sibling before the sibling node.
   * @param originalNode Node to clone.
   * @param siblingNode Sibling node used as a reference to insert the cloned node before to.
   * @returns Cloned node.
   */
  cloneAsSiblingBefore(originalNode: TTreeNode, siblingNode: TTreeNode): TTreeNode {
    const clonedNode = cloneDeep(originalNode);

    this.insertBefore(siblingNode, clonedNode);

    return clonedNode;
  }

  /**
   * Clones a node as a sibling after the sibling node.
   * @param originalNode Node to clone.
   * @param siblingNode Sibling node used as a reference to insert the cloned node after to.
   * @returns Cloned node.
   */
  cloneAsSiblingAfter(originalNode: TTreeNode, siblingNode: TTreeNode): TTreeNode {
    const clonedNode = cloneDeep(originalNode);

    this.insertAfter(siblingNode, clonedNode);

    return clonedNode;
  }

  /**
   * Checks whether two nodes are siblings.
   * @param node First node.
   * @param sibling Potential sibling node.
   */
  isSibling(node: TTreeNode, sibling: TTreeNode): boolean {
    return this.getParent(node) == this.getParent(sibling);
  }

  /**
   * Retrieves a path containing all parent nodes and the node itself to this specific node.
   * @param node Node a path will be generated for.
   */
  getNodePath(node: TTreeNode): TTreeNode[] {
    let nodePath = [node];
    let parentNode = this.getParent(node);

    while (parentNode !== null) {
      nodePath.push(parentNode);
      parentNode = this.getParent(parentNode);
    }

    return nodePath.reverse();
  }

  /**
   * Applies the transformer on the nested nodes and applies the additional helper fields.
   * @param node Nested node to transform.
   * @param level Level of the nested node.
   * @returns Flat node.
   */
  transformer = (node: TTreeNode, level: number) => {
    const existingNode = this.nodeMap.get(node);

    if (existingNode) {
      existingNode.level = level;
      existingNode.expandable = node.children != null && node.children.length > 0;

      this.nodeMap.set(node, existingNode);

      return existingNode;
    } else {
      const flatNode = new TreeFlatNode<TTreeNode>(
        node,
        node.children != null && node.children.length > 0,
        level);

      //flatNode.level = level;
      //flatNode.expandable = node.children != null && node.children.length > 0;

      this.nodeMap.set(node, flatNode);

      return flatNode;
    }
  }

  /**
   * Toggles a node and its respective node path if required.
   * @param flatNode {@link TreeFlatNode} to toggle.
   */
  public toggleNode(flatNode: TreeFlatNode<TTreeNode>) {
    if (this.treeControl.isExpanded(flatNode)) {
      this.treeControl.collapse(flatNode);
    } else {
      const nodePath = this.getNodePath(flatNode.node);

      for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
        let n = this.treeControl.dataNodes[i];

        if (n === flatNode || nodePath?.includes(n.node)) {
          this.treeControl.expand(n);
        } else {
          this.treeControl.collapse(n);
        }
      }
    }
  }

  /**
   * Expands all nodes of a given level.
   * @param level Level to expand.
   */
  public expandLevel(level: number) {
    for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
      if (this.treeControl.dataNodes[i].level == level) {
        this.treeControl.expand(this.treeControl.dataNodes[i]);
      }
    }
  }

  // #endregion
}


