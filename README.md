# AngularJS work with RequireJS through AngularAMD

AngularAMD 是一個讓 AngularJS 能夠使用 requirejs 的工具，支援自定載入第三方模組，例如 [angular-ui](http://angular-ui.github.io)，其中的 UI-Router 幾乎是 AngularJS 必備模組 。

安裝
==========

### bower
    bower install angularAMD --save

### cdn
    //cdn.jsdelivr.net/angular.amd/0.1.1/angularAMD.min.js

_*Note*: 

1. 在專案目錄下利用 `.bowerrc` 寫入 `{ "directory": "lib" }` 可以讓 bower 的套件安裝到 `lib` 目錄，而不是預設的 `bower_components`，比較好使用。
2. Release Candidate versions not distributed._

使用方法
==========

使用 RequireJS 的基礎，就是 index.html 只載入一行 script，剩下的事都交給 requirejs 處理。

```
<script src=".../require.js" data-main="js/main.js"></script>
```

最重要的是要規劃、搞清楚路徑。

### RequireJS data-main

起始點就是 `main.js`，會使用的元件與其相依性都在其中定義，使用  `deps` 叫用 `app.js`：

```Javascript
require.config({
    baseUrl: "js",
    paths: {
        'angular': '//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.min',
        'angularAMD': 'lib/angularAMD.min',
        'ngload': 'lib/ngload.min'
    },
    shim: {
        'angularAMD': ['angular'],
        'ngload': ['angularAMD']
    },    
    deps: ['app']
});
```

### Bootstrapping AngularJS

在 `main.js` 中寫完路徑、要使用的模組，下一步就是使用 `app.js` 來建立 AngularJS 應用程式並進行初始化（bootstrap）。

```Javascript
define(['angularAMD'], function (angularAMD) {
    var app = angular.module(app_name, ['webapp']);
    ... // Setup app here. E.g.: run .config with $routeProvider
    return angularAMD.bootstrap(app);
});
```

採用手動方式初始化（bootstrap） AngularJS，因此不需要在 HTML 文件中使用 `ng-app`，`angularAMD.bootstrap(app);` 會處理好初始化 AngularJS 的工作。

ps. 因此使用這個方式，就等同于把整個 HTML 都交給 AngularJS 管理，而無法採用在區塊標籤中整合使用 AngularJS 的模式？

### On-Demand Loading of Controllers

Use `angularAMD.route` when configuring routes using `$routeProvider` to enable on-demand loading of controllers:

```Javascript
app.config(function ($routeProvider) {
    $routeProvider.when(
        "/home",
        angularAMD.route({
            templateUrl: 'views/home.html',
            controller: 'HomeController',
            controllerUrl: 'scripts/controller.js'
        })
    );
});
```

The primary purpose of `angularAMD.route` is set `.resolve` property to load controller using `require` statement.
Any attribute you pass into this method will simply be returned, with exception of `controllerUrl`. 

#### route without `controllerUrl`

You can avoid passing of `controllerUrl` if you define it in your `main.js` as:

```Javascript
paths: { 'HomeController': 'scripts/controller' }
```


#### route without `controller`

When `controller` option is omitted, `angularAMD.route` assume that a function will be returned from the module defined
by `controllerUrl`.  As result, you can avoid giving an explicit name to your controller by doing:

```Javascript
define(['app'], function (app) {
    return ["$scope", function ($scope) {
        ...
    }];
});
```


### Creating a Module

All subsequent module definition would simply need to require `app` to create desired AngularJS services:

```Javascript
define(['app'], function (app) {
    app.factory('Pictures', function (...) {
        ...
    });
});
```

Here is the list of methods supported:

* `.provider` **
* `.controller`
* `.factory`
* `.service`
* `.constant`
* `.value`
* `.directive`
* `.filter`
* `.animation`

** Only as of 0.2.x

#### Loading Application Wide Module

正常來說，適用於應用程式的廣泛功能面，都被包裝成獨立模組，以依賴套件模式添加到你的 `app` 即可，例如第三方套件 [ui-bootstrap](http://angular-ui.github.io/bootstrap/) 就是個好例子。但是，該怎麼建立、使用一個單獨的指令（directive）？ `angularAMD` 簡化這類功能，藉由探索一個元件食譜（exposing the provider recipe）來達到，像是這樣：

**directive/navMenu.js**
```Javascript
define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('navMenu', function (...) {
        ...
    });
});
```

**app.js**
```Javascript
define(['angularAMD', 'directive/navMenu'], function (angularAMD) {
    var app = angular.module(app_name, ['webapp']);
    ...
    // `navMenu` is automatically registered bootstrap 
    return angularAMD.bootstrap(app);
});
```

以上面的例子來說， `angularAMD.directive`（在 `directive/navMenu.js` 之中） 會偵測到 AngularJS 還沒有初始化，於是把建立指令的要求指向 `app` 物件，送給 `angularAMD.bootstrap`。若是已經初始化了，它使用起來就與一般的 `app.directive` 相同。也就是說，使用 `angularAMD.<<recipe>>` 建立的服務在初始化之前與之後都可以載入。

### 3rd Party AngularJS Modules

第三方 AngularJS 模組（module），也就是任何使用 `angular.module` 語法建立的模組，可以像一般的 JavaScript 檔案，在 `angularAMD.bootstrap` 被呼叫之前載入。在 AngularJS 應用程式已經初始化完成，任何 AngularJS 模組都必須使用 `ngload` RequireJS plugin。

```Javascript
define(['app', 'ngload!dataServices'], function (app) {...});
```

萬一你需要使用 RequireJS plugin 載入模組，或是有比較複雜的依賴套件，你可以建立一個 RequireJS 模組來使用，像下面這樣：

```Javascript
define(['angularAMD', 'ui-bootstrap'], function (angularAMD) {
    angularAMD.processQueue();
});
```

在這個例子中，所有的相依套件會被排程，直到 `.processQueue()` 被呼叫，就會使用 `app.register` 加入排程並拷貝相依套件到目前的 app 中。

#### Module without `.run` or `.config`

若是你自己的模組，沒有使用 `.run` 或 `.config`

If you have your own module that does not use `.run` or `.config`, you can avoid the use of `ngload` as any module
created after bootstrap will support on-demand loading.  For example:

**common.js**
```Javascript
define(['ngload!restangular'], function() {
    return angular.module('common', ['restangular']);
});
```

**user.js**
```Javascript
define(['common'], function(common) {
    common.factory("User", function () { ... });
});
```

**controller/home_ctrl**
```Javascript
define(['app', 'user'], function(app) {
    app.controller("HomeCtrl", ["$scope", "User", function ($scope, User) {
        ...
    }]);
});
```

In this example, the `user` package does not need to be loaded in the `app.js` as it's loaded on demand when `HomeCtrl` is called.

Running Sample Project
==========

Prerequisites:
* node and npm
* grunt-cli installed globally as per [Grunt Getting started](http://gruntjs.com/getting-started).

Run the following command after cloning this project:

```bash
npm install
grunt build
grunt serve-www
```
* The default build will test angularAMD using following browsers: 'PhantomJS', 'Chrome' and 'Firefox'

History
==========
This project was inpired by [Dan Wahlin's blog](http://weblogs.asp.net/dwahlin/archive/2013/05/22/dynamically-loading-controllers-and-views-with-angularjs-and-requirejs.aspx)
where he explained the core concept of what is needed to make RequireJS works with AngularJS.  It is a *must* read
if you wish to better understand implementation detail of `angularAMD`.

As I started to implement RequireJS in my own project, I got stuck trying to figure out how to load my existing modules
without re-writting them.  After exhausive search with no satisfactory answer, I posted following question on 
[StackOverflow](http://stackoverflow.com/questions/19134023/lazy-loading-angularjs-modules-with-requirejs).
[Nikos Paraskevopoulos](http://stackoverflow.com/users/2764255/nikos-paraskevopoulos) was kind enough to share his
solution with me but his implementation did not handle `.config` method calls and out of order definition in modules.
However, his implementation gave me the foundation I needed to create `angularAMD` and his project is where the idea
for `alt_angular` came from.


References
==========

* [Dynamically Loading Controllers and Views with AngularJS and RequireJS](http://weblogs.asp.net/dwahlin/archive/2013/05/22/dynamically-loading-controllers-and-views-with-angularjs-and-requirejs.aspx) by Dan Wahlin
* [Dependency Injection using RequireJS & AngularJS](http://solutionoptimist.com/2013/09/30/requirejs-angularjs-dependency-injection/) by Thomas Burleson
* [Lazy loading AngularJS modules with RequireJS](http://stackoverflow.com/questions/19134023/lazy-loading-angularjs-modules-with-requirejs) stackoverflow
* [angular-require-lazy](https://github.com/nikospara/angular-require-lazy) by Nikos Paraskevopoulos