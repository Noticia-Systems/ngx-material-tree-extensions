import { TestBed } from '@angular/core/testing';

import { TreeNodeService } from './tree-node.service';
import { ITreeNode } from "../interfaces/itree-node";
import { every } from "lodash-es";

interface Node extends ITreeNode<Node> {
  name: string;
}

/**
 * Tests for the {@link TreeNodeService}.
 */
describe('TreeTableNodeService', () => {

  // #region Fields

  let service: TreeNodeService<Node>;

  // #endregion

  // #region Setup

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject<TreeNodeService<Node>>(TreeNodeService);

    service.data = [
      {
        name: 'TestA',
        children: [
          {
            name: 'TestB',
            children: [
              {
                name: 'TestC'
              }
            ]
          }
        ]
      }
    ];
  });

  // #endregion

  // #region Methods

  describe('hasChildren', () => {
    it('should find children if node has some', () => {
      let flatNode = service.treeControl.dataNodes[0];

      expect(service.hasChildren(0, flatNode)).toBeTrue();
    });

    it('should not find children if node has no children', () => {
      let flatNode = service.treeControl.dataNodes[2];

      expect(service.hasChildren(2, flatNode)).toBeFalse();
    });
  });

  describe('isRoot', () => {
    it('should be root if node is root', () => {
      let flatNode = service.treeControl.dataNodes[0];

      expect(service.isRoot(0, flatNode)).toBeTrue();
    });

    it('should not be root if node is subnode', () => {
      let flatNode = service.treeControl.dataNodes[2];

      expect(service.isRoot(2, flatNode)).toBeFalse();
    });
  });

  describe('insertChild', () => {
    it('should add child', () => {
      const expectedData = [
        {
          name: 'TestA',
          children: [
            {
              name: 'TestB',
              children: [
                {
                  name: 'TestC'
                },
                {
                  name: 'TestD'
                }
              ]
            }
          ]
        }
      ];

      const node = {name: 'TestD'};

      service.insertChild(service.treeControl.dataNodes[1].node, node);

      expect(service.data).toEqual(expectedData);
    });
  });

  describe('insertBefore', () => {
    it('should insert before', () => {
      const expectedData = [
        {
          name: 'TestA',
          children: [
            {
              name: 'TestB',
              children: [
                {
                  name: 'TestD'
                },
                {
                  name: 'TestC'
                }
              ]
            }
          ]
        }
      ];

      const node = {name: 'TestD'};

      service.insertBefore(service.treeControl.dataNodes[2].node, node);

      expect(service.data).toEqual(expectedData);
    });
  });

  describe('insertAfter', () => {
    it('should insert after', () => {
      const expectedData = [
        {
          name: 'TestA',
          children: [
            {
              name: 'TestB',
              children: [
                {
                  name: 'TestC'
                },
                {
                  name: 'TestD'
                }
              ]
            }
          ]
        }
      ];

      const node = {name: 'TestD'};

      service.insertAfter(service.treeControl.dataNodes[2].node, node);

      expect(service.data).toEqual(expectedData);
    });
  });

  describe('getParent', () => {
    it('should find parent', () => {
      const parent = service.getParent(service.treeControl.dataNodes[2].node);

      expect(parent).toEqual(service.treeControl.dataNodes[1].node);
    });

    it('should return null if no parent', () => {
      const parent = service.getParent({name: "TestZ"});

      expect(parent).toBeNull();
    });
  });

  describe('isParentExpanded', () => {
    it('should return true if parent node expanded', () => {
      service.treeControl.expand(service.treeControl.dataNodes[1]);

      expect(service.isParentExpanded(service.treeControl.dataNodes[2].node)).toBeTrue();
    });

    it('should return false if parent node not expanded', () => {
      service.treeControl.collapse(service.treeControl.dataNodes[1]);

      expect(service.isParentExpanded(service.treeControl.dataNodes[2].node)).toBeFalse();
    });

    it('should return false if parent node not found', () => {
      expect(service.isParentExpanded({} as Node)).toBeFalse();
    });
  });

  describe('update', () => {
    it('should push new data to subject', (done) => {
      const newData = [
        {
          name: 'TestA',
          children: [
            {
              name: 'TestB',
              children: [
                {
                  name: 'TestC'
                },
                {
                  name: 'TestD'
                }
              ]
            }
          ]
        }
      ];

      service.data$.subscribe(data => {
        expect(data).toEqual(newData);
        done();
      });

      service.data = newData;
    });
  });

  describe('delete', () => {
    it('should remove given node', () => {
      const expectedData = [
        {
          name: 'TestA',
          children: [
            {
              name: 'TestB',
              children: []
            }
          ]
        }
      ];

      service.delete(service.treeControl.dataNodes[2].node);

      expect(service.data).toEqual(expectedData);
    });

    it('should not modify data when node not found', () => {
      const expectedData = [
        {
          name: 'TestA',
          children: [
            {
              name: 'TestB',
              children: [
                {
                  name: 'TestC'
                }
              ]
            }
          ]
        }
      ];

      service.delete({name: "TestZ"});

      expect(service.data).toEqual(expectedData);
    });
  });


  describe('cloneAsChild', () => {
    it('should add child', () => {
      const expectedData = [
        {
          name: 'TestA',
          children: [
            {
              name: 'TestB',
              children: [
                {
                  name: 'TestC'
                },
                {
                  name: 'TestC'
                }
              ]
            }
          ]
        }
      ];

      service.cloneAsChild(service.treeControl.dataNodes[2].node, service.treeControl.dataNodes[1].node);

      expect(service.data).toEqual(expectedData);
    });
  });

  describe('cloneAsSiblingAfter', () => {
    it('should add sibling', () => {
      const expectedData = [
        {
          name: 'TestA',
          children: [
            {
              name: 'TestB',
              children: [
                {
                  name: 'TestC'
                },
                {
                  name: 'TestC'
                }
              ]
            }
          ]
        }
      ];

      service.cloneAsSiblingAfter(service.treeControl.dataNodes[2].node, service.treeControl.dataNodes[2].node);

      expect(service.data).toEqual(expectedData);
    });
  });

  describe('cloneAsSiblingBefore', () => {
    it('should add sibling', () => {
      const expectedData = [
        {
          name: 'TestA',
          children: [
            {
              name: 'TestB',
              children: [
                {
                  name: 'TestC'
                },
                {
                  name: 'TestC'
                }
              ]
            }
          ]
        }
      ];

      service.cloneAsSiblingBefore(service.treeControl.dataNodes[2].node, service.treeControl.dataNodes[2].node);

      expect(service.data).toEqual(expectedData);
    });
  });

  describe('isSibling', () => {
    it('should be true when sibling', () => {
      const data = [
        {
          name: 'TestA',
          children: [
            {
              name: 'TestB',
              children: [
                {
                  name: 'TestC'
                },
                {
                  name: 'TestD'
                }
              ]
            }
          ]
        }
      ];

      service.data = data;

      expect(service.isSibling(service.treeControl.dataNodes[2].node, service.treeControl.dataNodes[3].node)).toBeTrue();
    });

    it('should be false when not sibling', () => {
      expect(service.isSibling(service.treeControl.dataNodes[1].node, service.treeControl.dataNodes[2].node)).toBeFalse();
    });
  });

  describe('getNodePath', () => {
    it('should get correct node path', () => {
      expect(service.getNodePath(service.treeControl.dataNodes[2].node).map(node => node.name)).toEqual(['TestA', 'TestB', 'TestC']);
    });
  });

  describe('transformer', () => {
    it('should get flat node', () => {
      let flatNode = service.transformer({name: "test"}, 0);

      expect(flatNode.node.name).toEqual("test");
      expect(flatNode.level).toBe(0);
    });
  });

  describe('toggleNode', () => {
    it('should expand node path', () => {
      service.toggleNode(service.treeControl.dataNodes[2]);

      expect(service.treeControl.isExpanded(service.treeControl.dataNodes[2])).toBeTrue();
      expect(service.treeControl.isExpanded(service.treeControl.dataNodes[1])).toBeTrue();
      expect(service.treeControl.isExpanded(service.treeControl.dataNodes[0])).toBeTrue();
    });

    it('should collapse node but keep parents expanded', () => {
      service.toggleNode(service.treeControl.dataNodes[2]);
      service.toggleNode(service.treeControl.dataNodes[2]);

      expect(service.treeControl.isExpanded(service.treeControl.dataNodes[2])).toBeFalse();
      expect(service.treeControl.isExpanded(service.treeControl.dataNodes[1])).toBeTrue();
      expect(service.treeControl.isExpanded(service.treeControl.dataNodes[0])).toBeTrue();
    });
  });

  describe('expandLevel', () => {
    it('should expand level', () => {
      service.expandLevel(0);

      expect(service.treeControl.isExpanded(service.treeControl.dataNodes[0])).toBeTrue();
    });
  });

  // #endregion

});
