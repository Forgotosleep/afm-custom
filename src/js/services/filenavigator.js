(function(angular) {
    'use strict';
    angular.module('FileManagerApp').service('fileNavigator', [
        'apiMiddleware', 'fileManagerConfig', 'item', function (ApiMiddleware, fileManagerConfig, Item) {

        var FileNavigator = function() {
            this.apiMiddleware = new ApiMiddleware();
            this.requesting = false;
            this.fileList = [];
            this.currentPath = this.getBasePath();
            this.history = [];
            this.error = '';
            this.currentParentId = fileManagerConfig.defaultParentId;  // Placeholder value, should get from last fetched LS or initial Parent ID
            this.currentSiteId = fileManagerConfig.defaultSiteId;  // same as above
            this.parentIdTree = [];  // default is similar to fileList and path, an empty array

            this.onRefresh = function() {};
        };

        FileNavigator.prototype.getBasePath = function() {
            var path = (fileManagerConfig.basePath || '').replace(/^\//, '');
            return path.trim() ? path.split('/') : [];
        };

        FileNavigator.prototype.deferredHandler = function(data, deferred, code, defaultMsg) {
            if (!data || typeof data !== 'object') {
                this.error = 'Error %s - Bridge response error, please check the API docs or this ajax response.'.replace('%s', code);
            }
            if (code == 404) {
                this.error = 'Error 404 - Backend bridge is not working, please check the ajax response.';
            }
            if (code == 200) {
                this.error = null;
            }
            if (!this.error && data.result && data.result.error) {
                this.error = data.result.error;
            }
            if (!this.error && data.error) {
                this.error = data.error.message;
            }
            if (!this.error && defaultMsg) {
                this.error = defaultMsg;
            }
            if (this.error) {
                return deferred.reject(data);
            }
            return deferred.resolve(data);
        };

        // FileNavigator.prototype.list = function() {
        //     return this.apiMiddleware.list(this.currentPath, this.deferredHandler.bind(this));
        // };

        FileNavigator.prototype.list = function() {
            return this.apiMiddleware.list(this.currentSiteId, this.currentParentId, this.deferredHandler.bind(this));
        };

        FileNavigator.prototype.refresh = function() {
            var self = this;
            if (! self.currentPath.length) {
                self.currentPath = this.getBasePath();
            }
            var path = self.currentPath.join('/');
            self.requesting = true;
            self.fileList = [];
            return self.list().then(function(data) {
                self.fileList = (data.result || []).map(function(file) {
                    return new Item(file, self.currentPath);
                });
                self.buildTree(path);
                self.onRefresh();
            }).finally(function() {

                // console.log('THIS IS FILE NAVIGATOR FINALLY FROM REFRESH');
                // console.log('Current Path: ', self.currentPath);
                // console.log('File List: ', self.fileList);
                // console.log('Current Parent ID: ', self.currentParentId);
                // console.log('Current Site ID: ', self.currentSiteId);
                // console.log('Parent ID Tree: ', self.parentIdTree);

                self.requesting = false;
            });
        };
        
        FileNavigator.prototype.buildTree = function(path) {
            var flatNodes = [], selectedNode = {};

            function recursive(parent, item, path) {
                var absName = path ? (path + '/' + item.model.name) : item.model.name;
                if (parent.name && parent.name.trim() && path.trim().indexOf(parent.name) !== 0) {
                    parent.nodes = [];
                }
                if (parent.name !== path) {
                    parent.nodes.forEach(function(nd) {
                        recursive(nd, item, path);
                    });
                } else {
                    for (var e in parent.nodes) {
                        if (parent.nodes[e].name === absName) {
                            return;
                        }
                    }
                    parent.nodes.push({item: item, name: absName, nodes: []});
                }
                
                parent.nodes = parent.nodes.sort(function(a, b) {
                    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() === b.name.toLowerCase() ? 0 : 1;
                });
            }

            function flatten(node, array) {
                array.push(node);
                for (var n in node.nodes) {
                    flatten(node.nodes[n], array);
                }
            }

            function findNode(data, path) {
                return data.filter(function (n) {
                    return n.name === path;
                })[0];
            }

            //!this.history.length && this.history.push({name: '', nodes: []});
            !this.history.length && this.history.push({ name: this.getBasePath()[0] || '', nodes: [] });
            flatten(this.history[0], flatNodes);
            selectedNode = findNode(flatNodes, path);
            selectedNode && (selectedNode.nodes = []);

            for (var o in this.fileList) {
                var item = this.fileList[o];
                item instanceof Item && item.isFolder() && recursive(this.history[0], item, path);
            }
        };

        FileNavigator.prototype.folderClick = function(item) {
            this.currentPath = [];
            // console.log('This is FILENAVIGATOR folderClick');
            // console.log('ITEM: ', item);

            if (item && item.isFolder()) {
                this.currentSiteId = item.model.site_id;
                this.currentParentId = item.model.id;
                this.parentIdTree = item.model.parent_ids;
                if(this.currentParentId != this.parentIdTree[this.parentIdTree.length - 1]) this.parentIdTree.push(item.model.id);  // Prevents duplicates being added to parentIdTree
                this.currentPath = item.model.fullPath().split('/').splice(1);
            } else if(item === undefined) {
                this.currentParentId = fileManagerConfig.defaultParentId;
            }
            this.refresh();
        };

        FileNavigator.prototype.upDir = function() {
            // console.log('This is FILENAVIGATOR upDir');

            if (this.currentPath[0]) {
                this.currentParentId = this.parent_id;
                this.currentPath = this.currentPath.slice(0, -1);
                this.refresh();
            }
        };

        FileNavigator.prototype.goTo = function(index) {
            // console.log('This is FILENAVIGATOR goTo');
            this.currentParentId = this.parentIdTree[this.parentIdTree.length - 1];
            this.currentPath = this.currentPath.slice(0, index + 1);
            this.refresh();
        };

        FileNavigator.prototype.fileNameExists = function(fileName) {
            return this.fileList.find(function(item) {
                return fileName && item.model.name.trim() === fileName.trim();
            });
        };

        FileNavigator.prototype.listHasFolders = function() {
            return this.fileList.find(function(item) {
                return item.model.type === 'dir';
            });
        };

        FileNavigator.prototype.getCurrentFolderName = function() {
            return this.currentPath.slice(-1)[0] || '/';
        };

        return FileNavigator;
    }]);
})(angular);
