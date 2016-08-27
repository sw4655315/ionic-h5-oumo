!function(win,undefined) {
    moment.locale("zh-cn");
    /**
     * 初始化数据
     */
    var angularApp = angular.module('axibar', ['ionic','axibar.config','axibar.controller','ngStorage','ionicLazyLoad']);
    angularApp.run(function($sce,$rootScope,$sessionStorage,$ionicModal){
        $rootScope.storage = $sessionStorage;
        $rootScope.moment = moment;
        JSON.parseQuiet = function(str){
            var o = null;
            try{
                o = JSON.parse(str);
            }catch(e){
                return {};
            }
            return o;
        }
        $rootScope.JSON = JSON;
        $rootScope.trustLink = function(_link){
            return $sce.trustAsResourceUrl(_link);
        }
        var ua = navigator.userAgent.toLowerCase();

        $rootScope.qq_wx = /.*(micromessenger| qq\/).*/.test(ua);
    });
}(window);
