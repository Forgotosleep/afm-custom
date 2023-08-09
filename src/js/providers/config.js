(function(angular) {
    'use strict';
    angular.module('FileManagerApp').provider('fileManagerConfig', function() {
        const baseUrl = 'http://localhost:4001'  // TODO Change this to be moree appropriate for staging & production

        var values = {
            appName: 'angular-filemanager v1.5',
            defaultLang: 'en',
            multiLang: true,

            listUrl: `${baseUrl}/cms`,
            uploadUrl: `${baseUrl}/upload`,
            renameUrl: `${baseUrl}/`,
            copyUrl: `${baseUrl}/`,
            moveUrl: `${baseUrl}/`,
            removeUrl: `${baseUrl}/`,
            editUrl: `${baseUrl}/`,
            getContentUrl: `${baseUrl}/`,
            createFolderUrl: `${baseUrl}/`,
            downloadFileUrl: `${baseUrl}/dl`,
            downloadMultipleUrl: `${baseUrl}/dl`,
            compressUrl: `${baseUrl}/`,
            extractUrl: `${baseUrl}/`,
            permissionsUrl: `${baseUrl}/`,
            basePath: '/',
            defaultParentId: null,    // TODO Change this to be dynamic and loaded from PolBo
            defaultSiteId: 1,  // TODO Change this to be dynamic and loaded from PolBo
            

            searchForm: true,
            sidebar: true,
            breadcrumb: true,
            allowedActions: {
                upload: true,
                rename: true,
                move: true,
                copy: true,
                edit: true,
                changePermissions: true,
                compress: true,
                compressChooseName: true,
                extract: true,
                download: true,
                downloadMultiple: true,
                preview: true,
                remove: true,
                createFolder: true,
                pickFiles: false,
                pickFolders: false
            },

            multipleDownloadFileName: 'angular-filemanager.zip',
            filterFileExtensions: [],
            showExtensionIcons: true,
            showSizeForDirectories: false,
            useBinarySizePrefixes: false,
            downloadFilesByAjax: true,
            previewImagesInModal: true,
            enablePermissionsRecursive: true,
            compressAsync: false,
            extractAsync: false,
            pickCallback: null,

            isEditableFilePattern: /\.(txt|diff?|patch|svg|asc|cnf|cfg|conf|html?|.html|cfm|cgi|aspx?|ini|pl|py|md|css|cs|js|jsp|log|htaccess|htpasswd|gitignore|gitattributes|env|json|atom|eml|rss|markdown|sql|xml|xslt?|sh|rb|as|bat|cmd|cob|for|ftn|frm|frx|inc|lisp|scm|coffee|php[3-6]?|java|c|cbl|go|h|scala|vb|tmpl|lock|go|yml|yaml|tsv|lst)$/i,
            isImageFilePattern: /\.(jpe?g|gif|bmp|png|svg|tiff?)$/i,
            isExtractableFilePattern: /\.(gz|tar|rar|g?zip)$/i,
            tplPath: 'src/templates'
        };

        return {
            $get: function() {
                return values;
            },
            set: function (constants) {
                angular.extend(values, constants);
            }
        };

    });
})(angular);
