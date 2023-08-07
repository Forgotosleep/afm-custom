(function(angular) {
    'use strict';
    angular.module('FileManagerApp').factory('item', ['fileManagerConfig', 'chmod', function(fileManagerConfig, Chmod) {

        var Item = function(model, path) {
            var rawModel = {
                id: model && model.id || 0,
                name: model && model.name || '',
                path: path || [],
                type: model && model.type || 'file',
                mime_types: model && model.mime_types || '',
                size: model && parseInt(model.size || 0),
                date: parseMySQLDate(model && model.date) || '',
                perms: new Chmod(model && model.rights),
                content: model && model.content || '',
                recursive: false,
                fullPath: function() {
                    // console.log('Item FULLPATH is run!');
                    var path = this.path.filter(Boolean);
                    // console.log('Item PATH var: ', path);
                    // console.log(('prcessed: ', ('/' + path.join('/') + '/' + this.name).replace(/\/\//, '/')));
                    return ('/' + path.join('/') + '/' + this.name).replace(/\/\//, '/');
                },
                site_id: model && parseInt(model.site_id) || null,
                parent_id: model && parseInt(model.parent_id) || null,
                parent_ids: model.parent_ids && JSON.parse(model.parent_ids) || [],
                last_modified_user_id: model && model.last_modified_user_id || 0,
                last_modified_user_name: model && model.last_modified_user_name || '',
                created_user_id: model && model.created_user_id || 0,
                created_user_name: model && model.created_user_name || '',
            };

            this.error = '';
            this.processing = false;

            this.model = angular.copy(rawModel);
            this.tempModel = angular.copy(rawModel);

            function parseMySQLDate(mysqlDate) {
                if(!mysqlDate) return false;
                var d = (mysqlDate || '').toString().split(/[- :]/);
                return new Date(d[0], d[1] - 1, d[2], d[3], d[4], d[5]);
            }
        };

        Item.prototype.update = function() {
            angular.extend(this.model, angular.copy(this.tempModel));
        };

        Item.prototype.revert = function() {
            angular.extend(this.tempModel, angular.copy(this.model));
            this.error = '';
        };

        Item.prototype.isFolder = function() {
            return this.model.type === 'dir';
        };

        Item.prototype.isEditable = function() {
            return !this.isFolder() && fileManagerConfig.isEditableFilePattern.test(this.model.name);
        };

        Item.prototype.isImage = function() {
            return fileManagerConfig.isImageFilePattern.test(this.model.name);
        };

        Item.prototype.isCompressible = function() {
            return this.isFolder();
        };

        Item.prototype.isExtractable = function() {
            return !this.isFolder() && fileManagerConfig.isExtractableFilePattern.test(this.model.name);
        };

        Item.prototype.isSelectable = function() {
            return (this.isFolder() && fileManagerConfig.allowedActions.pickFolders) || (!this.isFolder() && fileManagerConfig.allowedActions.pickFiles);
        };

        return Item;
    }]);
})(angular);